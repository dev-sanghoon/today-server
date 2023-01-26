const express = require('express');
const mongoose = require('mongoose');
const { marked } = require('marked');
const { JSDOM } = require('jsdom');
const jsonwebtoken = require('jsonwebtoken');
const DOMPurify = require('dompurify');

const Feed = mongoose.model('Feed');
const Article = mongoose.model('Article');

const router = express.Router();

router.get('/auth', (req, res) => {
	const { user } = jsonwebtoken.verify(req.cookies.access_token, process.env.JWT_SECRET);
	res.send({ success: true, user });
});

router.post('/auth', (req, res) => {
	const result = { success: false };
	const [id, password] = [req.body.id, req.body.password].map(getPurified);

	if (id === process.env.ID && password === process.env.PASSWORD) {
		result.success = true;
		result.user = id;
		const createdToken = jsonwebtoken.sign({ user: process.env.ID }, process.env.JWT_SECRET);
		res.append('Set-Cookie', `access_token=${createdToken}; Path=/; Max-Age=3600; HttpOnly`);
		res.send(result);
		return;
	}

	res.send(result);
});

router.get('/feeds', async (req, res) => {
	const queries = await Feed.find();
	const response = queries.map(({ title, summaries, tags, article }) => ({
		title,
		summaries,
		tags,
		article
	}));
	res.send(response);
});

router.post('/articles', async (req, res) => {
	const response = { success: false };

	try {
		jsonwebtoken.verify(req.cookies.access_token, process.env.JWT_SECRET);
	} catch (err) {
		res.send(response);
		return;
	}

	const { verified, ...saveTargets } = refinePostBlog(req.body);
	if (!verified) {
		res.send(response);
		return;
	}

	const { content, title, summaries } = saveTargets;
	const tags = [];
	const uploadTime = new Date();

	const article = new Article({ content });
	await article.save();
	const feed = new Feed({ title, uploadTime, summaries, tags, article: article._id });
	await feed.save();

	response.success = true;
	res.send(response);
});

router.get('/articles/:id', async (req, res) => {
	const { content } = await Article.findOne({ _id: req.params.id });
	res.send({ content: getHtmlParsedMarkdown(content) });
});

function refinePostBlog(reqBody) {
	const result = { verified: false };

	if (!reqBody) {
		return result;
	}

	if (!reqBody.content) {
		return result;
	}

	const { content } = reqBody;
	Object.assign(result, { content });

	const htmlString = getHtmlParsedMarkdown(content);
	const jsDom = new JSDOM(htmlString);
	const { document } = jsDom.window;

	const titleElem = document.querySelector('h1');
	if (titleElem === null) {
		return result;
	}

	const title = titleElem.textContent;
	if (!title) {
		return result;
	}
	Object.assign(result, { title });

	const boldElems = document.querySelectorAll('strong');
	if (boldElems.length === 0) {
		return result;
	}

	const summaries = Array.from(boldElems).map((elem) => elem.textContent);
	const wrongSummaryItems = summaries.filter((item) => !item);
	if (wrongSummaryItems.length) {
		return result;
	}
	Object.assign(result, { summaries });

	result.verified = true;
	return result;
}

function getPurified(target) {
	const window = new JSDOM('').window;
	const purify = DOMPurify(window);
	return purify.sanitize(target);
}

function getHtmlParsedMarkdown(markdown) {
	return getPurified(marked.parse(markdown));
}

module.exports = router;

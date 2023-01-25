const express = require('express');
const { marked } = require('marked');
const { JSDOM } = require('jsdom');
const mongoose = require('mongoose');
const jsonwebtoken = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const DOMPurify = require('dompurify');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/test');
mongoose.set('debug', true);
mongoose.set('strictQuery', false);

require('./models/Feed');
require('./models/Article');
const Feed = mongoose.model('Feed');
const Article = mongoose.model('Article');

app.use(express.json());
app.use(cookieParser());

app.get('/api/user', (req, res) => {
	const { user } = jsonwebtoken.verify(req.cookies.access_token, process.env.JWT_SECRET);
	res.send({ success: true, user });
});

app.get('/api/feeds', async (req, res) => {
	const queries = await Feed.find();
	const response = queries.map(({ title, summaries, tags, article }) => ({
		title,
		summaries,
		tags,
		article
	}));
	res.send(response);
});

app.get('/api/article/:id', async (req, res) => {
	const { content } = await Article.findOne({ _id: req.params.id });
	res.send({ content: getHtmlParsedMarkdown(content) });
});

app.post('/api/article/preview', async (req, res) => {
	const content = getHtmlParsedMarkdown(req.body.content);
	res.send({ content });
});

app.post('/api/article', async (req, res) => {
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

app.post('/api/login', (req, res) => {
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

const port = 8080;
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
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

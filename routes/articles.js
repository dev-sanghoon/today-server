const router = require('express').Router();
const mongoose = require('mongoose');
const jsonwebtoken = require('jsonwebtoken');
const { getHtmlParsedMarkdown, refinePostBlog } = require('../lib');

const Feed = mongoose.model('Feed');
const Article = mongoose.model('Article');

router.post('/', async (req, res) => {
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

router.get('/:id', async (req, res) => {
	const { content } = await Article.findOne({ _id: req.params.id });
	res.send({ content: getHtmlParsedMarkdown(content) });
});

module.exports = router;

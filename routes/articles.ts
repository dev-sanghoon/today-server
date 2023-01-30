import express from 'express';
import mongoose from 'mongoose';
import jsonwebtoken from 'jsonwebtoken';
import { getHtmlParsedMarkdown, refinePostBlog } from '../lib';
import { FeedSchema, ArticleSchema } from '../models';

const router = express.Router();

const Feed = mongoose.model('Feed', FeedSchema);
const Article = mongoose.model('Article', ArticleSchema);

interface SaveTargets {
	content?: string;
	title?: string;
	summaries?: [string];
}

router.post('/', async (req, res) => {
	const response = { success: false };

	try {
		if (process.env.JWT_SECRET) {
			jsonwebtoken.verify(req.cookies.access_token, process.env.JWT_SECRET);
		}
	} catch (err) {
		res.send(response);
		return;
	}

	const { verified, ...saveTargets } = refinePostBlog(req.body);
	if (!verified) {
		res.send(response);
		return;
	}

	const { content, title, summaries }: SaveTargets = saveTargets;

	const uploadTime = new Date();

	const article = new Article({ content });
	await article.save();
	const feed = new Feed({ title, uploadTime, summaries, tags: [], article: article._id });
	await feed.save();

	response.success = true;
	res.send(response);
});

router.get('/:id', async (req, res) => {
	const result = { content: '' };
	const document = await Article.findOne({ _id: req.params.id });
	if (document && document.content) {
		result.content = getHtmlParsedMarkdown(document.content);
		return res.send(result);
	}
	return result;
});

export default router;

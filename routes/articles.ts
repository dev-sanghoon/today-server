import express from 'express';
import jsonwebtoken from 'jsonwebtoken';
import { getHtmlParsedMarkdown, refinePostBlog } from '../lib';
import mongodb from '../mongodb';

const router = express.Router();

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
	if (!content || !title || !summaries) {
		res.send(response);
		return;
	}

	const uploadTime = new Date();

	const article = await mongodb.postArticle(content || '');
	await mongodb.postFeed({ title, uploadTime, summaries, tags: [], article: article._id });

	response.success = true;
	res.send(response);
});

router.get('/:id', async (req, res) => {
	const result = { content: '' };
	const document = await mongodb.getArticle(req.params.id);
	if (document && document.content) {
		result.content = getHtmlParsedMarkdown(document.content);
		return res.send(result);
	}
	return result;
});

export default router;

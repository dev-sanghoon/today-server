import express from 'express';
import mongoose from 'mongoose';
import { FeedSchema } from '../models';

const router = express.Router();

const Feed = mongoose.model('Feed', FeedSchema);
router.get('/', async (req, res) => {
	const queries = await Feed.find();
	const response = queries.map(({ title, summaries, tags, article }) => ({
		title,
		summaries,
		tags,
		article
	}));
	res.send(response);
});

export default router;

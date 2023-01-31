import express from 'express';
import mongodb from '../mongodb';

const router = express.Router();

router.get('/', async (req, res) => {
	if (process.env.DATABASE === 'mongodb') {
		const response = await mongodb.getFeeds();
		res.send(response);
	}
});

export default router;

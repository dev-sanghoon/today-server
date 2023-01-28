const router = require('express').Router();
const mongoose = require('mongoose');

const Feed = mongoose.model('Feed');
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

module.exports = router;

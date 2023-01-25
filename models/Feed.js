const mongoose = require('mongoose');

const FeedSchema = new mongoose.Schema(
	{
		title: String,
		uploadTime: Date,
		summaries: [String],
		tags: [String],
		article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' }
	},
	{ collection: 'feeds' }
);

mongoose.model('Feed', FeedSchema);

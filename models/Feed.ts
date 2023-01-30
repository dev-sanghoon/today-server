import mongoose from 'mongoose';

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

export default FeedSchema;

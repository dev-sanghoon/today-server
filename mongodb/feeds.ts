import mongoose from 'mongoose';

const Feed = mongoose.model(
	'Feed',
	new mongoose.Schema(
		{
			title: String,
			uploadTime: Date,
			summaries: [String],
			tags: [String],
			article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' }
		},
		{ collection: 'feeds' }
	)
);

interface FeedInfo {
	title: string;
	uploadTime: Date;
	summaries: [string];
	tags: [];
	article: mongoose.Types.ObjectId;
}

const getFeeds = async () => {
	const queries = await Feed.find();
	return queries.map(({ title, summaries, tags, article }) => ({
		title,
		summaries,
		tags,
		article
	}));
};

const postFeed = async (feedData: FeedInfo) => {
	const feed = new Feed(feedData);
	return feed.save();
};

export { FeedInfo, getFeeds, postFeed };

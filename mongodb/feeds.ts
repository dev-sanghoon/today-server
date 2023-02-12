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
	const queries = await Feed.find().sort({ uploadTime: -1 });
	return queries.map(({ title, uploadTime, summaries, article }) => ({
		title,
		uploadTimeStr: getLocaleDate(uploadTime),
		summary: summaries.join(' '),
		article
	}));

	function getLocaleDate(date: Date | undefined) {
		const KR = 'en';
		date ? date : (date = new Date(0));
		return date.toLocaleDateString(KR);
	}
};

const postFeed = async (feedData: FeedInfo) => {
	const feed = new Feed(feedData);
	return feed.save();
};

export { FeedInfo, getFeeds, postFeed };

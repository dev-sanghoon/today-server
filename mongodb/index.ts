import mongoose from 'mongoose';
import { getFeeds, postFeed } from './feeds';
import { postArticle, getArticle } from './articles';

export default {
	useMain: () => {
		mongoose.connect('mongodb://127.0.0.1:27017/test');

		const isProduction = process.env.NODE_ENV === 'production';

		if (!isProduction) {
			mongoose.set('debug', true);
		}
	},
	getFeeds,
	postFeed,
	postArticle,
	getArticle
};

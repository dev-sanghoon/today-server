import mongoose from 'mongoose';

const Article = mongoose.model(
	'Article',
	new mongoose.Schema({ content: String }, { collection: 'articles' })
);

const postArticle = async (content: string) => {
	const article = new Article({ content });
	await article.save();
	return article;
};

const getArticle = async (id: string) => {
	return Article.findOne({ _id: id });
};

export { postArticle, getArticle };

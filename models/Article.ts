import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema({ content: String }, { collection: 'articles' });

export default ArticleSchema;

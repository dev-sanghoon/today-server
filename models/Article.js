const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({ content: String }, { collection: 'articles' });

mongoose.model('Article', ArticleSchema);

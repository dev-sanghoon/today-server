const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/test');

const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
	mongoose.set('debug', true);
}

require('./models/Feed');
require('./models/Article');

app.use(express.json()); // bodyParser not needed on recent version of expressjs
app.use(cookieParser());

app.use('/api', require('./routes'));

const port = 8080;
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

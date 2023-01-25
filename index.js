const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/test');
mongoose.set('debug', true);
mongoose.set('strictQuery', false);

require('./models/Feed');
require('./models/Article');

app.use(express.json());
app.use(cookieParser());

app.use(require('./routes'));

const port = 8080;
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

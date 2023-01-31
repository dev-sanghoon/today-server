import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import routes from './routes';

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/test');

dotenv.config();
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
	mongoose.set('debug', true);
}

app.use(express.json()); // bodyParser not needed on recent version of expressjs
app.use(cookieParser());

app.use('/api', routes);

const port = 8080;
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

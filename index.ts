import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import routes from './routes';
import mongodb from './mongodb';

dotenv.config();
mongodb.use();

const app = express();

app.use(express.json()); // bodyParser not needed on recent version of expressjs
app.use(cookieParser());
app.use('/api', routes);

const port = 8080;
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

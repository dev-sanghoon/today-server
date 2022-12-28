const fs = require('fs');
const express = require('express');
const { marked } = require('marked');
const { JSDOM } = require('jsdom');
const mecab = require('mecab-ya');
const mongoose = require('mongoose');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/test');
mongoose.set('debug', true);
mongoose.set('strictQuery', false);

app.use(express.json());

app.get('/api', (req, res) => {
	const THUMB_LOCATION = './blog/thumbs.json';
	const bufferThumbs = fs.readFileSync(THUMB_LOCATION);
	const thumbs = JSON.parse(bufferThumbs.toString());
	res.send(thumbs);
});

app.post('/api/blog', async (req, res) => {
	const response = { success: false };

	const { verified, ...saveTargets } = refinePostBlog(req.body);
	if (!verified) {
		res.send(response);
		return;
	}

	const { content, title, summaries } = saveTargets;
	const tags = await getTags([title, ...summaries].join(', '));
	const uploadTime = new Date();

	const feedSchema = new mongoose.Schema(
		{
			title: String,
			uploadTime: Date,
			summaries: [String],
			tags: [String],
			article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' }
		},
		{ collection: 'feeds' }
	);

	const articleSchema = new mongoose.Schema({ content: String }, { collection: 'articles' });

	const Article = mongoose.model('Article', articleSchema);
	const Feed = mongoose.model('Feed', feedSchema);
	const article = new Article({ content });
	await article.save();
	const feed = new Feed({ title, uploadTime, summaries, tags, article: article._id });
	await feed.save();

	response.success = true;
	res.send(response);
});

const port = 3000;
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

async function getTags(text) {
	return new Promise((resolve, reject) => {
		mecab.nouns(text, (err, result) => {
			if (err) {
				reject();
			}
			const dupRemoved = result.reduce((acc, cur) => {
				if (acc.indexOf(cur) < 0) {
					acc.push(cur);
					return acc;
				}
				return acc;
			}, []);
			resolve(dupRemoved);
		});
	});
}

function refinePostBlog(reqBody) {
	const result = { verified: false };

	if (!reqBody) {
		return result;
	}

	if (!reqBody.content) {
		return result;
	}

	const { content } = reqBody;
	Object.assign(result, { content });

	const htmlString = marked.parse(content);
	const jsDom = new JSDOM(htmlString);
	const { document } = jsDom.window;

	const titleElem = document.querySelector('h1');
	if (titleElem === null) {
		return result;
	}

	const title = titleElem.textContent;
	if (!title) {
		return result;
	}
	Object.assign(result, { title });

	const boldElems = document.querySelectorAll('strong');
	if (boldElems.length === 0) {
		return result;
	}

	const summaries = Array.from(boldElems).map((elem) => elem.textContent);
	const wrongSummaryItems = summaries.filter((item) => !item);
	if (wrongSummaryItems.length) {
		return result;
	}
	Object.assign(result, { summaries });

	result.verified = true;
	return result;
}

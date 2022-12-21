const fs = require('fs');
const express = require('express');
const { marked } = require('marked');
const { JSDOM } = require('jsdom');
const mecab = require('mecab-ya');

const app = express();
const port = 3000;

app.use(express.json());

app.get('/api', (req, res) => {
	const THUMB_LOCATION = './blog/thumbs.json';
	const bufferThumbs = fs.readFileSync(THUMB_LOCATION);
	const thumbs = JSON.parse(bufferThumbs.toString());
	res.send(thumbs);
});

app.get('/test', async (req, res) => {
	async function getNouns(text) {
		return new Promise((resolve, reject) => {
			mecab.nouns(text, (err, result) => {
				if (err) {
					reject();
				}
				resolve({
					success: true,
					data: result
				});
			});
		});
	}
	const response = await getNouns('아버지가방에들어가신다');
	res.send(response);
});

app.post('/api/blog', async (req, res) => {
	const { content } = req.body;
	const htmlString = marked.parse(content);
	const jsDom = new JSDOM(htmlString);
	const { document } = jsDom.window;
	const titleElem = document.querySelector('h1');

	if (titleElem === null) {
		console.log('request failed.');
		res.send({
			success: false,
			message: 'There is no title.'
		});
		return;
	}

	const boldElems = document.querySelectorAll('strong');
	if (boldElems.length === 0) {
		console.log('request failed.');
		res.send({
			success: false,
			message: 'There is no summaries.'
		});
		return;
	}

	const summaries = Array.from(boldElems).map((elem) => elem.textContent);
	const title = titleElem.textContent;

	const id = makeSimpleMongoId();

	async function getTags(text) {
		return new Promise((resolve, reject) => {
			mecab.nouns(text, (err, result) => {
				if (err) {
					reject();
				}
				resolve(result);
			});
		});
	}

	const joinSentence = [title, ...summaries].join(' ');
	const rawTags = await getTags(joinSentence);
	const dupRemovedTags = rawTags.reduce((acc, cur) => {
		if (acc.indexOf(cur) < 0) {
			acc.push(cur);
			return acc;
		}
		return acc;
	}, []);

	const blogInfo = {
		id,
		attribute: {
			uploadTime: getCurrentISOTime(),
			title,
			summaries,
			tags: dupRemovedTags
		}
	};

	fs.writeFileSync(`./blog/${id}.md`, content, { flag: 'wx' });

	const THUMB_LOCATION = './blog/thumbs.json';
	const thumbExists = fs.existsSync(THUMB_LOCATION);
	if (thumbExists) {
		const bufferThumbs = fs.readFileSync(THUMB_LOCATION);
		const thumbs = JSON.parse(bufferThumbs.toString());
		fs.writeFileSync(THUMB_LOCATION, JSON.stringify([...thumbs, blogInfo]));
	} else {
		fs.writeFileSync(THUMB_LOCATION, JSON.stringify([blogInfo]));
	}

	res.send({
		success: true,
		message: htmlString
	});

	function makeSimpleMongoId() {
		var result = '';
		var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
		var charactersLength = characters.length;
		for (var i = 0; i < 24; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	function getCurrentISOTime() {
		const now = new Date();
		return now.toISOString();
	}
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

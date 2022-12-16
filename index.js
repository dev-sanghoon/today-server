const fs = require('fs');
const express = require('express');

const app = express();
const port = 3000;

app.use(express.json());

app.get('/api', (req, res) => {
    const THUMB_LOCATION = './blog/thumbs.json';
    const bufferThumbs = fs.readFileSync(THUMB_LOCATION);
    const thumbs = JSON.parse(bufferThumbs.toString());
    res.send(thumbs);
});

app.post('/api/log', (req, res) => {
    const id = makeSimpleMongoId();
    const { content } = req.body;
    const blogInfo = {
        id,
        uploadTime: getCurrentISOTime() 
    };

    fs.writeFileSync(`./blog/${id}.md`, content, { flag: 'wx' });

    const THUMB_LOCATION = './blog/thumbs.json';
    const thumbExists = fs.existsSync(THUMB_LOCATION);
    if (thumbExists) {
        const bufferThumbs = fs.readFileSync(THUMB_LOCATION);
        const thumbs = JSON.parse(bufferThumbs.toString());
        const newThumbs = thumbs.push(blogInfo);
        fs.writeFileSync(THUMB_LOCATION, JSON.stringify(newThumbs));
    } else {
        fs.writeFileSync(THUMB_LOCATION, JSON.stringify([blogInfo]));
    }

    res.send(blogInfo);

    function makeSimpleMongoId() {
        var result = '';
        var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < 24; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    function getCurrentISOTime() {
        const now = new Date();
        return now.toISOString();
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
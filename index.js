const fs = require('fs');
const express = require('express');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    const content = fs.readFileSync('./data/221110-1.md', 'utf8');
    res.send({ content });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
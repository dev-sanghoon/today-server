const router = require('express').Router();
const jsonwebtoken = require('jsonwebtoken');
const { getPurified } = require('../lib');

router.get('/', (req, res) => {
	const { user } = jsonwebtoken.verify(req.cookies.access_token, process.env.JWT_SECRET);
	res.send({ success: true, user });
});

router.post('/', (req, res) => {
	const result = { success: false };
	const [id, password] = [req.body.id, req.body.password].map(getPurified);

	if (id === process.env.ID && password === process.env.PASSWORD) {
		result.success = true;
		result.user = id;
		const createdToken = jsonwebtoken.sign({ user: process.env.ID }, process.env.JWT_SECRET);
		res.append('Set-Cookie', `access_token=${createdToken}; Path=/; Max-Age=3600; HttpOnly`);
		res.send(result);
		return;
	}

	res.send(result);
});

module.exports = router;

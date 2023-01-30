import express from 'express';
import jsonwebtoken from 'jsonwebtoken';
import { getPurified } from '../lib';

const router = express.Router();

router.get('/', (req, res) => {
	const result = { success: false };
	if (process.env.JWT_SECRET) {
		const payload = jsonwebtoken.verify(req.cookies.access_token, process.env.JWT_SECRET);
		if (typeof payload === 'object') {
			result.success = true;
			return res.send({ ...result, ...payload });
		}
	}
	return res.send(result);
});

router.post('/', (req, res) => {
	const result = { success: false };
	const [id, password] = [req.body.id, req.body.password].map(getPurified);
	if (process.env.JWT_SECRET && id === process.env.ID && password === process.env.PASSWORD) {
		result.success = true;
		const payload = { user: id };
		const createdToken = jsonwebtoken.sign(payload, process.env.JWT_SECRET);
		res.append('Set-Cookie', `access_token=${createdToken}; Path=/; Max-Age=3600; HttpOnly`);
		return res.send({ ...result, ...payload });
	}
	return res.send(result);
});

export default router;

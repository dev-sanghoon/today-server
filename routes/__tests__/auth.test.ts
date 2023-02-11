import jsonwebtoken from 'jsonwebtoken';
import { getCurrentUser } from '../auth';

describe('checkAuth', () => {
	it('should have success status', () => {
		expect(getCurrentUser('aaa', 'bbb')).toHaveProperty('success');
	});

	const [WRONG_SECRET, RIGHT_SECRET] = ['wrong-secret', 'right-secret'];

	it('fails on token created with wrong secret', () => {
		const totallyWrongToken = jsonwebtoken.sign('alex', WRONG_SECRET);
		expect(getCurrentUser(totallyWrongToken, RIGHT_SECRET)).toEqual({
			success: false
		});

		const maliciousToken = jsonwebtoken.sign({ user: 'alex' }, WRONG_SECRET);
		expect(getCurrentUser(maliciousToken, RIGHT_SECRET)).toEqual({
			success: false
		});
	});

	it('fails when payload is string', () => {
		const unexpectedToken = jsonwebtoken.sign('alex', RIGHT_SECRET);
		expect(getCurrentUser(unexpectedToken, RIGHT_SECRET)).toEqual({ success: false });
	});

	it('succeeds when payload is object, and should have user property', () => {
		const properToken = jsonwebtoken.sign({ user: 'alex' }, RIGHT_SECRET);
		expect(getCurrentUser(properToken, RIGHT_SECRET).success).toEqual(true);
		expect(getCurrentUser(properToken, RIGHT_SECRET)).toHaveProperty('user');
	});
});

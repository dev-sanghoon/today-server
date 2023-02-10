import { getCurrentUser } from '../auth';

describe('checkAuth', () => {
	it('should have success status', () => {
		expect(getCurrentUser('aaa', 'bbb')).toHaveProperty('success');
	});

	it('returns proper data on failure', () => {
		expect(
			getCurrentUser(
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.zrSmUOTeO6-5FuPeQudcaPjrdaWJVRKkq5klHDhtyOM',
				'wrongsecret'
			)
		).toEqual({ success: false });
	});

	it('fails when payload is string', () => {
		expect(
			getCurrentUser(
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.aGVsbG8.M5Jq-KaWVvWtGPjUQ-HO3KJn1iFrALuE-Qb7f4TUnp8',
				'rightsecret'
			).success
		).toEqual(false);
	});

	it('fails when payload is object', () => {
		expect(
			getCurrentUser(
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZXN0Ijp0cnVlfQ.CYpwkVCFEgycLfyLKNrFQ-1dx3ZMzdimw_ALyw-ojp0',
				'rightsecret'
			).success
		).toEqual(true);
	});

	// security curiosity: is it okay to check if payload has right properties even though it is not private repositry?
});

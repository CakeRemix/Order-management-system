test('hello world!', () => {
	expect(1 + 1).toBe(2);
});

describe('Example test suite', () => {
	test('should return true for valid input', () => {
		expect(true).toBe(true);
	});

	test('should return false for invalid input', () => {
		expect(false).toBe(false);
	});
});
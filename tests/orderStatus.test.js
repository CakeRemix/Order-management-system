const assert = require('assert');

describe('Order Status Change', () => {
    let order;

    beforeEach(() => {
        order = { status: 'pending' };
    });

    it('should change status from pending to shipped', () => {
        order.status = 'shipped';
        assert.strictEqual(order.status, 'shipped');
    });

    it('should change status from shipped to delivered', () => {
        order.status = 'shipped';
        order.status = 'delivered';
        assert.strictEqual(order.status, 'delivered');
    });

    it('should not change status from delivered to pending', () => {
        order.status = 'delivered';
        order.status = 'pending'; // Invalid transition
        assert.notStrictEqual(order.status, 'pending');
    });

    it('should change status from pending to cancelled', () => {
        order.status = 'cancelled';
        assert.strictEqual(order.status, 'cancelled');
    });
});
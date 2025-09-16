const { expect } = require('chai');
const sinon = require('sinon');

// Mock the database module
const mockDb = {
  query: sinon.stub()
};

// Mock require to return our mock database
const originalRequire = require;
require = function(id) {
  if (id === '../models/db' || id === './db.js') {
    return mockDb;
  }
  return originalRequire.apply(this, arguments);
};

const Notification = require('./app/models/notification.model');

describe('Notification Model', () => {
  beforeEach(() => {
    mockDb.query.reset();
  });

  describe('create', () => {
    it('should create a notification successfully', (done) => {
      const newNotification = {
        title: 'Test Notification',
        message: 'This is a test message',
        recipient_id: 1,
        type: 'info',
        priority: 'normal'
      };

      const mockResult = { insertId: 123 };
      mockDb.query.yields(null, mockResult);

      Notification.create(newNotification, (err, result) => {
        expect(err).to.be.null;
        expect(result).to.deep.include(newNotification);
        expect(result.id).to.equal(123);
        expect(mockDb.query.calledOnce).to.be.true;
        done();
      });
    });

    it('should fail when title is missing', (done) => {
      const newNotification = {
        message: 'This is a test message',
        recipient_id: 1
      };

      Notification.create(newNotification, (err, result) => {
        expect(err).to.not.be.null;
        expect(err.message).to.equal('Title and message are required!');
        expect(result).to.be.null;
        expect(mockDb.query.called).to.be.false;
        done();
      });
    });

    it('should fail when message is missing', (done) => {
      const newNotification = {
        title: 'Test Notification',
        recipient_id: 1
      };

      Notification.create(newNotification, (err, result) => {
        expect(err).to.not.be.null;
        expect(err.message).to.equal('Title and message are required!');
        expect(result).to.be.null;
        expect(mockDb.query.called).to.be.false;
        done();
      });
    });

    it('should fail when both recipient_id and recipient_email are missing', (done) => {
      const newNotification = {
        title: 'Test Notification',
        message: 'This is a test message'
      };

      Notification.create(newNotification, (err, result) => {
        expect(err).to.not.be.null;
        expect(err.message).to.equal('Either recipient_id or recipient_email is required!');
        expect(result).to.be.null;
        expect(mockDb.query.called).to.be.false;
        done();
      });
    });

    it('should fail with invalid notification type', (done) => {
      const newNotification = {
        title: 'Test Notification',
        message: 'This is a test message',
        recipient_id: 1,
        type: 'invalid_type'
      };

      Notification.create(newNotification, (err, result) => {
        expect(err).to.not.be.null;
        expect(err.message).to.equal('Invalid notification type!');
        expect(result).to.be.null;
        expect(mockDb.query.called).to.be.false;
        done();
      });
    });

    it('should fail with invalid priority level', (done) => {
      const newNotification = {
        title: 'Test Notification',
        message: 'This is a test message',
        recipient_id: 1,
        priority: 'invalid_priority'
      };

      Notification.create(newNotification, (err, result) => {
        expect(err).to.not.be.null;
        expect(err.message).to.equal('Invalid priority level!');
        expect(result).to.be.null;
        expect(mockDb.query.called).to.be.false;
        done();
      });
    });

    it('should handle database error', (done) => {
      const newNotification = {
        title: 'Test Notification',
        message: 'This is a test message',
        recipient_id: 1
      };

      const dbError = new Error('Database connection failed');
      mockDb.query.yields(dbError, null);

      Notification.create(newNotification, (err, result) => {
        expect(err).to.equal(dbError);
        expect(result).to.be.null;
        expect(mockDb.query.calledOnce).to.be.true;
        done();
      });
    });

    it('should create notification with recipient_email instead of recipient_id', (done) => {
      const newNotification = {
        title: 'Test Notification',
        message: 'This is a test message',
        recipient_email: 'test@example.com'
      };

      const mockResult = { insertId: 456 };
      mockDb.query.yields(null, mockResult);

      Notification.create(newNotification, (err, result) => {
        expect(err).to.be.null;
        expect(result).to.deep.include(newNotification);
        expect(result.id).to.equal(456);
        done();
      });
    });
  });

  describe('findById', () => {
    it('should find notification by valid ID', (done) => {
      const mockNotification = {
        id: 1,
        title: 'Test Notification',
        message: 'Test message',
        recipient_id: 1,
        type: 'info',
        status: 'pending',
        priority: 'normal',
        metadata: '{"source":"test"}'
      };

      mockDb.query.yields(null, [mockNotification]);

      Notification.findById(1, (err, result) => {
        expect(err).to.be.null;
        expect(result).to.deep.include({
          id: 1,
          title: 'Test Notification',
          message: 'Test message',
          recipient_id: 1,
          type: 'info',
          status: 'pending',
          priority: 'normal',
          metadata: { source: 'test' }
        });
        expect(mockDb.query.calledOnce).to.be.true;
        done();
      });
    });

    it('should return not_found error for non-existent ID', (done) => {
      mockDb.query.yields(null, []);

      Notification.findById(999, (err, result) => {
        expect(err).to.deep.equal({ kind: 'not_found' });
        expect(result).to.be.null;
        expect(mockDb.query.calledOnce).to.be.true;
        done();
      });
    });

    it('should fail with invalid ID (non-numeric)', (done) => {
      Notification.findById('invalid', (err, result) => {
        expect(err).to.not.be.null;
        expect(err.message).to.equal('Invalid notification ID!');
        expect(result).to.be.null;
        expect(mockDb.query.called).to.be.false;
        done();
      });
    });

    it('should fail with null ID', (done) => {
      Notification.findById(null, (err, result) => {
        expect(err).to.not.be.null;
        expect(err.message).to.equal('Invalid notification ID!');
        expect(result).to.be.null;
        expect(mockDb.query.called).to.be.false;
        done();
      });
    });

    it('should handle database error', (done) => {
      const dbError = new Error('Database connection failed');
      mockDb.query.yields(dbError, null);

      Notification.findById(1, (err, result) => {
        expect(err).to.equal(dbError);
        expect(result).to.be.null;
        expect(mockDb.query.calledOnce).to.be.true;
        done();
      });
    });
  });

  describe('send', () => {
    let findByIdStub, markAsSentStub, markAsFailedStub;

    beforeEach(() => {
      findByIdStub = sinon.stub(Notification, 'findById');
      markAsSentStub = sinon.stub(Notification, 'markAsSent');
      markAsFailedStub = sinon.stub(Notification, 'markAsFailed');
    });

    afterEach(() => {
      findByIdStub.restore();
      markAsSentStub.restore();
      markAsFailedStub.restore();
    });

    it('should send notification successfully', (done) => {
      const mockNotification = {
        id: 1,
        title: 'Test Notification',
        message: 'Test message'
      };

      findByIdStub.yields(null, mockNotification);
      markAsSentStub.yields(null, { id: 1, status: 'sent' });

      Notification.send(1, (err, result) => {
        expect(err).to.be.null;
        expect(result.success).to.be.true;
        expect(result.message).to.equal('Notification sent successfully');
        expect(findByIdStub.calledOnce).to.be.true;
        expect(markAsSentStub.calledOnce).to.be.true;
        expect(markAsFailedStub.called).to.be.false;
        done();
      });
    });

    it('should fail to send notification with "fail" in title', (done) => {
      const mockNotification = {
        id: 1,
        title: 'Test Fail Notification',
        message: 'Test message'
      };

      findByIdStub.yields(null, mockNotification);
      markAsFailedStub.yields(null, { id: 1, status: 'failed' });

      Notification.send(1, (err, result) => {
        expect(err).to.be.null;
        expect(result.success).to.be.false;
        expect(result.message).to.equal('Failed to send notification');
        expect(findByIdStub.calledOnce).to.be.true;
        expect(markAsFailedStub.calledOnce).to.be.true;
        expect(markAsSentStub.called).to.be.false;
        done();
      });
    });

    it('should fail with invalid ID', (done) => {
      Notification.send('invalid', (err, result) => {
        expect(err).to.not.be.null;
        expect(err.message).to.equal('Invalid notification ID!');
        expect(result).to.be.null;
        expect(findByIdStub.called).to.be.false;
        done();
      });
    });
  });

  describe('Boundary Cases', () => {
    it('should handle extremely long title', (done) => {
      const longTitle = 'A'.repeat(1000);
      const newNotification = {
        title: longTitle,
        message: 'Test message',
        recipient_id: 1
      };

      const mockResult = { insertId: 1 };
      mockDb.query.yields(null, mockResult);

      Notification.create(newNotification, (err, result) => {
        expect(err).to.be.null;
        expect(result.title).to.equal(longTitle);
        done();
      });
    });

    it('should handle empty string title', (done) => {
      const newNotification = {
        title: '',
        message: 'Test message',
        recipient_id: 1
      };

      Notification.create(newNotification, (err, result) => {
        expect(err).to.not.be.null;
        expect(err.message).to.equal('Title and message are required!');
        expect(result).to.be.null;
        done();
      });
    });

    it('should handle zero as recipient_id', (done) => {
      const newNotification = {
        title: 'Test Title',
        message: 'Test message',
        recipient_id: 0
      };

      const mockResult = { insertId: 1 };
      mockDb.query.yields(null, mockResult);

      Notification.create(newNotification, (err, result) => {
        expect(err).to.be.null;
        expect(result.recipient_id).to.equal(0);
        done();
      });
    });

    it('should handle very large recipient_id', (done) => {
      const newNotification = {
        title: 'Test Title',
        message: 'Test message',
        recipient_id: Number.MAX_SAFE_INTEGER
      };

      const mockResult = { insertId: 1 };
      mockDb.query.yields(null, mockResult);

      Notification.create(newNotification, (err, result) => {
        expect(err).to.be.null;
        expect(result.recipient_id).to.equal(Number.MAX_SAFE_INTEGER);
        done();
      });
    });
  });
});
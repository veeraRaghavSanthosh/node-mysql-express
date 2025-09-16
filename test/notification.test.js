const request = require('supertest');
const { expect } = require('chai');
const app = require('../server'); // Adjust path as needed

describe('Notification API', () => {
  let notificationId;
  
  // Test data
  const testNotification = {
    title: 'Test Notification',
    message: 'This is a test notification message',
    type: 'info',
    user_id: 123
  };

  const updatedNotification = {
    title: 'Updated Test Notification',
    message: 'This is an updated test notification message',
    type: 'warning',
    is_read: true
  };

  describe('POST /notifications', () => {
    it('should create a new notification with valid data', (done) => {
      request(app)
        .post('/notifications')
        .send(testNotification)
        .expect(201)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('id');
          expect(res.body).to.have.property('title', testNotification.title);
          expect(res.body).to.have.property('message', testNotification.message);
          expect(res.body).to.have.property('type', testNotification.type);
          expect(res.body).to.have.property('user_id', testNotification.user_id);
          expect(res.body).to.have.property('is_read', false);
          expect(res.body).to.have.property('created_at');
          expect(res.body).to.have.property('updated_at');
          notificationId = res.body.id;
        })
        .end(done);
    });

    it('should return 400 when title is missing', (done) => {
      const invalidNotification = {
        message: 'This is a test notification message',
        type: 'info',
        user_id: 123
      };

      request(app)
        .post('/notifications')
        .send(invalidNotification)
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.include('title');
        })
        .end(done);
    });

    it('should return 400 when message is missing', (done) => {
      const invalidNotification = {
        title: 'Test Notification',
        type: 'info',
        user_id: 123
      };

      request(app)
        .post('/notifications')
        .send(invalidNotification)
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.include('message');
        })
        .end(done);
    });

    it('should return 400 when user_id is missing', (done) => {
      const invalidNotification = {
        title: 'Test Notification',
        message: 'This is a test notification message',
        type: 'info'
      };

      request(app)
        .post('/notifications')
        .send(invalidNotification)
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.include('user_id');
        })
        .end(done);
    });

    it('should default type to "info" when not provided', (done) => {
      const notificationWithoutType = {
        title: 'Test Notification',
        message: 'This is a test notification message',
        user_id: 123
      };

      request(app)
        .post('/notifications')
        .send(notificationWithoutType)
        .expect(201)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('type', 'info');
        })
        .end(done);
    });

    it('should return 400 for invalid notification type', (done) => {
      const invalidNotification = {
        title: 'Test Notification',
        message: 'This is a test notification message',
        type: 'invalid_type',
        user_id: 123
      };

      request(app)
        .post('/notifications')
        .send(invalidNotification)
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.include('type');
        })
        .end(done);
    });
  });

  describe('GET /notifications', () => {
    it('should retrieve all notifications', (done) => {
      request(app)
        .get('/notifications')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.be.an('array');
          if (res.body.length > 0) {
            res.body.forEach((notification) => {
              expect(notification).to.have.property('id');
              expect(notification).to.have.property('title');
              expect(notification).to.have.property('message');
              expect(notification).to.have.property('type');
              expect(notification).to.have.property('is_read');
              expect(notification).to.have.property('user_id');
              expect(notification).to.have.property('created_at');
              expect(notification).to.have.property('updated_at');
            });
          }
        })
        .end(done);
    });
  });

  describe('GET /notifications/:id', () => {
    it('should retrieve a specific notification by id', (done) => {
      request(app)
        .get(`/notifications/${notificationId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('id', notificationId);
          expect(res.body).to.have.property('title');
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('type');
          expect(res.body).to.have.property('is_read');
          expect(res.body).to.have.property('user_id');
          expect(res.body).to.have.property('created_at');
          expect(res.body).to.have.property('updated_at');
        })
        .end(done);
    });

    it('should return 404 for non-existent notification', (done) => {
      request(app)
        .get('/notifications/99999')
        .expect(404)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.include('Cannot find Notification');
        })
        .end(done);
    });

    it('should return 400 for invalid notification id format', (done) => {
      request(app)
        .get('/notifications/invalid_id')
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
        })
        .end(done);
    });
  });

  describe('PUT /notifications/:id', () => {
    it('should update a notification with valid data', (done) => {
      request(app)
        .put(`/notifications/${notificationId}`)
        .send(updatedNotification)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.include('updated successfully');
        })
        .end(done);
    });

    it('should update only is_read field', (done) => {
      request(app)
        .put(`/notifications/${notificationId}`)
        .send({ is_read: true })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.include('updated successfully');
        })
        .end(done);
    });

    it('should return 404 for non-existent notification', (done) => {
      request(app)
        .put('/notifications/99999')
        .send(updatedNotification)
        .expect(404)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.include('Cannot update Notification');
        })
        .end(done);
    });

    it('should return 400 for invalid notification id format', (done) => {
      request(app)
        .put('/notifications/invalid_id')
        .send(updatedNotification)
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
        })
        .end(done);
    });

    it('should return 400 for invalid notification type in update', (done) => {
      request(app)
        .put(`/notifications/${notificationId}`)
        .send({ type: 'invalid_type' })
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.include('type');
        })
        .end(done);
    });
  });

  describe('DELETE /notifications/:id', () => {
    it('should delete a specific notification by id', (done) => {
      request(app)
        .delete(`/notifications/${notificationId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.include('deleted successfully');
        })
        .end(done);
    });

    it('should return 404 for non-existent notification', (done) => {
      request(app)
        .delete('/notifications/99999')
        .expect(404)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.include('Cannot delete Notification');
        })
        .end(done);
    });

    it('should return 400 for invalid notification id format', (done) => {
      request(app)
        .delete('/notifications/invalid_id')
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
        })
        .end(done);
    });
  });

  describe('DELETE /notifications', () => {
    beforeEach((done) => {
      // Create test notifications for bulk delete test
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          request(app)
            .post('/notifications')
            .send({
              title: `Test Notification ${i}`,
              message: `Test message ${i}`,
              type: 'info',
              user_id: 123
            })
        );
      }
      Promise.all(promises).then(() => done());
    });

    it('should delete all notifications', (done) => {
      request(app)
        .delete('/notifications')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.include('deleted successfully');
        })
        .end(done);
    });
  });

  // Edge cases and error scenarios
  describe('Edge Cases', () => {
    it('should handle empty request body for POST', (done) => {
      request(app)
        .post('/notifications')
        .send({})
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
        })
        .end(done);
    });

    it('should handle very long title (boundary test)', (done) => {
      const longTitle = 'a'.repeat(300); // Assuming 255 char limit
      
      request(app)
        .post('/notifications')
        .send({
          title: longTitle,
          message: 'Test message',
          type: 'info',
          user_id: 123
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.include('title');
        })
        .end(done);
    });

    it('should handle very long message (boundary test)', (done) => {
      const longMessage = 'a'.repeat(1100); // Assuming 1000 char limit
      
      request(app)
        .post('/notifications')
        .send({
          title: 'Test Title',
          message: longMessage,
          type: 'info',
          user_id: 123
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.include('message');
        })
        .end(done);
    });

    it('should handle negative user_id', (done) => {
      request(app)
        .post('/notifications')
        .send({
          title: 'Test Title',
          message: 'Test message',
          type: 'info',
          user_id: -1
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.include('user_id');
        })
        .end(done);
    });

    it('should handle string user_id', (done) => {
      request(app)
        .post('/notifications')
        .send({
          title: 'Test Title',
          message: 'Test message',
          type: 'info',
          user_id: 'invalid_user_id'
        })
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.include('user_id');
        })
        .end(done);
    });
  });

  // Performance and load testing
  describe('Performance Tests', () => {
    it('should handle multiple concurrent requests', (done) => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/notifications')
            .send({
              title: `Concurrent Test ${i}`,
              message: `Concurrent test message ${i}`,
              type: 'info',
              user_id: i + 1
            })
            .expect(201)
        );
      }
      
      Promise.all(promises)
        .then((responses) => {
          expect(responses).to.have.length(10);
          responses.forEach((res) => {
            expect(res.body).to.have.property('id');
          });
          done();
        })
        .catch(done);
    });
  });
});

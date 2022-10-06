let { app } = require('../src/index');

let appJoint;
beforeEach(() => {
  appJoint = app('t');
});

describe('cookies', () => {
  describe('sessionCookie', () => {
    it('should create a new cookie', () => {
      let cookie = appJoint.sessionCookie({
        uid: '123',
        __signature: 'testing',
      });

      expect(cookie).toEqual(
        'appJointUser-t=testing; Max-Age=7776000; Path=/; HttpOnly; Secure; SameSite=Lax'
      );
    });
  });

  describe('clearCookie', () => {
    it('should create an empty cookie', () => {
      let cookie = appJoint.clearCookie();

      expect(cookie).toEqual(
        'appJointUser-t=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax'
      );
    });
  });
});

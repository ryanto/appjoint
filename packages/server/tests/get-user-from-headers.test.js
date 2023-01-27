let nock = require('nock');
let { Request } = require('cross-fetch');
let { app } = require('../src/index');

let appJoint;
beforeEach(() => {
  nock.disableNetConnect();
  appJoint = app('t');
});

afterEach(() => {
  nock.enableNetConnect();
});

describe('getUserFromHeaders', () => {
  describe('missing and empty headers', () => {
    it('empty', async () => {
      let headers = new Headers({});

      let user = await appJoint.getUserFromHeaders(headers);

      expect(user).toBeNull();
    });

    it('no headers', async () => {
      let user = await appJoint.getUserFromHeaders();

      expect(user).toBeNull();
    });
  });

  describe('cookie based auth', () => {
    it('should find the user', async () => {
      nock('https://appjoint.app')
        .post('/api/apps/t/verify-signature', { signature: 'xxx' })
        .reply(200, {
          uid: '123',
          role: 'admin',
        });

      let headers = new Headers({
        cookie: appJoint.sessionCookie({ __signature: 'xxx' }),
      });

      let user = await appJoint.getUserFromHeaders(headers);

      expect(Object.keys(user)).toEqual(['uid', 'role']);
      expect(user.uid).toBe('123');
      expect(user.role).toBe('admin');
      expect(user.__signature).toBe('xxx');
    });

    it('empty cookie', async () => {
      let headers = new Headers({
        cookie: '',
      });

      let user = await appJoint.getUserFromHeaders(headers);

      expect(user).toBeNull();
    });

    it('invalid cookie (no such user)', async () => {
      nock('https://appjoint.app')
        .post('/api/apps/t/verify-signature', { signature: 'xxx' })
        .reply(200, {});

      let headers = new Headers({
        cookie: appJoint.sessionCookie({ __signature: 'xxx' }),
      });

      let user = await appJoint.getUserFromHeaders(headers);

      expect(user).toBeNull();
    });
  });

  describe('authorization header based auth', () => {
    it('should find the user', async () => {
      nock('https://appjoint.app')
        .post('/api/apps/t/user-from-token', {
          token: 'token',
        })
        .reply(200, {
          uid: '123',
          role: 'admin',
          signature: 'xxx',
        });

      let headers = new Headers({
        authorization: 'Bearer token',
      });

      let user = await appJoint.getUserFromHeaders(headers);

      expect(Object.keys(user)).toEqual(['uid', 'role']);
      expect(user.uid).toBe('123');
      expect(user.role).toBe('admin');
      expect(user.__signature).toBe('xxx');
    });

    it('empty authorization header', async () => {
      let headers = new Headers({
        authorization: '',
      });

      let user = await appJoint.getUserFromHeaders(headers);

      expect(user).toBeNull();
    });

    it('invalid token', async () => {
      nock('https://appjoint.app')
        .post('/api/apps/t/user-from-token', { token: 'token' })
        .reply(200, {});

      let headers = new Headers({
        authorization: 'Bearer token',
      });

      let user = await appJoint.getUserFromHeaders(headers);

      expect(user).toBeNull();
    });

    it('malformed header (only token, no bearer)', async () => {
      nock('https://appjoint.app')
        .post('/api/apps/t/user-from-token')
        .reply(200, {});

      let headers = new Headers({
        authorization: 'token',
      });

      let user = await appJoint.getUserFromHeaders(headers);

      expect(user).toBeNull();
    });
  });
});

let nock = require('nock');
let { Request } = require('cross-fetch');
let { app } = require('../src/index');

let appJoint;
beforeEach(() => {
  appJoint = app('t');
});

describe('getUserFromRequest', () => {
  describe('missing and empty headers', () => {
    it('no auth or cookie header', async () => {
      let headers = new Headers({});
      let request = new Request('', { headers });

      let user = await appJoint.getUserFromRequest(request);

      expect(user).toBeNull();
    });

    it('no headers', async () => {
      let request = new Request('', {});

      let user = await appJoint.getUserFromRequest(request);

      expect(user).toBeNull();
    });
  });

  describe('cookie based auth', () => {
    it('should find the user', async () => {
      nock('https://appjoint.vercel.app')
        .post('/api/tenants/t/verify-signature', { signature: 'xxx' })
        .reply(200, {
          uid: '123',
        });

      let headers = new Headers({
        cookie: appJoint.sessionCookie({ __signature: 'xxx' }),
      });

      let request = new Request('', { headers });

      let user = await appJoint.getUserFromRequest(request);

      expect(Object.keys(user)).toEqual(['uid']);
      expect(user.uid).toBe('123');
      expect(user.__signature).toBe('xxx');
    });

    it('empty cookie', async () => {
      let headers = new Headers({
        cookie: '',
      });

      let request = new Request('', { headers });

      let user = await appJoint.getUserFromRequest(request);

      expect(user).toBeNull();
    });

    it('invalid cookie (no such user)', async () => {
      nock('https://appjoint.vercel.app')
        .post('/api/tenants/t/verify-signature', { signature: 'xxx' })
        .reply(200, {});

      let headers = new Headers({
        cookie: appJoint.sessionCookie({ __signature: 'xxx' }),
      });

      let request = new Request('', { headers });

      let user = await appJoint.getUserFromRequest(request);

      expect(user).toBeNull();
    });
  });

  describe('authorization header based auth', () => {
    it('should find the user', async () => {
      nock('https://appjoint.vercel.app')
        .post('/api/tenants/t/user-from-token', {
          token: 'token',
        })
        .reply(200, {
          uid: '123',
          signature: 'xxx',
        });

      let headers = new Headers({
        authorization: 'Bearer token',
      });

      let request = new Request('', { headers });

      let user = await appJoint.getUserFromRequest(request);

      expect(Object.keys(user)).toEqual(['uid']);
      expect(user.uid).toBe('123');
      expect(user.__signature).toBe('xxx');
    });

    it('empty authorization header', async () => {
      let headers = new Headers({
        authorization: '',
      });

      let request = new Request('', { headers });

      let user = await appJoint.getUserFromRequest(request);

      expect(user).toBeNull();
    });

    it('invalid token', async () => {
      nock('https://appjoint.vercel.app')
        .post('/api/tenants/t/user-from-token', { token: 'token' })
        .reply(200, {});

      let headers = new Headers({
        authorization: 'Bearer token',
      });

      let request = new Request('', { headers });

      let user = await appJoint.getUserFromRequest(request);

      expect(user).toBeNull();
    });

    it('malformed header (only token, no bearer)', async () => {
      nock('https://appjoint.vercel.app')
        .post('/api/tenants/t/user-from-token')
        .reply(200, {});

      let headers = new Headers({
        authorization: 'token',
      });

      let request = new Request('', { headers });

      let user = await appJoint.getUserFromRequest(request);

      expect(user).toBeNull();
    });
  });
});

afterAll(() => {
  nock.restore();
});

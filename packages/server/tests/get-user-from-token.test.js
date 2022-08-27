let nock = require('nock');
let { app } = require('../src/index');

let appJoint;
beforeEach(() => {
  appJoint = app('t');
});

describe('getUserFromToken', () => {
  it('should find the user', async () => {
    nock('https://appjoint.vercel.app')
      .post('/api/tenants/t/user-from-token', { token: 'token' })
      .reply(200, {
        uid: '123',
        signature: 'xxx',
      });

    let user = await appJoint.getUserFromToken('token');

    expect(Object.keys(user)).toEqual(['uid']);
    expect(user.uid).toBe('123');
    expect(user.__signature).toBe('xxx');
  });

  it('invalid token', async () => {
    nock('https://appjoint.vercel.app')
      .post('/api/tenants/t/user-from-token', { token: 'bad-token' })
      .reply(200, {});

    let user = await appJoint.getUserFromToken('bad-token');

    expect(user).toBeNull();
  });
});

afterAll(() => {
  nock.restore();
});

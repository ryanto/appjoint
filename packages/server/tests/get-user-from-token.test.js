let nock = require('nock');
let { app } = require('../src/index');

let appJoint;
beforeEach(() => {
  nock.disableNetConnect();
  appJoint = app('t');
});

afterEach(() => {
  nock.enableNetConnect();
});

describe('getUserFromToken', () => {
  it('should find the user', async () => {
    nock('https://appjoint.app')
      .post('/api/apps/t/user-from-token', { token: 'token' })
      .reply(200, {
        uid: '123',
        role: 'admin',
        signature: 'xxx',
      });

    let user = await appJoint.getUserFromToken('token');

    expect(Object.keys(user)).toEqual(['uid', 'role']);
    expect(user.uid).toBe('123');
    expect(user.role).toBe('admin');
    expect(user.__signature).toBe('xxx');
  });

  it('invalid token', async () => {
    nock('https://appjoint.app')
      .post('/api/apps/t/user-from-token', { token: 'bad-token' })
      .reply(200, {});

    let user = await appJoint.getUserFromToken('bad-token');

    expect(user).toBeNull();
  });
});

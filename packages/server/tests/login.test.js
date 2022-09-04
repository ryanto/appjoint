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

describe('login', () => {
  it('should login', async () => {
    nock('https://appjoint.app')
      .post('/api/apps/t/login', {
        email: 'ryan@example.com',
        password: 'pw',
      })
      .reply(200, {
        user: {
          uid: '123',
          signature: 'signed',
        },
      });

    let user = await appJoint.login('ryan@example.com', 'pw');

    expect(Object.keys(user)).toEqual(['uid']);
    expect(user.uid).toBe('123');
    expect(user.signature).toBeUndefined();
    expect(user.__signature).toBe('signed');
  });

  it('errors when the login fails', async () => {
    nock('https://appjoint.app')
      .post('/api/apps/t/login')
      .reply(200, {
        error: 'login failed',
      });

    expect.assertions(1);
    await expect(appJoint.login('ryan@example.com', 'pw')).rejects.toThrow(
      'login failed'
    );
  });
});

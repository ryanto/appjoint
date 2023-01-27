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

describe('create account', () => {
  it('should create an account', async () => {
    nock('https://appjoint.app')
      .post('/api/apps/t/create-account', {
        email: 'ryan@example.com',
        password: 'pw',
      })
      .reply(200, {
        user: {
          uid: '123',
          role: 'user',
          signature: 'signed',
        },
      });

    let user = await appJoint.createAccount({
      email: 'ryan@example.com',
      password: 'pw',
    });

    expect(Object.keys(user)).toEqual(['uid', 'role']);
    expect(user.uid).toBe('123');
    expect(user.role).toBe('user');
    expect(user.signature).toBeUndefined();
    expect(user.__signature).toBe('signed');
  });

  it('errors when it cannot create an account', async () => {
    nock('https://appjoint.app')
      .post('/api/apps/t/create-account')
      .reply(200, {
        error: 'Not today',
      });

    expect.assertions(1);
    await expect(
      appJoint.createAccount({ email: 'ryanto@gmail.com', password: 'pw' })
    ).rejects.toThrow('Not today');
  });
});

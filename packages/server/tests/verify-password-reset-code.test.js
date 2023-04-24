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

describe('verifyPasswordResetCode', () => {
  it('should get the email from the code', async () => {
    nock('https://appjoint.app')
      .post('/api/apps/t/verify-password-reset-code', {
        code: 'abc123',
      })
      .reply(200, {
        email: 'ryanto@gmail.com',
      });

    let email = await appJoint.verifyPasswordResetCode('abc123');

    expect(email).toBe('ryanto@gmail.com');
  });

  it('returns null if the server errors', async () => {
    nock('https://appjoint.app')
      .post('/api/apps/t/verify-password-reset-code', {
        code: 'abc123',
      })
      .reply(200, {
        error: 'failed',
        email: null,
      });

    let email = await appJoint.verifyPasswordResetCode('abc123');

    expect(email).toBe(null);
  });
});

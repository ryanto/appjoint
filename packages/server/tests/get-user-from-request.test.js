let nock = require('nock');
let { Request } = require('node-fetch');
let { app } = require('../src/index');

let appJoint;
beforeEach(() => {
  appJoint = app('t');
});

describe('getUserFromRequest', () => {
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

  it('no cookie', async () => {
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

  it('invalid cookie', async () => {
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

afterAll(() => {
  nock.restore();
});

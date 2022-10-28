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
});

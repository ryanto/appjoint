import { app } from '@appjoint/server';
import nock from 'nock';

export default async function handler(req, res) {
  nock('https://appjoint.app')
    .persist()
    .post('/api/apps/test-app-auth/user-from-token')
    .reply(200, (uri, requestBody) => {
      return {
        uid: 1,
        signature: 'test-signature',
      };
    });

  let appJoint = app('test-app-auth');
  let user = await appJoint.getUserFromRequest(req);

  if (user) {
    res.setHeader('Set-Cookie', appJoint.sessionCookie(user));
    res.status(200).json({ ok: true });
  } else {
    res.status(401).json({ ok: false });
  }
}

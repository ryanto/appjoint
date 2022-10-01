import { app } from '@appjoint/server';

let appJoint = app('Demo-app-hpdwq');

export default async function handler(req, res) {
  try {
    let user = await appJoint.createAccount({
      email: req.body.email,
      password: req.body.password,
    });
    res.setHeader('Set-Cookie', appJoint.sessionCookie(user));
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

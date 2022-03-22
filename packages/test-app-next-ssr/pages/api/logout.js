import { app } from '@appjoint/server';

let appJoint = app('Test-app-ssr-vxfdl');

export default async function handler(req, res) {
  res.setHeader('Set-Cookie', appJoint.clearCookie());
  res.status(200).json({ ok: true });
}

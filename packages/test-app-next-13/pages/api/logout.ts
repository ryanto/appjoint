import { app } from '@appjoint/server';
import type { NextApiRequest, NextApiResponse } from 'next'

let appJoint = app('Demo-app-hpdwq');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Set-Cookie', appJoint.clearCookie());
  res.redirect("/")
}

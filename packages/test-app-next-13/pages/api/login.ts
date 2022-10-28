import { app } from '@appjoint/server';
import type { NextApiRequest, NextApiResponse } from 'next'

let appJoint = app('Demo-app-hpdwq');

type Data = {
  ok?: boolean
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    let user = await appJoint.login(req.body.email, req.body.password);
    res.setHeader('Set-Cookie', appJoint.sessionCookie(user));
    res.redirect("/")
  } catch (error: unknown) {
    let message = error instanceof Error ? error.message : ""
    console.error(message);
    res.redirect("/")
  }
}

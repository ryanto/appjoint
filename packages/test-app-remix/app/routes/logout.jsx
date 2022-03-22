import { app } from '@appjoint/server';

let appJoint = app('Test-app-ssr-vxfdl');

export async function action() {
  return new Response(null, {
    headers: {
      'Set-Cookie': appJoint.clearCookie(),
    },
  });
}

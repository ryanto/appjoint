import { app } from '@appjoint/server';
import { json } from 'remix';

let appJoint = app('Test-app-ssr-vxfdl');

export async function action({ request }) {
  let body = await request.formData();
  let email = body.get('email');
  let password = body.get('password');
  try {
    let user = await appJoint.login(email, password);
    return new Response(null, {
      headers: {
        'Set-Cookie': appJoint.sessionCookie(user),
      },
    });
  } catch (e) {
    let values = { email, password };
    let error = e.message;
    return json({ error, values });
  }
}

export { Login as default } from '~/components/login';

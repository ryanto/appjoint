import { app } from '@appjoint/server';
import { headers } from 'next/headers';

let appJoint = app('Demo-app-hpdwq');

export default async function Home() {
  let user = await appJoint.getUserFromHeaders(headers());

  return (
    <div>
      <div>hello! You are user: {user?.uid}</div>
      <div>
        <a href="/api/logout">Logout</a>
      </div>
    </div>
  );
}

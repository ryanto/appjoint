import {
  json,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useLoaderData,
} from 'remix';
import styles from '~/styles/global.css';
import { app } from '@appjoint/server';

let appJoint = app('Test-app-ssr-vxfdl');

export function meta() {
  return {
    charset: 'utf-8',
    title: 'New Remix App',
    viewport: 'width=device-width,initial-scale=1',
  };
}

export function links() {
  return [{ rel: 'stylesheet', href: styles }];
}

export async function loader({ request }) {
  let user = await appJoint.getUserFromRequest(request);
  return json({ user });
}

export default function App() {
  let { user } = useLoaderData();
  const { Form } = useFetcher();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="header">
          {user && (
            <>
              <Form action="/logout" method="post">
                <button>Logout</button>
              </Form>
            </>
          )}
        </div>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

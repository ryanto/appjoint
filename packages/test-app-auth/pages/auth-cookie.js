import { app } from '@appjoint/server';
import { useAuth } from '@appjoint/react';
import nock from 'nock';
import { useRouter } from 'next/router';

export default function SessionCookie(props) {
  let { requestAuthCookie } = useAuth();
  let router = useRouter();

  let handleClick = async () => {
    await requestAuthCookie('/api/auth-cookie');
    await router.replace(router.asPath);
  };

  return (
    <div>
      <div data-test="message">{props.message}</div>
      {props.cookies && (
        <div>
          {Object.keys(props.cookies).map(name => (
            <div key={name}>
              <span data-test="cookie-name">{name}</span>:
              <span data-test="cookie-value">{props.cookies[name]}</span>
            </div>
          ))}
        </div>
      )}
      <div>
        <button onClick={handleClick} data-test="request-auth-cookie">
          Request auth cookie
        </button>
      </div>
    </div>
  );
}

export async function getServerSideProps({ req }) {
  nock('https://appjoint.app')
    .post('/api/apps/test-app-auth/verify-signature')
    .reply(200, (uri, requestBody) => {
      return { uid: 1 };
    });

  let appJoint = app('test-app-auth');
  let user = await appJoint.getUserFromRequest(req);

  return {
    props: {
      message: user
        ? 'You have server side access!'
        : "You don't have server side access!",
      cookies: req.cookies,
    },
  };
}

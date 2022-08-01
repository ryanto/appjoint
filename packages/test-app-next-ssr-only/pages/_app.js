import { useRouter } from 'next/router';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  let router = useRouter();
  let { user } = pageProps;

  let logout = async event => {
    await fetch('/api/logout', {
      method: 'POST',
    });

    router.replace(router.asPath);
  };

  return (
    <div>
      <div className="header">
        {pageProps.user && (
          <>
            <div>Hi, {user.email}!</div>
            <button onClick={logout} style={{ marginRight: 'auto' }}>
              Logout
            </button>
          </>
        )}
      </div>
      <Component {...pageProps} />
    </div>
  );
}

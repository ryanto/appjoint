import Link from 'next/link';
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
        <div>Welcome!</div>
        {user ? (
          <button onClick={logout} style={{ marginLeft: 'auto' }}>
            Logout
          </button>
        ) : (
          <Link href="/create-account">
            <a>Create account</a>
          </Link>
        )}
      </div>
      <Component {...pageProps} />
    </div>
  );
}

import { useRouter } from 'next/router';
import { useState } from 'react';

export const Login = function() {
  let router = useRouter();

  let [error, setError] = useState();

  let handleSignIn = async event => {
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);

    let response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    let { ok, error } = await response.json();

    if (ok) {
      await router.replace(router.asPath);
    } else {
      setError(error);
    }
  };

  return (
    <form onSubmit={handleSignIn}>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div>
        <button data-test="submit" type="submit">
          Login
        </button>
      </div>
    </form>
  );
};

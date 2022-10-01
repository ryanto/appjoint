import { useRouter } from 'next/router';
import { useState } from 'react';

export const CreateAccount = function() {
  let router = useRouter();

  let [error, setError] = useState();

  let handleCreateAccount = async event => {
    event.preventDefault();
    let form = event.target;
    let formData = new FormData(form);

    let response = await fetch('/api/create-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    let { ok, error } = await response.json();

    if (ok) {
      await router.push('/');
    } else {
      setError(error);
    }
  };

  return (
    <form onSubmit={handleCreateAccount}>
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
          Create account
        </button>
      </div>
    </form>
  );
};

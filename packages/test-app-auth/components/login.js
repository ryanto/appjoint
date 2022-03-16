import { useState } from 'react';
import { useAuth } from '@appjoint/react';

export const Login = function() {
  let { signIn } = useAuth();

  let [email, setEmail] = useState('');
  let [password, setPassword] = useState('');
  let [remember, setRemember] = useState(true);

  let handleSignIn = async e => {
    e.preventDefault();
    await signIn(email, password, { remember: remember });
  };

  return (
    <form onSubmit={handleSignIn} data-test="login-form">
      <div>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          data-test="email"
          onChange={e => setEmail(e.target.value)}
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
          data-test="password"
          onChange={e => setPassword(e.target.value)}
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

import { useState } from 'react';
import { useAuth } from '@appjoint/react';
import { useRouter } from 'next/router';

export default function SignInPage() {
  let { signIn } = useAuth();
  let router = useRouter();

  let [email, setEmail] = useState('');
  let [password, setPassword] = useState('');
  let [remember, setRemember] = useState(true);

  let handleSignIn = async e => {
    e.preventDefault();
    await signIn(email, password, { remember: remember });
    await router.push('/');
  };

  return (
    <div>
      <h1>Sign in</h1>
      <form onSubmit={handleSignIn} data-test="login-form">
        <div>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            data-test="email"
            value={email}
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
            value={password}
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
    </div>
  );
}

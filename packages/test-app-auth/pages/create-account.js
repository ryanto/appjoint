import { useState } from 'react';
import { useAuth } from '@appjoint/react';
import { useRouter } from 'next/router';

export default function CreateAccountPage() {
  let { createAccount } = useAuth();
  let router = useRouter();

  let [email, setEmail] = useState('');
  let [password, setPassword] = useState('');

  let handleCreateAccount = async e => {
    e.preventDefault();
    await createAccount(email, password);
    await router.push('/');
  };

  return (
    <div>
      <h1>Create account</h1>
      <form onSubmit={handleCreateAccount} data-test="create-account-form">
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
            Create account
          </button>
        </div>
      </form>
    </div>
  );
}

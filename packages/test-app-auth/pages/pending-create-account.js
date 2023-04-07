import { useAuth, useBefore, useCreateAccountForm } from '@appjoint/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function CreateAccountFormPage() {
  let { error, formProps } = useCreateAccountForm();
  let { isAuthenticated, isPending } = useAuth();
  let router = useRouter();

  useBefore('setUser', user => {
    if (user) {
      router.prefetch('/');
      return new Promise(resolve => {
        setTimeout(resolve, 2000);
      });
    }
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  return (
    <div data-test="create-account">
      <h1>Create account</h1>
      {isPending && <div data-test="pending">Account creation is pending.</div>}
      <form {...formProps} data-test="create-account-form">
        {error && <div data-test="error">Error: {error.message}</div>}
        <div>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            data-test="email"
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

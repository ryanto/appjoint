import { useLoginForm } from '@appjoint/react';

export const Login = function() {
  let { formProps, error } = useLoginForm();

  return (
    <form {...formProps} data-test="login-form">
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
          Login
        </button>
      </div>
    </form>
  );
};

import { useFetcher } from 'remix';

export const Login = function() {
  const { Form, data } = useFetcher();

  return (
    <Form action="/login" method="post">
      {data?.error && (
        <div style={{ color: 'red' }}>Could not sign in: {data.error}</div>
      )}
      <div>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={data?.values?.email}
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
          defaultValue={data?.values?.password}
        />
      </div>
      <div>
        <button data-test="submit" type="submit">
          Login
        </button>
      </div>
    </Form>
  );
};

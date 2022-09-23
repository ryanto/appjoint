import { useAuth } from '@appjoint/react';

export default function Home() {
  let { signOut, user } = useAuth();

  return (
    <div data-test="homepage">
      <h1>Welcome to the home page!</h1>
      <p>
        Your uid is: <span data-test="uid">{user.uid}</span> and your email is:{' '}
        <span data-test="email">{user.email}</span>.
      </p>
      <button onClick={signOut} data-test="logout">
        Logout
      </button>
    </div>
  );
}

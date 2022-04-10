import { useAuth } from '@appjoint/react';

export default function Home() {
  let { signOut } = useAuth();

  return (
    <div data-test="homepage">
      Welcome to the home page!
      <button onClick={signOut} data-test="logout">
        Logout
      </button>
    </div>
  );
}

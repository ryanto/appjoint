import { getAuthorizationHeader } from '@appjoint/react';
import useSWR from 'swr';

let fetcher = async url => {
  let authorization = await getAuthorizationHeader();

  let response = await fetch(url, {
    headers: {
      authorization,
    },
  });

  return await response.json();
};

export default function AuthToken() {
  const { data, isValidating } = useSWR('/api/auth-header', fetcher);

  return (
    <div>
      {isValidating ? (
        <>Trying to figure out who you are...</>
      ) : data?.userId ? (
        <span data-test="logged-in">Hello, you are user: {data.userId}</span>
      ) : (
        <span data-test="not-logged-in">You are not a logged in user!</span>
      )}
    </div>
  );
}

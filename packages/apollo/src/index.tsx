import {
  ApolloProvider,
  ApolloClient,
  createHttpLink,
  ApolloCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import React, { useRef, useState } from 'react';
import { useAuth, useApp, Plugin } from '@appjoint/react';

type UseAppJointApollo = ({
  uri,
  cache,
}: {
  uri: string;
  cache: ApolloCache<any>;
}) => Plugin;

export const useAppJointApollo: UseAppJointApollo = ({ uri, cache }) => {
  return {
    props: { uri, cache },
    provider: Provider,
  };
};

export const Provider: React.FC<{
  uri: string;
  cache: ApolloCache<any>;
}> = function({ uri, cache, children }): React.ReactElement {
  let { user } = useAuth();
  let userRef = useRef(user);

  // Apollo has a ref to the current user so it can get the auth headers. we need to make sure the ref
  // ALWAYS matches the current user from useAuth.
  // if we try to update the ref with an effect, then it happens after render, and there could
  // be queries that are made before the ref/effect runs. So we set it during render.
  userRef.current = user;

  let { test } = useApp();

  let hasTestUri =
    test &&
    typeof window !== 'undefined' &&
    (window as any).APPJOINT_GRAPHQL_ADDRESS;

  // we're going to stabilize httpLink, authLink, and the
  // apollo client by hiding them in state. The auth link
  // uses the user ref to generate the jwt token. this allows
  // us to build a client before the user has logged in.
  let [httpLink] = useState(() =>
    createHttpLink({
      uri: hasTestUri ? (window as any).APPJOINT_GRAPHQL_ADDRESS : uri,
    })
  );

  let [authLink] = useState(() =>
    setContext(async (_, { headers }) => {
      let token = await userRef.current?.getIdToken();
      let authHeaders = token ? { authorization: `Bearer ${token}` } : {};
      return {
        headers: {
          ...headers,
          ...authHeaders,
        },
      };
    })
  );

  let [client] = useState(
    () =>
      new ApolloClient({
        link: authLink.concat(httpLink),
        cache,
      })
  );

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

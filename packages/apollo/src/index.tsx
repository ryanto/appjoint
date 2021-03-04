import { ApolloProvider, ApolloClient, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import React, { useEffect, useRef, useState } from 'react';
import { Plugin, useAuth } from '@appjoint/react';

type UseAppJointApollo = ({
  uri,
  cache,
}: {
  uri: string;
  cache: any;
}) => Plugin;

export const useAppJointApollo: UseAppJointApollo = ({ uri, cache }) => {
  return {
    props: { uri, cache },
    provider: Provider,
  };
};

export const Provider = function({ uri, cache, children }: any) {
  // we're going to stabilize httpLink, authLink, and the
  // apollo client by hiding them in state. The auth link
  // uses the user ref to generate the jwt token. this allows
  // us to build a client before the user has logged in.

  let [httpLink] = useState(() =>
    createHttpLink({
      uri: uri,
    })
  );

  let [authLink] = useState(() =>
    setContext(async (_, { headers }) => {
      let token = await userRef.current?.getIdToken();
      return {
        headers: {
          ...headers,
          authorization: `Bearer ${token}`,
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

  let { user } = useAuth();
  let userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  console.log('rendering apollo provider', client);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

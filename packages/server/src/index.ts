import crossFetch from 'cross-fetch';
import { GraphQLClient } from 'graphql-request';
import { DocumentNode } from 'graphql';
import { clearCookie, getSignatureFromCookie, sessionCookie } from './cookies';

export type User = {
  uid: string;
  __signature: string;
};

type RequestLike = Partial<{ headers: any }>;
type Fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>;

type Options = {
  fetch?: Fetcher;
  graphqlEndpoint?: string;
};

type Config = {
  tenantId: string;
  fetch: Fetcher;
  graphqlEndpoint?: string;
};

let isDevelopingLib = false;
let appjointApiServer = isDevelopingLib
  ? 'http://localhost:3001'
  : 'https://appjoint.app/api';

let appInfo = new Map();

export let app = (app: string, options: Options = {}) => {
  let fetch = options.fetch ?? crossFetch;
  let config = {
    tenantId: app,
    fetch,
    graphqlEndpoint: options.graphqlEndpoint,
  };

  let query = (query: string | DocumentNode, variables?: Record<string, any>) =>
    execHasura(config, query, variables);

  return {
    getUserFromRequest: (req: RequestLike) => getUserFromRequest(config, req),
    getUserFromToken: (token: string) => getUserFromToken(config, token),
    // getSessionCookieFromToken: (token: string) =>
    //   getSessionCookieFromToken(app, token),

    login: (email: string, password: string) => login(config, email, password),
    createAccount: ({ email, password }: { email: string; password: string }) =>
      createAccount(config, { email, password }),
    sessionCookie: (user: User) => sessionCookie(app, user),
    clearCookie: () => clearCookie(app),

    query,
    mutate: query,

    as: (user: User) => {
      let headers = {
        authorization: `Signature ${user.__signature}`,
      };

      let query = (
        query: string | DocumentNode,
        variables?: Record<string, any>
      ) => execHasura(config, query, variables, headers);

      return {
        query,
        mutate: query,
      };
    },

    admin: (secret?: string) => {
      let headers = {
        'x-hasura-admin-secret':
          secret ?? `${process.env.APPJOINT_HASURA_GRAPHQL_ADMIN_SECRET}`,
      };

      let query = (
        query: string | DocumentNode,
        variables?: Record<string, any>
      ) => execHasura(config, query, variables, headers);

      return {
        query,
        mutate: query,
      };
    },
  };
};

type JSONResponse = Record<string, any>;

let getUserFromToken = async (config: Config, token: string) => {
  let response = await config.fetch(
    `${appjointApiServer}/apps/${config.tenantId}/user-from-token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
      }),
    }
  );

  let { uid, signature } = (await response.json()) as JSONResponse;
  let user = { uid } as User;

  if (uid) {
    Object.defineProperty(user, '__signature', {
      value: signature,
      enumerable: false,
      writable: false,
    });
  }

  return user.uid ? user : null;
};

let login = async (config: Config, email: string, password: string) => {
  let response = await config.fetch(
    `${appjointApiServer}/apps/${config.tenantId}/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  let { user, error } = (await response.json()) as JSONResponse;

  if (error) {
    throw new Error(error);
  }

  if (user?.signature) {
    Object.defineProperty(user, '__signature', {
      value: user.signature,
      enumerable: false,
      writable: false,
    });

    delete user.signature;
  }

  return user as User;
};

let createAccount = async (
  config: Config,
  { email, password }: { email: string; password: string }
) => {
  let response = await config.fetch(
    `${appjointApiServer}/apps/${config.tenantId}/create-account`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  let { user, error } = (await response.json()) as JSONResponse;

  if (error) {
    throw new Error(error);
  }

  if (user?.signature) {
    Object.defineProperty(user, '__signature', {
      value: user.signature,
      enumerable: false,
      writable: false,
    });

    delete user.signature;
  }

  return user as User;
};

let getUserFromCookie = async (config: Config, cookie: string) => {
  let signature = getSignatureFromCookie(config.tenantId, cookie);

  if (!signature) {
    return null;
  }

  let response = await config.fetch(
    `${appjointApiServer}/apps/${config.tenantId}/verify-signature`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        signature,
      }),
    }
  );

  let { uid } = (await response.json()) as JSONResponse;
  let user = { uid } as User;

  if (uid) {
    Object.defineProperty(user, '__signature', {
      value: signature,
      enumerable: false,
      writable: false,
    });
  }

  return user.uid ? user : null;
};

let getUserFromRequest = (config: Config, req: RequestLike) => {
  let authHeader = req.headers.get
    ? req.headers.get('authorization')
    : req.headers.authorization;

  if (authHeader) {
    let token = authHeader?.split(' ')[1];
    return getUserFromToken(config, token);
  } else {
    return getUserFromCookie(
      config,
      req.headers.get ? req.headers.get('cookie') : req.headers.cookie
    );
  }
};

let getTenantInfo = async (config: Config) => {
  if (!appInfo.get(config.tenantId)) {
    let uri =
      config.graphqlEndpoint ??
      `https://appjoint.app/${config.tenantId}/v1/graphql`;
    let client = new GraphQLClient(uri, {
      fetch: config.fetch,
    });

    let info = {
      graphql: {
        uri,
        client,
      },
    };

    appInfo.set(config.tenantId, info);
  }

  return appInfo.get(config.tenantId);
};

let execHasura = async (
  config: Config,
  query: string | DocumentNode,
  variables?: Record<string, any>,
  headers: Record<string, string> = {}
) => {
  let info = await getTenantInfo(config);
  return await info.graphql.client.request({
    document: query,
    variables: variables,
    requestHeaders: headers,
  });
};

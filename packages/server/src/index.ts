import crossFetch from 'cross-fetch';
import { GraphQLClient } from 'graphql-request';
import { DocumentNode } from 'graphql';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { clearCookie, getSignatureFromCookie, sessionCookie } from './cookies';

export type User = {
  uid: string;
  role: string;
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

type Query = <T = any, V = Record<string, any>>(
  query: string | DocumentNode | TypedDocumentNode<T, V>,
  variables?: V,
  headers?: Record<string, string>
) => Promise<T>;

export let app = (app: string, options: Options = {}) => {
  let fetch = options.fetch ?? crossFetch;
  let config = {
    tenantId: app,
    fetch,
    graphqlEndpoint: options.graphqlEndpoint,
  };

  let query: Query = (query, variables, headers) =>
    execHasura(config, query, variables, headers);

  return {
    getUserFromRequest: (req: RequestLike) => getUserFromRequest(config, req),
    getUserFromHeaders: (headers: any) => getUserFromHeaders(config, headers),
    getUserFromToken: (token: string) => getUserFromToken(config, token),

    login: (email: string, password: string) => login(config, email, password),
    createAccount: ({ email, password }: { email: string; password: string }) =>
      createAccount(config, { email, password }),
    verifyPasswordResetCode: (code: string) =>
      verifyPasswordResetCode(config, code),
    sessionCookie: (user: User) => sessionCookie(app, user),
    clearCookie: () => clearCookie(app),

    query,
    mutate: query,

    as: (user: User) => {
      let userHeaders = {
        authorization: `Signature ${user.__signature}`,
      };

      let query: Query = (query, variables, headers) => {
        let _headers = {
          ...headers,
          ...userHeaders,
        };

        return execHasura(config, query, variables, _headers);
      };

      return {
        query,
        mutate: query,
      };
    },

    admin: (secret?: string) => {
      let adminHeaders = {
        'x-hasura-admin-secret':
          secret ?? `${process.env.APPJOINT_HASURA_GRAPHQL_ADMIN_SECRET}`,
      };

      let query: Query = (query, variables, headers) => {
        let _headers = {
          ...headers,
          ...adminHeaders,
        };

        return execHasura(config, query, variables, _headers);
      };

      return {
        query,
        mutate: query,
      };
    },
  };
};

type JSONResponse<T = Record<string, any>> = T;

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

  let { uid, role, signature } = (await response.json()) as JSONResponse;
  let user: User = {
    uid,
    role,
  } as User;

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

let verifyPasswordResetCode = async (config: Config, code: string) => {
  let response = await config.fetch(
    `${appjointApiServer}/apps/${config.tenantId}/verify-password-reset-code`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
      }),
    }
  );

  let json = (await response.json()) as JSONResponse<
    | {
        error: string;
        email: null;
      }
    | {
        email: string;
      }
  >;

  return json.email;
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

  let { uid, role } = (await response.json()) as JSONResponse;
  let user = {
    uid,
    role,
  } as User;

  if (uid) {
    Object.defineProperty(user, '__signature', {
      value: signature,
      enumerable: false,
      writable: false,
    });
  }

  return user.uid ? user : null;
};

let getUserFromRequest = (config: Config, req: RequestLike) =>
  getUserFromHeaders(config, req.headers);

let getUserFromHeaders = (config: Config, headers: any) => {
  if (!headers) {
    return Promise.resolve(null);
  }

  let authHeader = headers.get
    ? headers.get('authorization')
    : headers.authorization;

  if (authHeader) {
    let token = authHeader?.split(' ')[1];
    return getUserFromToken(config, token);
  } else {
    return getUserFromCookie(
      config,
      headers.get ? headers.get('cookie') : headers.cookie
    );
  }
};

type AppInfo = {
  graphql: {
    uri: string;
    client: GraphQLClient;
  };
};

let appInfo = new Map<string, AppInfo>();

let getTenantInfo = (config: Config) => {
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

  return appInfo.get(config.tenantId) as AppInfo;
};

let execHasura = async <T, V>(
  config: Config,
  query: string | DocumentNode | TypedDocumentNode<T, V>,
  variables?: Record<string, any> | V,
  headers: Record<string, string> = {}
) => {
  let info = await getTenantInfo(config);

  // @ts-ignore
  let result = await info.graphql.client.request<T, V>({
    document: query,
    variables: variables,
    requestHeaders: headers,
  });

  return result as T;
};

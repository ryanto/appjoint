import fetch from 'cross-fetch';
import { request } from 'graphql-request';
import { DocumentNode } from 'graphql';
import { clearCookie, getSignatureFromCookie, sessionCookie } from './cookies';

export type User = {
  uid: string;
  __signature: string;
};

type RequestLike = Partial<{ headers: any }>;

let isDevelopingLib = false;
let appJointServer = isDevelopingLib
  ? 'http://localhost:3001'
  : 'https://appjoint.vercel.app';

let appInfo = new Map();

export let app = (app: string, _options = {}) => {
  let query = (query: string | DocumentNode, variables: Record<string, any>) =>
    execHasura(app, query, variables);

  return {
    getUserFromRequest: (req: RequestLike) => getUserFromRequest(app, req),
    getUserFromToken: (token: string) => getUserFromToken(app, token),
    // getSessionCookieFromToken: (token: string) =>
    //   getSessionCookieFromToken(app, token),

    login: (email: string, password: string) => login(app, email, password),
    sessionCookie: (user: User) => sessionCookie(app, user),
    clearCookie: () => clearCookie(app),

    query,
    mutate: query,

    as: (user: User) => {
      let headers = {
        authorization: `Signature ${user.__signature}`,
      };

      let query = (query: string, variables: Record<string, any>) =>
        execHasura(app, query, variables, headers);

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

      let query = (query: string, variables: Record<string, any>) =>
        execHasura(app, query, variables, headers);

      return {
        query,
        mutate: query,
      };
    },
  };
};

type JSONResponse = Record<string, any>;

let getUserFromToken = async (tenantId: string, token: string) => {
  let response = await fetch(
    `${appJointServer}/api/tenants/${tenantId}/user-from-token`,
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

let login = async (tenantId: string, email: string, password: string) => {
  let response = await fetch(
    `${appJointServer}/api/tenants/${tenantId}/login`,
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

let getUserFromCookie = async (tenantId: string, cookie: string) => {
  let signature = getSignatureFromCookie(tenantId, cookie);

  if (!signature) {
    return null;
  }

  let response = await fetch(
    `${appJointServer}/api/tenants/${tenantId}/verify-signature`,
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

let getUserFromRequest = (tenantId: string, req: RequestLike) => {
  if (req.headers.get('authorization')) {
    let authHeader = req.headers.get
      ? req.headers.get('authorization')
      : req.headers.authorization;
    let token = authHeader?.split(' ')[1];
    return getUserFromToken(tenantId, token);
  } else {
    return getUserFromCookie(
      tenantId,
      req.headers.get ? req.headers.get('cookie') : req.headers.cookie
    );
  }
};

let getTenantInfo = async (tenantId: string) => {
  if (!appInfo.get(tenantId)) {
    let response = await fetch(
      `${appJointServer}/api/tenants/${tenantId}/info`
    );

    let json = await response.json();
    appInfo.set(tenantId, json);
  }

  return appInfo.get(tenantId);
};

let execHasura = async (
  tenantId: string,
  query: string | DocumentNode,
  variables: Record<string, any>,
  headers: Record<string, string> = {}
) => {
  let info = await getTenantInfo(tenantId);

  return await request({
    url: info.graphql.uri,
    document: query,
    variables: variables,
    requestHeaders: headers,
  });
};

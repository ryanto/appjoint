import fetch from 'node-fetch';
import { request } from 'graphql-request';
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
  let query = (query: string, variables: Record<string, any>) =>
    execHasura(app, query, variables);

  return {
    // getUserFromCookie: (cookie: string) => getUserFromCookie(app, cookie),
    getUserFromRequest: (req: RequestLike) => getUserFromRequest(app, req),

    // getSessionCookieFromToken: (token: string) =>
    //   getSessionCookieFromToken(app, token),

    login: (email: string, password: string) => login(app, email, password),
    sessionCookie: (user: User) => sessionCookie(app, user),
    clearCookie: () => clearCookie(app),

    query,
    mutate: query,

    // admin:
    // headers['x-hasura-admin-secret'] =
    //   process.env.APPJOINT_HASURA_GRAPHQL_ADMIN_SECRET;

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
  };
};

// rename to getUserFromToken
// let getSessionCookieFromToken = async (tenantId: string, token: string) => {

//   // this needs to request something like user-from-token
//   let response = await fetch(
//     `${appJointServer}/api/tenants/${tenantId}/get-signature`,
//     {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         token,
//       }),
//     }
//   );

//   let { signature } = await response.json();
//   let user = { __signature: signature };

//   return sessionCookie(tenantId, user);
// };

let login = async (
  tenantId: string,
  email: string,
  password: string
): Promise<User> => {
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

  let { user, error } = await response.json();

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

  return user;
};

let getUserFromCookie = async (
  tenantId: string,
  cookie: string
): Promise<User | null> => {
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

  let user = await response.json();

  if (user) {
    Object.defineProperty(user, '__signature', {
      value: signature,
      enumerable: false,
      writable: false,
    });
  }

  return user.uid ? user : null;
};

let getUserFromRequest = (tenantId: string, req: RequestLike) =>
  getUserFromCookie(
    tenantId,
    req.headers.get ? req.headers.get('cookie') : req.headers.cookie
  );

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
  query: string,
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

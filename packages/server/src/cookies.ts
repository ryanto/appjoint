import { parse, serialize } from 'cookie';
import { User } from '.';

let age = 60 * 60 * 24 * 90; // 90 days
let name = (tenantId: string) => `appJointUser-${tenantId}`;

export let clearCookie = (tenantId: string) =>
  makeCookie(name(tenantId), '', { maxAge: 0 });

export let sessionCookie = (tenantId: string, user: User) =>
  makeCookie(name(tenantId), user.__signature, {
    maxAge: age,
  });

export let getSignatureFromCookie = (tenantId: string, cookie: string) => {
  let cookies = parse(cookie || '');
  return cookies[name(tenantId)];
};

let makeCookie = (name: string, value: string, options = {}) => {
  return serialize(name, value, {
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'lax',
    ...options,
  });
};

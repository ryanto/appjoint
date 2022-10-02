import { TestUser } from './apps/test';

export const isTest =
  typeof window !== 'undefined' && !!(window as any).Cypress;

export type TestCurrentUserAccount = {
  uid: string;
  email: string;
  role?: string;
};

export type TestUserAccount = {
  uid: string;
  email: string;
  password: string;
  role?: string;
};

type TestAccount = TestCurrentUserAccount | TestUserAccount;

let userFromAccount = (account: TestAccount): TestUser => {
  let token = {
    uid: account.uid,
    role: account.role,
  };

  return {
    uid: account.uid,
    email: account.email,
    getIdToken: () => Promise.resolve(`echo:${JSON.stringify(token)}`),
  };
};

let bridgedTestCurrentUser: TestCurrentUserAccount | null =
  typeof window !== 'undefined' && (window as any).APPJOINT_GET_CURRENT_USER
    ? (window as any).APPJOINT_GET_CURRENT_USER()
    : null;

export let testCurrentUser = bridgedTestCurrentUser
  ? userFromAccount(bridgedTestCurrentUser)
  : null;

let bridgedUserAccounts: [TestUserAccount] =
  typeof window !== 'undefined' && (window as any).APPJOINT_USER_ACCOUNTS
    ? (window as any).APPJOINT_USER_ACCOUNTS
    : [];

export const findBridgedUserAccount = (
  email: string,
  password?: string
): TestUser | null => {
  let account = bridgedUserAccounts.find(
    bridgedAccount =>
      bridgedAccount.email === email &&
      (!password || bridgedAccount.password === password)
  );

  return account ? userFromAccount(account) : null;
};

let id = 0;

export const addBridgedUserAccount = (
  email: string,
  password: string
): TestUser => {
  let accounts = (window as any).APPJOINT_USER_ACCOUNTS;
  id = id + 1;
  let uid = `uid.test.created.${id}`;
  (window as any).APPJOINT_USER_ACCOUNTS = [
    { uid, email, password },
    ...accounts,
  ];
  return userFromAccount({ uid, email, password });
};

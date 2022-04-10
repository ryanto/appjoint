import { SetStateAction } from 'react';
import { User } from '.';

export type TestUser = {
  email: string;
  getIdToken: () => Promise<string>;
};

export type TestApp = {
  signInTestUser: (email: string, password: string) => Promise<TestUser>;
  createTestUser: (email: string, password: string) => Promise<TestUser>;
  signOutTestUser: () => Promise<void>;
};

export let createTestApp = (
  setUser: React.Dispatch<SetStateAction<User>>
): TestApp => {
  return {
    signInTestUser: async (
      email: string,
      password: string
    ): Promise<TestUser> => {
      let user = findBridgedUserAccount(email, password);
      if (user) {
        setUser(user);
        return Promise.resolve(user);
      } else {
        throw new Error(
          `Could not find test user account for ${email} with password ${password}.`
        );
      }
    },
    createTestUser: async (
      email: string,
      password: string
    ): Promise<TestUser> => {
      let user = findBridgedUserAccount(email);

      if (!user) {
        let user = addBridgedUserAccount(email, password);
        setUser(user);
        return Promise.resolve(user);
      } else {
        throw new Error(
          `Could not create test user account for ${email} because an account with that email already exists.`
        );
      }
    },
    signOutTestUser: async (): Promise<void> => {
      setUser(null);
      return Promise.resolve();
    },
  };
};

export const isTest =
  typeof window !== 'undefined' && !!(window as any).Cypress;

export type TestCurrentUserAccount = {
  id?: string;
  email: string;
  role?: string;
};

export type TestUserAccount = {
  id?: string;
  email: string;
  password: string;
  role?: string;
};

type TestAccount = TestCurrentUserAccount | TestUserAccount;

let userFromAccount = (account: TestAccount): TestUser => {
  let token = {
    id: account.id,
    role: account.role,
  };

  return {
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

export const addBridgedUserAccount = (
  email: string,
  password: string
): TestUser => {
  let accounts = (window as any).APPJOINT_USER_ACCOUNTS;
  (window as any).APPJOINT_USER_ACCOUNTS = [{ email, password }, ...accounts];
  return userFromAccount({ email, password });
};

export type TestUser = {
  uid: string;
  email: string;
  getIdToken: () => Promise<string>;
};

export type TestApp = {
  signInTestUser: (email: string, password: string) => Promise<TestUser>;
  createTestUser: (email: string, password: string) => Promise<TestUser>;
  signOutTestUser: () => Promise<void>;
};

type UserSetter = (user: TestUser | null) => void;

export let createTestApp = (setUser: UserSetter): TestApp => {
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
        let error: Error & { code?: string } = new Error(
          `Could not create test user account for ${email} because an account with that email already exists.`
        );
        error.code = 'auth/email-already-in-use';
        throw error;
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

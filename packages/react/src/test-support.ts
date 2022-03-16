export type TestUser = {
  email: string;
  getIdToken: () => Promise<string>;
};

export type TestApp = {
  signInTestUser: (email: string, password: string) => Promise<TestUser>;
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
  password: string
): TestUser | null => {
  let account = bridgedUserAccounts.find(
    bridgedAccount =>
      bridgedAccount.email === email && bridgedAccount.password === password
  );

  return account ? userFromAccount(account) : null;
};

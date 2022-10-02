import { CreateAccountOptions, SignInOptions } from '../hooks/use-auth';
import { addBridgedUserAccount, findBridgedUserAccount } from '../test-support';

export let testSignIn = async (
  instance: TestApp,
  email: string,
  password: string,
  _options?: Partial<SignInOptions>
) => {
  return instance.signInTestUser(email, password);
};

export let testCreateAccount = async (
  instance: TestApp,
  email: string,
  password: string,
  _options?: Partial<CreateAccountOptions>
) => {
  return instance.createTestUser(email, password);
};

export let testSignOut = async (instance: TestApp) => {
  return instance.signOutTestUser();
};

// ---

export type TestUser = {
  uid: string;
  email: string;
  getIdToken: () => Promise<string>;
};

type UserSetter = (user: TestUser | null) => void;

export type TestApp = ReturnType<typeof createTestApp>;

export let createTestApp = (setUser: UserSetter) => {
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

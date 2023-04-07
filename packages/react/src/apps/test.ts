import { CreateAccountOptions, SignInOptions } from '../hooks/use-auth';
import {
  addBridgedUserAccount,
  findBridgedUserAccount,
  testCurrentUser,
} from '../test-support';

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

export type TestApp = ReturnType<typeof _createTestApp>;

let _app: TestApp | null = null;

export let createTestApp = () => {
  if (!_app) {
    _app = _createTestApp();
  }

  return _app;
};

function _createTestApp() {
  let currentUser = testCurrentUser;
  let updateUser = (_user: TestUser | null) => {};

  setTimeout(() => {
    updateUser(currentUser);
  }, 0);

  return {
    onUserChange: (callback: (user: TestUser | null) => void) => {
      updateUser = callback;
      return () => {
        updateUser = () => {};
      };
    },

    signInTestUser: async (
      email: string,
      password: string
    ): Promise<TestUser> => {
      let user = findBridgedUserAccount(email, password);
      if (user) {
        updateUser(user);
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
        updateUser(user);
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
      updateUser(null);
      return Promise.resolve();
    },
  };
}

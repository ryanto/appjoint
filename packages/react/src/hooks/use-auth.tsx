import { useCallback } from 'react';
import { useApp, User } from './use-app';
import { FirebaseApp } from 'firebase/app';
import {
  firebaseCreateAccount,
  firebaseSignIn,
  firebaseSignOut,
} from '../apps/firebase';
import {
  TestApp,
  testCreateAccount,
  testSignIn,
  testSignOut,
} from '../apps/test';

export type SignInOptions =
  | {
      remember?: boolean;
    }
  | undefined;

export type CreateAccountOptions =
  | {
      remember?: boolean;
    }
  | undefined;

export type SignIn<T = User> = (
  email: string,
  password: string,
  signInOptions?: Partial<SignInOptions>
) => Promise<T>;

export type CreateAccount<T = User> = (
  email: string,
  password: string,
  signInOptions?: Partial<SignInOptions>
) => Promise<T>;

type SignOut = () => Promise<void>;

export const useAuth = () => {
  let app = useApp();
  let { instance, auth, test } = app;

  let createAccount: CreateAccount = useCallback(
    (...args) => {
      return test
        ? testCreateAccount(instance as TestApp, ...args)
        : firebaseCreateAccount(instance as FirebaseApp, ...args);
    },
    [instance, test]
  );

  let signIn: SignIn = useCallback(
    (...args) => {
      return test
        ? testSignIn(instance as TestApp, ...args)
        : firebaseSignIn(instance as FirebaseApp, ...args);
    },
    [instance, test]
  );

  let signOut: SignOut = useCallback(() => {
    return test
      ? testSignOut(instance as TestApp)
      : firebaseSignOut(instance as FirebaseApp);
  }, [instance, test]);

  let setupSessionCookie = useCallback(
    endpoint => _setupSessionCookie(auth.user, endpoint),
    [auth.user]
  );

  return {
    ...auth,
    createAccount,
    signIn,
    signOut,
    setupSessionCookie,
  };
};

// TBD

let _setupSessionCookie = async (user: User, endpoint: string) => {
  if (!user) {
    throw new Error(
      'Cannot setup a session cookie when the user is not logged in.'
    );
  }

  let token = await user.getIdToken();
  let response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
    }),
  });

  if (response.status !== 200) {
    throw 'Could not setup a session cookie';
  }
};

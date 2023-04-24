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

  return {
    ...auth,
    createAccount,
    signIn,
    signOut,
  };
};

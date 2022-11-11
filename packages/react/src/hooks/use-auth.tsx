import { useCallback } from 'react';
import { useApp, User } from './use-app';
import { FirebaseApp } from 'firebase/app';
import {
  firebaseCreateAccount,
  firebaseSignIn,
  firebaseSignOut,
  firebaseSendPasswordResetEmail,
  firebaseResetPassword,
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

type SendPasswordResetEmail = (email: string) => Promise<void>;

type ResetPassword = (code: string, newPassword: string) => Promise<void>;

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

  let sendPasswordResetEmail: SendPasswordResetEmail = useCallback(
    (...args) => {
      return test
        ? Promise.reject('Not implemented yet.')
        : firebaseSendPasswordResetEmail(instance as FirebaseApp, ...args);
    },
    [instance, test]
  );

  let resetPassword: ResetPassword = useCallback(
    (...args) => {
      return test
        ? Promise.reject('Not implemented yet.')
        : firebaseResetPassword(instance as FirebaseApp, ...args);
    },
    [instance, test]
  );

  return {
    ...auth,
    createAccount,
    signIn,
    signOut,
    sendPasswordResetEmail,
    resetPassword,
  };
};

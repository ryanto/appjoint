import { useCallback } from 'react';
import { TestUser, TestApp } from '../test-support';
import { useApp, AppAuth } from './use-app';
import firebase from 'firebase/app';
import 'firebase/auth';

type SignInOptions =
  | {
      remember?: boolean;
    }
  | undefined;

export type SignIn<T> = (
  email: string,
  password: string,
  signInOptions?: Partial<SignInOptions>
) => Promise<T>;

type FirebaseApp = firebase.app.App | undefined;

type FirebaseSignIn = (
  instance: FirebaseApp,
  email: string,
  password: string,
  signInOptions?: Partial<SignInOptions>
) => Promise<firebase.auth.UserCredential>;

let firebaseSignIn: FirebaseSignIn = async (
  instance,
  email,
  password,
  { remember = false } = {}
) => {
  let persistence = remember
    ? firebase.auth.Auth.Persistence.LOCAL
    : firebase.auth.Auth.Persistence.SESSION;

  await firebase.auth(instance).setPersistence(persistence);
  return await firebase
    .auth(instance)
    .signInWithEmailAndPassword(email, password);
};

type TestSignIn = (
  instance: TestApp,
  email: string,
  password: string,
  signInOptions?: Partial<SignInOptions>
) => Promise<TestUser>;

let testSignIn: TestSignIn = async (
  instance,
  email,
  password,
  _options = {}
) => {
  return instance.signInTestUser(email, password);
};

type SignOut = () => Promise<void>;

type AuthFunctions = {
  signIn: SignIn<firebase.auth.UserCredential | TestUser>;
  signOut: SignOut;
};

type UseAuth = () => AppAuth & AuthFunctions;

export const useAuth: UseAuth = () => {
  let app = useApp();
  let { instance, auth, test } = app;

  let signIn: SignIn<firebase.auth.UserCredential | TestUser> = useCallback(
    (...args) => {
      return test
        ? testSignIn(instance as TestApp, ...args)
        : firebaseSignIn(instance as FirebaseApp, ...args);
    },
    [instance, test]
  );

  let signOut: SignOut = useCallback(() => {
    // need to add test support here
    return test
      ? Promise.reject('Not yet implemented.')
      : firebase.auth(instance as FirebaseApp).signOut();
  }, [instance, test]);

  return {
    ...auth,
    signIn,
    signOut,
  };
};

import { useCallback } from 'react';
import { TestUser, TestApp } from '../test-support';
import { useApp } from './use-app';
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

export type CreateAccount<T> = (email: string, password: string) => Promise<T>;

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

type FirebaseCreateAccount = (
  instance: FirebaseApp,
  email: string,
  password: string
) => Promise<firebase.auth.UserCredential>;

let firebaseCreateAccount: FirebaseCreateAccount = async (
  instance,
  email,
  password
) => {
  return await firebase
    .auth(instance)
    .createUserWithEmailAndPassword(email, password);
};

let _setupSessionCookie = async (
  user: firebase.User | TestUser,
  endpoint: string
) => {
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

type TestCreateAccount = (
  instance: TestApp,
  email: string,
  password: string
) => Promise<TestUser>;

let testCreateAccount: TestCreateAccount = async (
  instance,
  email,
  password,
  _options = {}
) => {
  return instance.createTestUser(email, password);
};

type SignOut = () => Promise<void>;

export const useAuth = ({ suspense = false } = {}) => {
  let app = useApp();
  let { instance, initializingPromise, auth, test } = app;

  if (suspense && auth.isInitializing) {
    if (typeof window !== 'undefined') {
      console.log('client suspending');
      throw initializingPromise;
    } else {
      console.log('cannot suspend on server');
      // something like this forces the fallback to render...
      // throw new Error("Rendering Suspense fallback...");
      const e = new Error();
      e.name = 'Rendering Suspense fallback...';
      delete e.stack;
      throw e;
    }
  }

  let createAccount: CreateAccount<
    firebase.auth.UserCredential | TestUser
  > = useCallback(
    (...args) => {
      return test
        ? testCreateAccount(instance as TestApp, ...args)
        : firebaseCreateAccount(instance as FirebaseApp, ...args);
    },
    [instance, test]
  );

  let signIn: SignIn<firebase.auth.UserCredential | TestUser> = useCallback(
    (...args) => {
      return test
        ? testSignIn(instance as TestApp, ...args)
        : firebaseSignIn(instance as FirebaseApp, ...args);
    },
    [instance, test]
  );

  let signOut: SignOut = useCallback(() => {
    return test
      ? (instance as TestApp).signOutTestUser()
      : firebase.auth(instance as FirebaseApp).signOut();
  }, [instance, test]);

  let setupSessionCookie = useCallback(
    endpoint => {
      return auth.user
        ? _setupSessionCookie(auth.user, endpoint)
        : Promise.reject(
            'Cannot setup a session cookie when the user is not logged in.'
          );
    },
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

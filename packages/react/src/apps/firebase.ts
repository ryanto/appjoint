import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  verifyPasswordResetCode,
} from 'firebase/auth';
import { CreateAccountOptions, SignInOptions } from '../hooks/use-auth';

export let firebaseSignIn = async (
  instance: FirebaseApp,
  email: string,
  password: string,
  { remember = true }: Partial<SignInOptions> = {}
) => {
  let _auth = getAuth(instance);

  let persistence = remember
    ? browserLocalPersistence
    : browserSessionPersistence;

  await setPersistence(_auth, persistence);
  let { user } = await signInWithEmailAndPassword(_auth, email, password);
  return user;
};

export let firebaseSignOut = async (instance: FirebaseApp) => {
  let _auth = getAuth(instance);
  return await signOut(_auth);
};

export let firebaseCreateAccount = async (
  instance: FirebaseApp,
  email: string,
  password: string,
  { remember = true }: Partial<CreateAccountOptions> = {}
) => {
  let _auth = getAuth(instance);

  let persistence = remember
    ? browserLocalPersistence
    : browserSessionPersistence;

  await setPersistence(_auth, persistence);
  let { user } = await createUserWithEmailAndPassword(_auth, email, password);
  return user;
};

export let firebaseSendPasswordResetEmail = async (
  instance: FirebaseApp,
  email: string
) => {
  let _auth = getAuth(instance);
  return await sendPasswordResetEmail(_auth, email);
};

export let firebaseVerifyPasswordResetCode = async (
  instance: FirebaseApp,
  code: string
) => {
  let _auth = getAuth(instance);
  return await verifyPasswordResetCode(_auth, code);
};

export let firebaseResetPassword = async (
  instance: FirebaseApp,
  code: string,
  newPassword: string
) => {
  let _auth = getAuth(instance);
  return await confirmPasswordReset(_auth, code, newPassword);
};

// don't ask
let publicKey = ['AIzaSyDg', 'motGx3U', 'Kr0YR32xgdylxcPYCsYrKE'].join('_');

let config = {
  apiKey: publicKey,
  authDomain: 'auth-link-1d555.firebaseapp.com',
};

export let createFirebaseApp = (name: string) => {
  let app =
    getApps().find(fApp => fApp.name === name) || initializeApp(config, name);

  return app;
};

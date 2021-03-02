import React, { createContext, useContext, useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';

let config = {
  apiKey: 'AIzaSyAxQ-HSOfcFkH_YXt2GUXvFoIiY6_ch_nA',
  authDomain: 'auth-link-1d555.firebaseapp.com',
};

type AuthInfo = {
  user: User;
  isLoading: boolean;
  isAuthenticated: boolean;
};

export const AuthContext = createContext<AuthInfo>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

type User = firebase.User | null;

export const AppJointProvider: React.FC<{ app: string }> = ({
  app,
  children,
}): React.ReactElement => {
  let [isLoading, setIsLoading] = useState<boolean>(true);
  let [user, setUser] = useState<User>(null);

  useEffect(() => {
    let isMounted = true;

    if (firebase.apps.length === 0) {
      firebase.initializeApp(config);
    }

    firebase.auth().tenantId = app;
    firebase.auth().onAuthStateChanged((firebaseUser) => {
      if (isMounted) {
        let user = firebaseUser?.tenantId === app ? firebaseUser : null;
        setUser(user);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [app]);

  let isAuthenticated = !!user;

  let providedInfo: AuthInfo = {
    user,
    isAuthenticated,
    isLoading,
  };

  return (
    <AuthContext.Provider value={providedInfo}>{children}</AuthContext.Provider>
  );
};

type SignInOptions =
  | {
      remember?: boolean;
    }
  | undefined;

type SignIn = (
  email: string,
  password: string,
  signInOptions?: Partial<SignInOptions>
) => Promise<firebase.auth.UserCredential>;

type SignOut = () => Promise<void>;

type AuthFunctions = {
  signIn: SignIn;
  signOut: SignOut;
};

let signIn: SignIn = async (email, password, { remember = false } = {}) => {
  let persistence = remember
    ? firebase.auth.Auth.Persistence.LOCAL
    : firebase.auth.Auth.Persistence.SESSION;

  await firebase.auth().setPersistence(persistence);
  return await firebase.auth().signInWithEmailAndPassword(email, password);
};

let signOut: SignOut = () => {
  return firebase.auth().signOut();
};

type UseAuth = () => AuthInfo & AuthFunctions;

export const useAuth: UseAuth = () => {
  let authInfo = useContext(AuthContext);

  return {
    ...authInfo,
    signIn,
    signOut,
  };
};

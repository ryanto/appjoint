import React, { createContext, useContext, useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';

// don't ask
let publicKey = ['AIzaSyDg', 'motGx3U', 'Kr0YR32xgdylxcPYCsYrKE'].join('_');

let config = {
  apiKey: publicKey,
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

export type Plugin = {
  props?: object;
  provider?: any;
};

export const AppJointProvider: React.FC<{ app: string; plugins: Plugin[] }> = ({
  app,
  plugins,
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
    firebase.auth().onAuthStateChanged(firebaseUser => {
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
    <AuthContext.Provider value={providedInfo}>
      <Plugins plugins={plugins}>{children}</Plugins>
    </AuthContext.Provider>
  );
};

let Plugins: React.FC<{ plugins: Plugin[] }> = ({
  plugins,
  children,
}): React.ReactElement => {
  let [first, ...rest] = plugins;

  return (
    <PluginProvider plugin={first}>
      {rest.length > 0 ? (
        <Plugins plugins={rest}>{children}</Plugins>
      ) : (
        <>{children}</>
      )}
    </PluginProvider>
  );
};

let PluginProvider: React.FC<{ plugin: Plugin }> = ({
  plugin,
  children,
}): React.ReactElement => {
  let Provider = plugin.provider;
  return <Provider {...plugin.props} children={children} />;
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

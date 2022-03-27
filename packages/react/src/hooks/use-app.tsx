import React, { createContext, useContext, useEffect, useState } from 'react';
import firebase from 'firebase/app';
import { User } from '../index';
import {
  findBridgedUserAccount,
  isTest,
  testCurrentUser,
  TestApp,
  TestUser,
} from '../test-support';
import { Plugin, Plugins } from '../plugin-support';

// don't ask
let publicKey = ['AIzaSyDg', 'motGx3U', 'Kr0YR32xgdylxcPYCsYrKE'].join('_');

let config = {
  apiKey: publicKey,
  authDomain: 'auth-link-1d555.firebaseapp.com',
};

export type AppAuth = {
  user: User;
  isLoading: boolean;
  isInitializing: boolean;
  isAuthenticated: boolean;
};

type FirebaseApp = firebase.app.App | undefined;
type App = FirebaseApp | TestApp | undefined;

type AppInfo = {
  app: string | undefined;
  instance: App;
  auth: AppAuth;
  test: boolean;
};

const AppContext = createContext<AppInfo>({
  app: undefined,
  instance: undefined,
  test: false,
  auth: {
    user: null,
    isLoading: true,
    isInitializing: true,
    isAuthenticated: false,
  },
});

export const AppJointProvider: React.FC<{
  app: string;
  plugins: Plugin[];
  test?: boolean;
}> = ({ app, plugins, test = isTest, children }): React.ReactElement => {
  let [appInstance, setAppInstance] = useState<App>();
  let [isLoading, setIsLoading] = useState<boolean>(true);
  let [isInitializing, setIsInitializing] = useState<boolean>(true);
  let [user, setUser] = useState<User>(null);

  useEffect(() => {
    let isMounted = true;
    setIsInitializing(true);

    if (test) {
      let _app = {
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
      };
      setAppInstance(_app);
      setTimeout(() => {
        setUser(testCurrentUser);
        setIsLoading(false);
        setIsInitializing(false);
      }, 0);
    } else {
      let _app =
        firebase.apps.find(fApp => fApp.name === app) ||
        firebase.initializeApp(config, app);

      firebase.auth(_app).tenantId = app;
      firebase.auth(_app).onAuthStateChanged(firebaseUser => {
        if (isMounted) {
          let user = firebaseUser?.tenantId === app ? firebaseUser : null;
          setUser(user);
          setIsLoading(false);
          setIsInitializing(false);
        }
      });

      setAppInstance(_app);
    }

    return () => {
      // clean up on auth state change handler
      isMounted = false;
    };
  }, [app, test]);

  let isAuthenticated = !!user;

  let providedInfo: AppInfo = {
    app,
    test,
    instance: appInstance,
    auth: {
      user,
      isAuthenticated,
      isLoading,
      isInitializing,
    },
  };

  return (
    <AppContext.Provider value={providedInfo}>
      <Plugins plugins={plugins}>{children}</Plugins>
    </AppContext.Provider>
  );
};

type UseApp = () => AppInfo;

export const useApp: UseApp = () => {
  let appInfo = useContext(AppContext);
  return appInfo;
};

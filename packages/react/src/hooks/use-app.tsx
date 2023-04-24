import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { FirebaseApp } from 'firebase/app';
import {
  browserLocalPersistence,
  initializeAuth,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { isTest } from '../test-support';
import { Plugin, Plugins } from '../plugin-support';
import { createFirebaseApp } from '../apps/firebase';
import { createTestApp, TestApp, TestUser } from '../apps/test';
import { Callback } from './use-callbacks';

export type AppAuth = {
  user: User;
  isPending: boolean;
  isInitializing: boolean;
  isAuthenticated: boolean;
};

type AppCallbacks = {
  run: (queue: string, data?: unknown) => Promise<void>;
  register: (queue: string, callback: Callback) => void;
};

export type App = FirebaseApp | TestApp | undefined;
export type User = FirebaseUser | TestUser | null;

type AppInfo = {
  app: string | undefined;
  instance: App;
  auth: AppAuth;
  callbacks: AppCallbacks;
  test: boolean;
};

let mustBeUsedInsideProvider = () => {
  throw new Error('Called outside of <AppJoint> provider');
};

const AppContext = createContext<AppInfo>({
  app: undefined,
  instance: undefined,
  test: false,
  auth: {
    user: null,
    isPending: false,
    isInitializing: true,
    isAuthenticated: false,
  },
  callbacks: {
    run: mustBeUsedInsideProvider,
    register: mustBeUsedInsideProvider,
  },
});

type ProviderProps = {
  app: string;
  plugins?: Plugin[];
  test?: boolean;
  children: ReactNode;
};

export const AppJointProvider = ({
  app,
  plugins,
  test = isTest,
  children,
}: ProviderProps) => {
  let [appInstance, setAppInstance] = useState<App>();
  let [isPending, setIsPending] = useState(false);
  let [isInitializing, setIsInitializing] = useState(true);
  let [user, _setUser] = useState<User | null>(null);
  let [callbacks, setCallbacks] = useState<
    { queue: string; callback: Callback }[]
  >([]);

  let registerCallback = useCallback((queue: string, callback: Callback) => {
    let id = {
      queue,
      callback,
    };

    setCallbacks(current => [...current, id]);
    return () => {
      setCallbacks(current => current.filter(c => c !== id));
    };
  }, []);

  let runCallbacks = useCallback(
    async (queue: string, data?: unknown) => {
      let promises = callbacks
        .filter(({ queue: name }) => name === queue)
        .map(({ callback }) => callback(data));
      await Promise.all(promises);
    },
    [callbacks]
  );

  let setAppUser = useCallback(
    async (user: User | null) => {
      setIsPending(true);
      await runCallbacks('before:setUser', user);
      _setUser(user);
      store.user = user;
      setIsPending(false);
    },
    [runCallbacks]
  );

  useEffect(() => {
    let _app: App;
    let unsubscribe: () => void;

    if (test) {
      _app = createTestApp();

      unsubscribe = _app.onUserChange(async user => {
        await setAppUser(user);
        setIsInitializing(false);
      });
    } else {
      _app = createFirebaseApp(app);

      let _auth = initializeAuth(_app, {
        persistence: browserLocalPersistence,
      });
      _auth.tenantId = app;
      unsubscribe = onAuthStateChanged(_auth, async firebaseUser => {
        let user = firebaseUser?.tenantId === app ? firebaseUser : null;
        await setAppUser(user);
        setIsInitializing(false);
      });
    }

    setAppInstance(_app);

    return unsubscribe;
  }, [app, test, setAppUser]);

  let isAuthenticated = !!user;

  let providedInfo: AppInfo = {
    app,
    test,
    instance: appInstance,
    auth: {
      user,
      isAuthenticated,
      isPending,
      isInitializing,
    },
    callbacks: {
      run: runCallbacks,
      register: registerCallback,
    },
  };

  return (
    <AppContext.Provider value={providedInfo}>
      <Plugins plugins={plugins}>{children}</Plugins>
    </AppContext.Provider>
  );
};

export const useApp = (): AppInfo => {
  let appInfo = useContext(AppContext);
  return appInfo;
};

type Store = {
  user: User | null;
};

export const store: Store = {
  user: null,
};

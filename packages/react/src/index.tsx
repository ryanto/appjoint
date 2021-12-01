import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';

// don't ask
let publicKey = ['AIzaSyDg', 'motGx3U', 'Kr0YR32xgdylxcPYCsYrKE'].join('_');

let config = {
  apiKey: publicKey,
  authDomain: 'auth-link-1d555.firebaseapp.com',
};

type TestUser = {
  email: string;
  getIdToken: () => Promise<string>;
};
type User = firebase.User | TestUser | null;
type App = firebase.app.App | undefined;

type AuthInfo = {
  user: User;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type TestHelpers = {
  signInTestUser: (email: string, password: string) => Promise<TestUser>;
};

type AppInfo = {
  app: string | undefined;
  instance: App;
  auth: AuthInfo;
  test: boolean;
  testHelpers?: TestHelpers;
};

export const AppContext = createContext<AppInfo>({
  app: undefined,
  instance: undefined,
  test: false,
  auth: {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  },
});

export type Plugin = {
  props?: object;
  provider?: any;
};

let isTest = typeof window !== 'undefined' && !!(window as any).Cypress;

let bridgedTestCurrentUser =
  typeof window !== 'undefined' && (window as any).APPJOINT_GET_CURRENT_USER
    ? (window as any).APPJOINT_GET_CURRENT_USER()
    : null;

type TestCurrentUser = {
  id?: string;
  email: string;
  role?: string;
};

type TestUserAccount = {
  id?: string;
  email: string;
  password: string;
  role?: string;
};

let testUser = (user: TestUserAccount | TestCurrentUser): TestUser => {
  let token = {
    id: user.id,
    role: user.role,
  };

  return {
    email: user.email,
    getIdToken: () => Promise.resolve(`echo:${JSON.stringify(token)}`),
  };
};

let testCurrentUser = bridgedTestCurrentUser
  ? testUser(bridgedTestCurrentUser)
  : null;

let bridgedUserAccounts: [TestUserAccount] =
  typeof window !== 'undefined' && (window as any).APPJOINT_USER_ACCOUNTS
    ? (window as any).APPJOINT_USER_ACCOUNTS
    : [];

let findBridgedUserAccount = (
  email: string,
  password: string
): TestUser | null => {
  let userAccount = bridgedUserAccounts.find(
    bridgedAccount =>
      bridgedAccount.email === email && bridgedAccount.password === password
  );

  return userAccount ? testUser(userAccount) : null;
};

export const AppJointProvider: React.FC<{
  app: string;
  plugins: Plugin[];
  test?: boolean;
}> = ({ app, plugins, test = isTest, children }): React.ReactElement => {
  let [appInstance, setAppInstance] = useState<App>();
  let [isLoading, setIsLoading] = useState<boolean>(true);
  let [user, setUser] = useState<User>(null);

  useEffect(() => {
    let isMounted = true;

    if (test) {
      setAppInstance(undefined);
      setTimeout(() => {
        setUser(testCurrentUser);
        setIsLoading(false);
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
    },
  };

  if (test) {
    providedInfo.testHelpers = {
      signInTestUser: async (
        email: string,
        password: string
      ): Promise<TestUser> => {
        let user = findBridgedUserAccount(email, password);
        if (user) {
          setUser(user);
          return Promise.resolve(user);
        } else {
          throw new Error(`Could not find test user account for ${email}.`);
        }
      },
    };
  }

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
) => Promise<firebase.auth.UserCredential | TestUser>;

type InstanceSignIn = (
  instance: App,
  email: string,
  password: string,
  signInOptions?: Partial<SignInOptions>
) => Promise<firebase.auth.UserCredential>;

type SignOut = () => Promise<void>;

let instanceSignIn: InstanceSignIn = async (
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
  testHelpers: TestHelpers,
  email: string,
  password: string,
  signInOptions?: Partial<SignInOptions>
) => Promise<TestUser>;

let testSignIn: TestSignIn = async (
  testHelpers,
  email,
  password,
  _options = {}
) => {
  return testHelpers.signInTestUser(email, password);
};

type AuthFunctions = {
  signIn: SignIn;
  signOut: SignOut;
};

type UseAuth = () => AuthInfo & AuthFunctions;

export const useAuth: UseAuth = () => {
  let app = useApp();
  let { instance, auth, test, testHelpers } = app;

  let signIn: SignIn = useCallback(
    (...args) => {
      return test && testHelpers
        ? testSignIn(testHelpers, ...args)
        : instanceSignIn(instance, ...args);
    },
    [testHelpers, instance, test]
  );

  let signOut: SignOut = useCallback(() => {
    // need to add test support here
    return firebase.auth(instance).signOut();
  }, [instance]);

  return {
    ...auth,
    signIn,
    signOut,
  };
};

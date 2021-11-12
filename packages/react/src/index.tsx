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

type UserProps = {
  email: string;
  getIdToken: () => Promise<string>;
};

type User = firebase.User | UserProps | null;
type App = firebase.app.App | undefined;

type AppInfo = {
  app: string | undefined;
  instance: App;
  auth: AuthInfo;
  test: boolean;
};

type AuthInfo = {
  user: User;
  isLoading: boolean;
  isAuthenticated: boolean;
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

export const AppJointProvider: React.FC<{
  app: string;
  plugins: Plugin[];
  test?: boolean;
}> = ({ app, plugins, test = false, children }): React.ReactElement => {
  let [appInstance, setAppInstance] = useState<App>();
  let [isLoading, setIsLoading] = useState<boolean>(true);
  let [user, setUser] = useState<User>(null);

  useEffect(() => {
    let isMounted = true;

    if (test) {
      setAppInstance(undefined);
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

  return (
    <AppContext.Provider value={providedInfo}>
      <Plugins plugins={plugins}>{children}</Plugins>
    </AppContext.Provider>
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

let testSignIn: SignIn = async (email, password, { remember = false } = {}) => {
  console.log('testing sign in', email, password, remember);

  return {
    credential: null,
    user: null,
  };
};

type AuthFunctions = {
  signIn: SignIn;
  signOut: SignOut;
};

type UseAuth = () => AuthInfo & AuthFunctions;

export const useAuth: UseAuth = () => {
  let { instance, auth, test } = useContext(AppContext);

  let signIn: SignIn = useCallback(
    (...args) => {
      return test ? testSignIn(...args) : instanceSignIn(instance, ...args);
    },
    [instance, test]
  );

  let signOut: SignOut = useCallback(() => {
    return firebase.auth(instance).signOut();
  }, [instance]);

  let testUser = {
    email: 'ryanto@gmail.com',
    getIdToken: () => Promise.resolve('test-user-id-token'),
  };

  let testAuth = {
    user: testUser,
    isLoading: false,
    isAuthenticated: true,
  };

  return {
    ...(test ? testAuth : auth),
    signIn,
    signOut,
  };
};

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

type User = firebase.User | null;
type App = firebase.app.App | undefined;

type AppInfo = {
  app: string | undefined;
  instance: App;
  auth: AuthInfo;
};

type AuthInfo = {
  user: User;
  isLoading: boolean;
  isAuthenticated: boolean;
};

export const AppContext = createContext<AppInfo>({
  app: undefined,
  instance: undefined,
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

export const AppJointProvider: React.FC<{ app: string; plugins: Plugin[] }> = ({
  app,
  plugins,
  children,
}): React.ReactElement => {
  let [appInstance, setAppInstance] = useState<App>();
  let [isLoading, setIsLoading] = useState<boolean>(true);
  let [user, setUser] = useState<User>(null);

  useEffect(() => {
    let isMounted = true;

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

    return () => {
      isMounted = false;
    };
  }, [app]);

  let isAuthenticated = !!user;

  let providedInfo: AppInfo = {
    app,
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

type SignOut = () => Promise<void>;

type AuthFunctions = {
  signIn: SignIn;
  signOut: SignOut;
};

type UseAuth = () => AuthInfo & AuthFunctions;

export const useAuth: UseAuth = () => {
  let appInfo = useContext(AppContext);

  let signIn: SignIn = useCallback(
    async (email, password, { remember = false } = {}) => {
      let persistence = remember
        ? firebase.auth.Auth.Persistence.LOCAL
        : firebase.auth.Auth.Persistence.SESSION;

      await firebase.auth(appInfo.instance).setPersistence(persistence);
      return await firebase
        .auth(appInfo.instance)
        .signInWithEmailAndPassword(email, password);
    },
    [appInfo.instance]
  );

  let signOut: SignOut = useCallback(() => {
    return firebase.auth(appInfo.instance).signOut();
  }, [appInfo.instance]);

  return {
    ...appInfo.auth,
    signIn,
    signOut,
  };
};

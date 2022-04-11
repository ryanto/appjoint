import { AppJoint, useAuth } from "@appjoint/react";
import { Login } from "../components/login";
import { useRouter } from "next/router";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <AppJoint app="Demo-app-hpdwq">
      <InnerApp>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </InnerApp>
    </AppJoint>
  );
}

function InnerApp({ children }) {
  let { isInitializing, isAuthenticated } = useAuth();
  let { asPath } = useRouter();

  let publicRoutes = ["/sign-up"];

  let isPublicPage = publicRoutes.includes(asPath);

  return isInitializing ? (
    <></>
  ) : isAuthenticated || isPublicPage ? (
    children
  ) : (
    <Login />
  );
}

function Layout({ children }) {
  return (
    <div className="flex-col min-h-screen lex">
      <div className="grow">{children}</div>
    </div>
  );
}

export default MyApp;

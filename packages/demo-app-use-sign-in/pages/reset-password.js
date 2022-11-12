import { useApp, useAuth } from "@appjoint/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ResetPasswordPage() {
  let [isInitializing, setIsInitializing] = useState(true);
  let { verifyResetPasswordCode, resetPassword, signIn, user } = useAuth();
  let { app } = useApp();
  let [email, setEmail] = useState();
  let [error, setError] = useState();
  let [isSubmitting, setIsSubmitting] = useState(false);
  let [didReset, setDidReset] = useState(false);

  let isValid = !isInitializing && email;
  let isInvalid = !isInitializing && !email;

  let router = useRouter();
  let tenantId = router.query.tenantId;
  let code = router.query.oobCode;

  useEffect(() => {
    // only run if we have all the query params and we don't know what the
    // email for this reset link is.
    if (router.isReady && !email) {
      if (!tenantId || tenantId !== app) {
        // invalid reset link
        setIsInitializing(false);
        setEmail(null);
      }

      if (tenantId && app && tenantId === app) {
        // lets try to validate the reset link from firebase
        // and get the users email address
        let verify = async () => {
          try {
            let email = await verifyResetPasswordCode(code);
            setEmail(email);
          } catch (e) {
            setEmail(null);
          }
          setIsInitializing(false);
        };

        verify();
      }
    }
  }, [tenantId, code, app, verifyResetPasswordCode, router.isReady, email]);

  let handleSubmit = async event => {
    event.preventDefault();
    setIsSubmitting(true);

    let form = event.target;
    let newPassword = form.password.value;

    try {
      await resetPassword(code, newPassword);
      await signIn(email, newPassword);
      setError(null);
      setDidReset(true);
    } catch (e) {
      setError(e);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="relative z-10 flex flex-col justify-center min-h-screen px-12 py-12 sm:bg-gray-50 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
          Reset password
        </h2>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-6 py-8 bg-white sm:shadow sm:rounded-lg sm:px-10">
          {isInitializing ? (
            <div className="text-center">Loading...</div>
          ) : user && didReset ? (
            <div>
              Password reset successful! You are now logged into your account.
              Click here to access the{" "}
              <Link href="/">
                <a className="underline">homepage</a>
              </Link>
              .
            </div>
          ) : isInvalid ? (
            <div className="text-center">Error: Invalid reset link</div>
          ) : isValid ? (
            <div>
              {error && (
                <div className="px-3 py-4 mb-8 text-xs text-white bg-red-500 rounded-md shadow">
                  <h3 className="mb-2 text-sm font-semibold">
                    Could not reset password
                  </h3>
                  There was an error: {error.message}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      data-test="email"
                      type="email"
                      autoComplete="email"
                      disabled
                      defaultValue={email}
                      className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    New password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      data-test="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isSubmitting ? "bg-opacity-60" : ""
                    }`}
                  >
                    Reset password
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>Something wrong</div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useApp, useAuth } from "@appjoint/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function ForgotPasswordPage() {
  let { resetPassword } = useAuth();
  let { app } = useApp();
  let [error, setError] = useState();
  let [isSubmitting, setIsSubmitting] = useState(false);
  let [didReset, setDidReset] = useState(false);

  let { query } = useRouter();

  let handleSubmit = async event => {
    event.preventDefault();
    setIsSubmitting(true);

    let form = event.target;
    let newPassword = form.password.value;

    let tenantId = query.tenantId;
    let code = query.oobCode;

    try {
      if (tenantId !== app) {
        throw new Error("Invalid reset link");
      }

      await resetPassword(code, newPassword);
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
          {error && (
            <div className="px-3 py-4 mb-8 text-xs text-white bg-red-500 rounded-md shadow">
              <h3 className="mb-2 text-sm font-semibold">
                Could not reset password
              </h3>
              There was an error: {error.message}
            </div>
          )}
          {didReset && (
            <div className="px-3 py-4 mb-8 text-xs text-white bg-green-500 rounded-md shadow">
              <h3 className="mb-2 text-sm font-semibold">
                Password successfully reset!
              </h3>
              Visit the <Link href="/">home page</Link> to login.
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
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
      </div>
    </div>
  );
}

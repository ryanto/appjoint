import { usePasswordReset } from "@appjoint/react";
import { useState } from "react";

export default function ForgotPasswordPage() {
  let { sendPasswordResetEmail } = usePasswordReset();
  let [error, setError] = useState();
  let [isSubmitting, setIsSubmitting] = useState(false);
  let [didSend, setDidSend] = useState(false);

  let handleSubmit = async event => {
    event.preventDefault();
    setIsSubmitting(true);

    let form = event.target;
    let email = form.email.value;

    try {
      await sendPasswordResetEmail(
        email,
        "http://localhost:3000/reset-password"
      );
      setDidSend(true);
    } catch (e) {
      setError(e);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="relative z-10 flex flex-col justify-center min-h-screen px-12 py-12 sm:bg-gray-50 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
          Forgot password
        </h2>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-6 py-8 bg-white sm:shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="px-3 py-4 mb-8 text-xs text-white bg-red-500 rounded-md shadow">
              <h3 className="mb-2 text-sm font-semibold">
                Could not recover password
              </h3>
              There was an error: {error.message}
            </div>
          )}
          {didSend && (
            <div className="px-3 py-4 mb-8 text-xs text-white bg-green-500 rounded-md shadow">
              <h3 className="mb-2 text-sm font-semibold">
                Password recovery email sent!
              </h3>
              Check your email for a link to recover your password.
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

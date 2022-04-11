import { FormEvent, useState } from 'react';
import { SignIn, useAuth } from './use-auth';

type Form<U extends string> = HTMLFormElement & Record<U, HTMLInputElement>;

export let useLoginForm = () => {
  let [isSubmitting, setIsSubmitting] = useState(false);
  let [error, setError] = useState<Error>();
  let { signIn } = useAuth();

  let _signIn: SignIn<void> = async (...args) => {
    setIsSubmitting(true);
    try {
      await signIn(...args);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  let handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let form = event.target as Form<'email' | 'password' | 'remember'>;
    await _signIn(form.email?.value, form.password?.value, {
      remember: form.remember?.checked,
    });
  };

  let formProps = {
    onSubmit: handleSubmit,
  };

  return {
    isSubmitting,
    error,
    formProps,
  };
};

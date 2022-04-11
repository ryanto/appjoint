import { FormEvent, useState } from 'react';
import { CreateAccount, useAuth } from './use-auth';

type Form<U extends string> = HTMLFormElement & Record<U, HTMLInputElement>;

export let useCreateAccountForm = () => {
  let [isSubmitting, setIsSubmitting] = useState(false);
  let [error, setError] = useState<Error>();
  let { createAccount } = useAuth();

  let _createAccount: CreateAccount<void> = async (...args) => {
    setIsSubmitting(true);
    try {
      await createAccount(...args);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  let handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let form = event.target as Form<'email' | 'password'>;
    await _createAccount(form.email?.value, form.password?.value);
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

import { useCallback } from 'react';
import { useApp } from './use-app';
import { FirebaseApp } from 'firebase/app';
import {
  firebaseResetPassword,
  firebaseVerifyPasswordResetCode,
} from '../apps/firebase';

type SendPasswordResetEmail = (
  email: string,
  resetUrl: string
) => Promise<void>;
type VerifyPasswordResetCode = (code: string) => Promise<string>;
type ResetPassword = (code: string, newPassword: string) => Promise<void>;

export const usePasswordReset = () => {
  let { app, instance, test } = useApp();

  if (!app) {
    throw new Error('usePasswordReset called outside of <AppJoint> provider');
  }

  let appName = app;

  let sendPasswordResetEmail: SendPasswordResetEmail = useCallback(
    (...args) => {
      return test
        ? Promise.reject('Not implemented yet.')
        : _sendPasswordResetEmail(appName, ...args);
    },
    [instance, test]
  );

  let verifyPasswordResetCode: VerifyPasswordResetCode = useCallback(
    (...args) => {
      return test
        ? Promise.reject('Not implemented yet.')
        : firebaseVerifyPasswordResetCode(instance as FirebaseApp, ...args);
    },
    [instance, test]
  );

  let resetPassword: ResetPassword = useCallback(
    (...args) => {
      return test
        ? Promise.reject('Not implemented yet.')
        : firebaseResetPassword(instance as FirebaseApp, ...args);
    },
    [instance, test]
  );

  return {
    sendPasswordResetEmail,
    verifyPasswordResetCode,
    resetPassword,
  };
};

async function _sendPasswordResetEmail(
  appName: string,
  email: string,
  url: string
) {
  let response = await fetch(
    `https://appjoint.app/api/apps/${appName}/forgot-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        url,
      }),
    }
  );

  if (!response.ok) {
    let json = await response.json();
    throw new Error(`Failed to send password reset email: ${json.error}`);
  }
}

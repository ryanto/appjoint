import {
  TestUser,
  TestUserAccount,
  TestCurrentUserAccount,
} from './test-support';
import firebase from 'firebase/app';

// types
export { Plugin } from './plugin-support';
export type User = firebase.User | TestUser | null;
export { TestUserAccount };
export { TestCurrentUserAccount };

// code
export { isTest } from './test-support';
export { useAuth } from './hooks/use-auth';
export { useLoginForm } from './hooks/use-login-form';
export { useCreateAccountForm } from './hooks/use-create-account-form';
export { useApp, AppJointProvider as AppJoint } from './hooks/use-app';
export { getAuthorizationHeader } from './helpers';

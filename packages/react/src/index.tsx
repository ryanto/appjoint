import { TestUser } from './test-support';
import firebase from 'firebase/app';

// types
export { Plugin } from './plugin-support';
export type User = firebase.User | TestUser | null;

// code
export { isTest } from './test-support';
export { useAuth } from './hooks/use-auth';
export { useApp, AppJointProvider as AppJoint } from './hooks/use-app';

import { store } from './hooks/use-app';

export const getAuthorizationHeader = async (): Promise<string> => {
  let token = await store.user?.getIdToken();
  return token ? `Bearer ${token}` : '';
};

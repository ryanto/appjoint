import { store } from './hooks/use-app';

export const getAuthorizationHeader = async (): Promise<string> => {
  let token = await getToken();
  return token ? `Bearer ${token}` : '';
};

export const getToken = () => store.user?.getIdToken();

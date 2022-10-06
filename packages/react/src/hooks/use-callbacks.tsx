import { useEffect, useRef } from 'react';
import { useApp } from './use-app';

export type Callback<T = any> = (data?: T) => void | Promise<void>;

// need to upgrade typescript for this to work
// type UseBefore = {
//   (queue: 'setUser', callback: Callback<User>): void;
//   (queue: string, callback: Callback): void;
// };

// old version of typescript, remove after upgrading
type UseBefore<T = any> = (queue: string, callback: Callback<T>) => void;

export const useBefore: UseBefore = (queue, callback) => {
  let { callbacks } = useApp();
  let callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return callbacks.register(`before:${queue}`, data => {
      callbackRef.current(data);
    });
  }, [queue, callbacks.register]);
};

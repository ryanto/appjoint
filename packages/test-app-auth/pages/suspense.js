import { useAuth } from '@appjoint/react';

export default function Suspense() {
  console.log('attempting to render suspended page');
  let { isInitializing } = useAuth({ suspense: true });

  if (isInitializing) {
    throw new Error(
      'We should never get here, if auth is initializing we should be suspended!'
    );
  }

  return (
    <div data-test="done-initializing">
      Initializing: {isInitializing ? 'YES' : 'NO'}
    </div>
  );
}

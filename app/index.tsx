import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { isPinUnlockedThisSession } from '../src/utils/pinGate';
import { ensureDemoDataSeeded } from '../src/utils/seedDemoData';

export default function RootIndex() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        await ensureDemoDataSeeded();
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) return null;

  // Cold launch always lands here. If the app was killed, this resets to locked.
  return <Redirect href={isPinUnlockedThisSession() ? '/(tabs)' : '/pin'} />;
}


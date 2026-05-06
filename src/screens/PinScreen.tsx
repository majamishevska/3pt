import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { colors, radius, spacing, typography } from '../utils/theme';
import { PinScreenHeader } from '../components/pin/PinScreenHeader';
import type { BearLogoState } from '../components/pin/AnimatedBearLogo';
import { isPinUnlockedThisSession, markPinUnlockedThisSession } from '../utils/pinGate';
import { getStoredPin } from '../utils/pinStorage';
import { PinKeypad } from '../components/pin/PinKeypad';

const PIN_LEN = 4;

export default function PinScreen() {
  const unlocked = isPinUnlockedThisSession();

  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<'idle' | 'typing' | 'success' | 'error'>('idle');
  const [typingTick, setTypingTick] = useState(0);
  const [storedPin, setStoredPinState] = useState<string | null>(null);

  const bearState: BearLogoState = useMemo(() => {
    if (status === 'success') return 'success';
    if (pin.length > 0) return 'typing';
    return 'default';
  }, [pin.length, status]);

  useEffect(() => {
    void (async () => {
      setStoredPinState(await getStoredPin());
    })();
  }, []);

  if (unlocked) {
    return <Redirect href="/(tabs)" />;
  }

  const tryComplete = (nextPin: string) => {
    if (nextPin.length === PIN_LEN) {
      const expected = storedPin ?? '';
      if (expected && nextPin === expected) {
        setStatus('success');
        setTimeout(() => {
          markPinUnlockedThisSession();
          router.replace('/(tabs)' as any);
        }, 450);
      } else {
        setStatus('error');
        setTimeout(() => {
          setPin('');
          setStatus('idle');
        }, 650);
      }
    }
  };

  const addDigit = (d: string) => {
    if (status === 'success') return;
    setTypingTick((t) => t + 1);
    setPin((prev) => {
      const next = (prev + d).slice(0, PIN_LEN);
      setStatus(next.length > 0 ? 'typing' : 'idle');
      tryComplete(next);
      return next;
    });
  };

  const backspace = () => {
    if (status === 'success') return;
    setTypingTick((t) => t + 1);
    setPin((prev) => {
      const next = prev.slice(0, -1);
      setStatus(next.length > 0 ? 'typing' : 'idle');
      return next;
    });
  };

  const clearAll = () => {
    if (status === 'success') return;
    setTypingTick((t) => t + 1);
    setPin('');
    setStatus('idle');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top']}>
      <View style={{ flex: 1, padding: spacing.lg, alignItems: 'center', justifyContent: 'center' }}>
        <PinScreenHeader bearState={bearState} logoSize={240} typingTick={typingTick} />

        <View style={{ height: spacing.lg }} />

        <View
          style={{
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.xl,
            borderRadius: radius.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.divider,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {Array.from({ length: PIN_LEN }).map((_, idx) => {
              const filled = idx < pin.length;
              return (
                <View
                  key={idx}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: filled ? colors.text : colors.divider,
                  }}
                />
              );
            })}
          </View>

          <Text style={{ marginTop: spacing.md, ...typography.helper, fontSize: 13 }}>
            {status === 'success' ? 'Unlocked' : status === 'error' ? 'Incorrect PIN' : 'Enter your PIN'}
          </Text>
        </View>

        <View style={{ height: spacing.lg }} />

        <PinKeypad
          disabled={status === 'success' || storedPin === null}
          onDigit={addDigit}
          onBackspace={backspace}
          onClear={clearAll}
        />
      </View>
    </SafeAreaView>
  );
}


import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ScreenHeader } from '../components/ScreenHeader';
import { PinScreenHeader } from '../components/pin/PinScreenHeader';
import { PinKeypad } from '../components/pin/PinKeypad';
import type { BearLogoState } from '../components/pin/AnimatedBearLogo';
import { colors, radius, spacing, typography } from '../utils/theme';
import { getStoredPin, setStoredPin } from '../utils/pinStorage';
import { useAvatarBackgroundStyle } from '../hooks/useAvatarBackgroundStyle';

const PIN_LEN = 4;

type Step = 'verifyCurrent' | 'newPin' | 'confirmPin' | 'done';

export default function PinChangeScreen() {
  const bg = useAvatarBackgroundStyle();
  const [storedPin, setStoredPinState] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('verifyCurrent');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [status, setStatus] = useState<'idle' | 'typing' | 'success' | 'error'>('idle');
  const [typingTick, setTypingTick] = useState(0);

  useEffect(() => {
    void (async () => {
      setStoredPinState(await getStoredPin());
    })();
  }, []);

  const bearState: BearLogoState = useMemo(() => {
    if (status === 'success') return 'success';
    if (pin.length > 0) return 'typing';
    return 'default';
  }, [pin.length, status]);

  const prompt = useMemo(() => {
    if (step === 'verifyCurrent') return status === 'error' ? 'Incorrect PIN' : 'Enter current PIN';
    if (step === 'newPin') return 'Enter new PIN';
    if (step === 'confirmPin') return status === 'error' ? 'PINs did not match' : 'Confirm new PIN';
    return 'Updated';
  }, [status, step]);

  const resetWithError = () => {
    setStatus('error');
    setTimeout(() => {
      setPin('');
      setStatus('idle');
    }, 650);
  };

  const tryComplete = (nextPin: string) => {
    if (nextPin.length !== PIN_LEN) return;

    if (step === 'verifyCurrent') {
      if ((storedPin ?? '') && nextPin === storedPin) {
        setStatus('success');
        setTimeout(() => {
          setPin('');
          setStatus('idle');
          setStep('newPin');
        }, 350);
      } else {
        resetWithError();
      }
      return;
    }

    if (step === 'newPin') {
      setNewPin(nextPin);
      setStatus('success');
      setTimeout(() => {
        setPin('');
        setStatus('idle');
        setStep('confirmPin');
      }, 350);
      return;
    }

    if (step === 'confirmPin') {
      if (nextPin !== newPin) {
        resetWithError();
        return;
      }
      setStatus('success');
      void (async () => {
        await setStoredPin(nextPin);
        setStoredPinState(nextPin);
        setTimeout(() => {
          router.back();
        }, 450);
      })();
    }
  };

  const addDigit = (d: string) => {
    if (status === 'success' || step === 'done') return;
    setTypingTick((t) => t + 1);
    setPin((prev) => {
      const next = (prev + d).slice(0, PIN_LEN);
      setStatus(next.length > 0 ? 'typing' : 'idle');
      tryComplete(next);
      return next;
    });
  };

  const backspace = () => {
    if (status === 'success' || step === 'done') return;
    setTypingTick((t) => t + 1);
    setPin((prev) => {
      const next = prev.slice(0, -1);
      setStatus(next.length > 0 ? 'typing' : 'idle');
      return next;
    });
  };

  const clearAll = () => {
    if (status === 'success' || step === 'done') return;
    setTypingTick((t) => t + 1);
    setPin('');
    setStatus('idle');
  };

  return (
    <SafeAreaView style={[{ flex: 1 }, bg]} edges={['top']}>
      <ScreenHeader title="Change PIN" showBack showSettingsButton={false} onBackPress={() => router.back()} />
      <View style={{ flex: 1, padding: spacing.lg, alignItems: 'center', justifyContent: 'center' }}>
        <PinScreenHeader bearState={bearState} logoSize={180} typingTick={typingTick} />

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

          <Text style={{ marginTop: spacing.md, ...typography.helper, fontSize: 13 }}>{prompt}</Text>
        </View>

        <View style={{ height: spacing.lg }} />

        <PinKeypad
          disabled={storedPin === null || status === 'success'}
          onDigit={addDigit}
          onBackspace={backspace}
          onClear={clearAll}
        />
      </View>
    </SafeAreaView>
  );
}


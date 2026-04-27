import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { colors, radius, spacing, typography } from '../utils/theme';
import { PinScreenHeader } from '../components/pin/PinScreenHeader';
import type { BearLogoState } from '../components/pin/AnimatedBearLogo';
import { isPinUnlockedThisSession, markPinUnlockedThisSession } from '../utils/pinGate';

const PIN_LEN = 4;

export default function PinScreen() {
  const unlocked = isPinUnlockedThisSession();

  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<'idle' | 'typing' | 'success'>('idle');
  const [typingTick, setTypingTick] = useState(0);

  const bearState: BearLogoState = useMemo(() => {
    if (status === 'success') return 'success';
    if (pin.length > 0) return 'typing';
    return 'default';
  }, [pin.length, status]);

  if (unlocked) {
    return <Redirect href="/(tabs)" />;
  }

  const tryComplete = (nextPin: string) => {
    if (nextPin.length === PIN_LEN) {
      // Placeholder success check: accept any 4 digits for now.
      setStatus('success');
      setTimeout(() => {
        markPinUnlockedThisSession();
        router.replace('/(tabs)' as any);
      }, 450);
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
            {status === 'success' ? 'Unlocked' : 'Enter your PIN'}
          </Text>
        </View>

        <View style={{ height: spacing.lg }} />

        {/* Keypad (always visible) */}
        <View style={{ width: 280, gap: 12 }}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['clear', '0', 'del'],
          ].map((row, rIdx) => (
            <View key={rIdx} style={{ flexDirection: 'row', gap: 12 }}>
              {row.map((key) => {
                const isAction = key === 'clear' || key === 'del';
                const label = key === 'clear' ? 'Clear' : key === 'del' ? '⌫' : key;
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityLabel={
                      key === 'del' ? 'Delete' : key === 'clear' ? 'Clear PIN' : `Digit ${key}`
                    }
                    onPress={() => {
                      if (key === 'del') backspace();
                      else if (key === 'clear') clearAll();
                      else addDigit(key);
                    }}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        height: 56,
                        borderRadius: radius.lg,
                        backgroundColor: colors.surface,
                        borderWidth: 1,
                        borderColor: colors.divider,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: status === 'success' ? 0.5 : 1,
                      },
                      pressed && status !== 'success' && { opacity: 0.9 },
                      isAction && { backgroundColor: 'rgba(17, 17, 17, 0.04)' },
                    ]}
                    disabled={status === 'success'}
                  >
                    <Text
                      style={{
                        fontSize: isAction ? 16 : 20,
                        fontWeight: isAction ? '800' : '900',
                        color: colors.text,
                      }}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}


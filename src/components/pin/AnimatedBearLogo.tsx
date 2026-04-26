import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Image, View } from 'react-native';

export type BearLogoState = 'default' | 'typing' | 'success';

type Props = {
  state?: BearLogoState;
  /** Width of the full logo. Height is derived from image aspect. */
  size?: number;
  /** Increment this on each keypress to reset the typing timer. */
  typingTick?: number;
};

const BearBase = require('../../../assets/images/3pt-logo-plain.png');
const BearEyes = require('../../../assets/images/3pt-logo-eyes.png');
const AnimatedImage = Animated.createAnimatedComponent(Image);

export function AnimatedBearLogo({ state = 'default', size = 44, typingTick = 0 }: Props) {
  const eyeOffset = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(0)).current; // 0 = open, 1 = closed
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIdleTimeout = () => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
  };

  const crop = useMemo(() => {
    const w = size;
    const sourceAspect = 2; // 1024x512
    const imgW = w;
    const imgH = Math.round(w / sourceAspect);
    return { boxW: imgW, boxH: imgH, imgW, imgH };
  }, [size]);

  useEffect(() => {
    if (state === 'success') {
      clearIdleTimeout();
      eyeOffset.stopAnimation();
      blink.stopAnimation();
      // Immediately return eyes to normal and stop further animation.
      Animated.timing(eyeOffset, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      blink.setValue(0);
      return;
    }

    if (state === 'default') {
      clearIdleTimeout();
      eyeOffset.stopAnimation();
      Animated.timing(eyeOffset, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }

    return () => {
      clearIdleTimeout();
    };
  }, [eyeOffset, state]);

  useEffect(() => {
    if (state !== 'typing') return;
    clearIdleTimeout();

    // Move once to "look away" (upper-left) if we're not already there.
    eyeOffset.stopAnimation();
    Animated.timing(eyeOffset, {
      toValue: 1,
      duration: 520,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Hold for 10 seconds since last typing, then return.
    idleTimeoutRef.current = setTimeout(() => {
      eyeOffset.stopAnimation();
      Animated.timing(eyeOffset, {
        toValue: 0,
        duration: 650,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start();
      idleTimeoutRef.current = null;
    }, 5000);
  }, [eyeOffset, state, typingTick]);

  const eyeTravelX = Math.max(3, Math.round(crop.boxW * 0.028));
  const eyeTravelY = Math.max(2, Math.round(crop.boxH * 0.06));
  const eyeTranslateX = eyeOffset.interpolate({ inputRange: [0, 1], outputRange: [0, -eyeTravelX] });
  const eyeTranslateY = eyeOffset.interpolate({ inputRange: [0, 1], outputRange: [0, -eyeTravelY] });

  const blinkScaleY = blink.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.15],
  });

  return (
    <View
      style={{
        width: crop.boxW,
        height: crop.boxH,
      }}
    >
      {/* Static base (never animates) */}
      <View
        style={{
          width: crop.boxW,
          height: crop.boxH,
        }}
      >
        <Image
          source={BearBase}
          resizeMode="contain"
          style={{ width: crop.imgW, height: crop.imgH }}
        />
        {/* Eyes layer (absolute + animated). Base stays perfectly still. */}
        <AnimatedImage
          source={BearEyes}
          resizeMode="contain"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: crop.imgW,
            height: crop.imgH,
            transform: [{ translateX: eyeTranslateX }, { translateY: eyeTranslateY }, { scaleY: blinkScaleY }],
          }}
        />
      </View>
    </View>
  );
}


import { View, Text } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import type { PhaseDefinition } from '../utils/phaseConfig';
import { totalCycleDays } from '../utils/phaseConfig';
import { buildRingArcSegments, dotPositionOnRing, svgArcPathD } from '../utils/ringGeometry';
import { colors } from '../utils/theme';
import { styles } from './CycleRing.styles';

type Props = {
  cycleDay: number;
  phases: PhaseDefinition[];
  size?: number;
  strokeWidth?: number;
  /** When true, no vertical margin so the ring centers inside a fixed outer disc. */
  omitOuterMargin?: boolean;
};

export function CycleRing({ cycleDay, phases, size = 232, strokeWidth = 18, omitOuterMargin }: Props) {
  const totalDays = totalCycleDays(phases);
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - strokeWidth) / 2 - 4;
  const clampedDay = Math.min(Math.max(cycleDay, 1), totalDays);
  const dot = dotPositionOnRing(cx, cy, radius, clampedDay, totalDays);
  const dotR = 6;
  const phaseColor = resolvePhaseColor(phases, clampedDay);
  const segments = buildRingArcSegments(phases);

  return (
    <View style={[styles.wrap, omitOuterMargin && styles.wrapFlush]}>
      <Svg width={size} height={size}>
        {segments.map((seg) => (
          <Path
            key={seg.phaseId}
            d={svgArcPathD(cx, cy, radius, seg.startAngleRad, seg.sweepAngleRad)}
            stroke={seg.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="butt"
            strokeLinejoin="miter"
          />
        ))}
        <Circle cx={dot.x} cy={dot.y} r={dotR + 2} fill={colors.surface} opacity={0.98} />
        <Circle cx={dot.x} cy={dot.y} r={dotR} fill={phaseColor} />
      </Svg>
      <View style={styles.overlayFill} pointerEvents="none">
        <View style={styles.centerInner}>
          <Text style={styles.dayNum}>Day {clampedDay}</Text>
          <Text style={styles.daySub}>of your cycle</Text>
        </View>
      </View>
    </View>
  );
}

function resolvePhaseColor(phases: PhaseDefinition[], cycleDay: number): string {
  let start = 1;
  for (const p of phases) {
    const end = start + p.days - 1;
    if (cycleDay >= start && cycleDay <= end) return p.color;
    start = end + 1;
  }
  return phases[phases.length - 1]?.color ?? colors.accentWarm;
}

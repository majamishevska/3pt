import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, componentStyles, radius, spacing, typography } from '../utils/theme';

type Props = {
  fileName: string | null;
  fileSizeBytes?: number | null;
  onPick: () => void;
};

function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '';
  const kb = 1024;
  const mb = kb * 1024;
  if (n >= mb) return `${(n / mb).toFixed(1)} MB`;
  if (n >= kb) return `${Math.round(n / kb)} KB`;
  return `${n} B`;
}

export function FilePickerCard({ fileName, fileSizeBytes, onPick }: Props) {
  const hasFile = !!fileName;
  return (
    <View style={{ gap: 8 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={hasFile ? 'Pick a different file' : 'Pick a file'}
        onPress={onPick}
        style={({ pressed }) => [
          {
            ...componentStyles.buttonSecondary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: spacing.sm,
            borderRadius: radius.md,
          },
          pressed && { opacity: 0.9 },
        ]}
      >
        <Ionicons name="document-text-outline" size={18} color={colors.text} />
        <Text style={{ ...typography.smallLabel, fontSize: 15, fontWeight: '800', color: colors.text }}>
          {hasFile ? 'Change file' : 'Choose file'}
        </Text>
      </Pressable>

      {hasFile ? (
        <Text style={{ ...typography.helper, fontSize: 13, lineHeight: 18 }}>
          {fileName}
          {typeof fileSizeBytes === 'number' ? ` · ${formatBytes(fileSizeBytes)}` : ''}
        </Text>
      ) : (
        <Text style={{ ...typography.helper, fontSize: 13, lineHeight: 18, opacity: 0.75 }}>No file selected</Text>
      )}
    </View>
  );
}


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
    <View
      style={{
        ...componentStyles.card,
      }}
    >
      <Text style={{ ...typography.sectionTitle, fontSize: 15, fontWeight: '800' }}>Import file</Text>
      <Text style={{ marginTop: 6, ...typography.helper, fontSize: 14, lineHeight: 20 }}>
        Pick an export file from Flo, Clue, or Apple Health.
      </Text>

      <View style={{ marginTop: spacing.md, gap: 4 }}>
        <Text style={{ ...typography.helper, fontSize: 13 }}>{hasFile ? 'Selected' : 'No file selected'}</Text>
        {hasFile ? (
          <Text style={{ ...typography.smallLabel, fontSize: 14, fontWeight: '700' }}>
            {fileName}
            {typeof fileSizeBytes === 'number' ? ` · ${formatBytes(fileSizeBytes)}` : ''}
          </Text>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={hasFile ? 'Pick a different file' : 'Pick a file'}
        onPress={onPick}
        style={({ pressed }) => [
          {
            marginTop: spacing.md,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: radius.md,
            backgroundColor: colors.text,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          },
          pressed && { opacity: 0.9 },
        ]}
      >
        <Ionicons name="document-text-outline" size={18} color={colors.surface} />
        <Text style={{ ...typography.smallLabel, color: colors.surface, fontWeight: '800', fontSize: 15 }}>
          {hasFile ? 'Choose another file' : 'Choose file'}
        </Text>
      </Pressable>
    </View>
  );
}


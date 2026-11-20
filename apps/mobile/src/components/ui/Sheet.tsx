import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@erui/core';
import { IconButton } from './Button';
import { Text } from './Typography';

/** Bottom sheet primitive used by pickers, menus and drawers on mobile. */
export function Sheet({
  visible,
  onClose,
  title,
  children,
  footer,
  heightRatio = 0.6,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  heightRatio?: number;
}) {
  const { colors, radii } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
        <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose} accessibilityLabel="Close" />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderTopLeftRadius: radii.xl,
              borderTopRightRadius: radii.xl,
              maxHeight: `${Math.round(heightRatio * 100)}%`,
              paddingBottom: insets.bottom + 12,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
          {title && (
            <View style={styles.header}>
              <Text variant="heading">{title}</Text>
              <IconButton icon="x" label="Close" size="sm" onPress={onClose} />
            </View>
          )}
          {children}
          {footer && <View style={[styles.footer, { borderTopColor: colors.border }]}>{footer}</View>}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: { paddingTop: 8 },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
});

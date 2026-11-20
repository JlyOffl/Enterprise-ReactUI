import { useEffect, useRef, type ComponentType, type ReactNode } from 'react';
import { Animated, Dimensions, KeyboardAvoidingView, Modal, PanResponder, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  ComponentRegistry,
  CORE_MODALS,
  useModal,
  useModalEntries,
  useTheme,
  useToastQueue,
  type ConfirmOptions,
  type ModalContentProps,
  type ModalEntry,
} from '@erui/core';
import { Button, IconButton } from './Button';
import { Icon, type IconKey } from './Icon';
import { Text } from './Typography';
import { toneColors } from './Feedback';
import { shadow } from '../../theme/styles';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModalContentComponent = ComponentType<ModalContentProps<any, any>>;

/* ------------------------------------------------------ layout helpers */
export function ModalBody({ children }: { children: ReactNode }) {
  return <View style={styles.body}>{children}</View>;
}

export function ModalFooter({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <View style={[styles.footer, { borderTopColor: colors.border }]}>{children}</View>;
}

/* ------------------------------------------------------ built-in contents */
function ConfirmContent({ entry, close }: ModalContentProps<ConfirmOptions, boolean>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const p = entry.props;
  const tone = p.tone === 'danger' ? 'danger' : 'info';
  return (
    <>
      <ModalBody>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={[styles.confirmIcon, { backgroundColor: toneColors(theme, tone).bg }]}>
            <Icon name={p.tone === 'danger' ? 'warning' : 'info'} size={22} color={toneColors(theme, tone).fg} />
          </View>
          <Text tone="muted" style={{ flex: 1 }}>{p.message ? t(p.message) : ''}</Text>
        </View>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onPress={() => close(false)}>{p.cancelLabel ?? t('common.cancel')}</Button>
        <Button variant={p.tone === 'danger' ? 'danger' : 'primary'} onPress={() => close(true)}>{p.confirmLabel ?? t('common.confirm')}</Button>
      </ModalFooter>
    </>
  );
}

function AlertContent({ entry, close }: ModalContentProps<{ message?: string }>) {
  const { t } = useTranslation();
  return (
    <>
      <ModalBody>
        <Text tone="muted">{entry.props.message ? t(entry.props.message) : ''}</Text>
      </ModalBody>
      <ModalFooter>
        <Button onPress={() => close()}>OK</Button>
      </ModalFooter>
    </>
  );
}

export function createModalRegistry() {
  return new ComponentRegistry<ModalContentComponent>('native-modals').registerMany({
    [CORE_MODALS.confirm]: ConfirmContent as ModalContentComponent,
    [CORE_MODALS.alert]: AlertContent as ModalContentComponent,
  });
}

/* --------------------------------------------- blocking (dialog / drawer) */
function BlockingModal({ entry, registry }: { entry: ModalEntry; registry: ComponentRegistry<ModalContentComponent> }) {
  const modal = useModal();
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const Content = registry.resolve(entry.contentKey);
  const close = (result?: unknown) => modal.close(entry.id, result);
  // On phones drawers become bottom sheets (the idiomatic mobile equivalent).
  const isSheet = entry.kind === 'drawer';
  const { height } = Dimensions.get('window');

  return (
    <Modal visible transparent animationType={isSheet ? 'slide' : 'fade'} onRequestClose={() => entry.dismissible && close()} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.overlay, isSheet && styles.overlaySheet]}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.overlay }]} onPress={() => entry.dismissible && close()} />
        <View
          accessibilityViewIsModal
          style={[
            isSheet ? styles.sheet : styles.dialog,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radii.xl,
              maxHeight: isSheet ? height * (entry.size === 'lg' || entry.size === 'xl' ? 0.92 : 0.75) : height * 0.85,
              paddingBottom: isSheet ? insets.bottom : 0,
            },
            isSheet && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
            shadow(theme, 'lg'),
          ]}
        >
          {entry.title && (
            <View style={styles.header}>
              <Text variant="heading" style={{ flex: 1 }}>{t(entry.title)}</Text>
              {entry.dismissible && entry.contentKey !== CORE_MODALS.confirm && <IconButton icon="x" label={t('common.close')} size="sm" onPress={() => close()} />}
            </View>
          )}
          <Content entry={entry} close={close} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* -------------------------------------------------------- modeless panel */
function ModelessPanel({ entry, registry, index }: { entry: ModalEntry; registry: ComponentRegistry<ModalContentComponent>; index: number }) {
  const modal = useModal();
  const theme = useTheme();
  const { t } = useTranslation();
  const Content = registry.resolve(entry.contentKey);
  const { width } = Dimensions.get('window');
  const start = entry.position ?? { x: 16 + index * 16, y: 140 + index * 24 };
  const pan = useRef(new Animated.ValueXY(start)).current;
  const last = useRef(start);
  useEffect(() => {
    const id = pan.addListener((v) => (last.current = v));
    return () => pan.removeListener(id);
  }, [pan]);
  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) + Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        pan.extractOffset();
        modal.focus(entry.id);
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        modal.move(entry.id, last.current.x, last.current.y);
      },
    }),
  ).current;

  return (
    <Animated.View
      style={[
        styles.modeless,
        { width: Math.min(320, width - 32), zIndex: 900 + entry.zIndex, transform: pan.getTranslateTransform(), backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radii.lg },
        shadow(theme, 'lg'),
      ]}
    >
      <View {...responder.panHandlers} style={[styles.modelessHeader, { backgroundColor: theme.colors.surfaceAlt, borderTopLeftRadius: theme.radii.lg, borderTopRightRadius: theme.radii.lg }]}>
        <Icon name="grip" size={16} color={theme.colors.textMuted} />
        <Text variant="label" style={{ flex: 1 }} numberOfLines={1}>{entry.title ? t(entry.title) : ''}</Text>
        <IconButton icon={entry.minimized ? 'maximize' : 'minimize'} label="Minimize" size="xs" onPress={() => modal.toggleMinimize(entry.id)} />
        <IconButton icon="x" label={t('common.close')} size="xs" onPress={() => modal.close(entry.id)} />
      </View>
      {!entry.minimized && <Content entry={entry} close={(r) => modal.close(entry.id, r)} />}
    </Animated.View>
  );
}

/** Modal and Modeless - Mobile host. Renders the shared modal stack. */
export function ModalHost({ registry }: { registry: ComponentRegistry<ModalContentComponent> }) {
  const { blocking, modeless } = useModalEntries();
  return (
    <>
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        {modeless.map((e, i) => (
          <ModelessPanel key={e.id} entry={e} registry={registry} index={i} />
        ))}
      </View>
      {/* RN presents nested Modals in order, so the stack is preserved. */}
      {blocking.map((e) => (
        <BlockingModal key={e.id} entry={e} registry={registry} />
      ))}
    </>
  );
}

/* --------------------------------------------------------------- toasts */
const toastIcon: Record<string, IconKey> = { success: 'success', error: 'error', warning: 'warning', info: 'info' };

function ToastItemView({ title, message, variant, onDismiss }: { title: string; message?: string; variant: string; onDismiss: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true }).start();
  }, [anim]);
  const tone = variant === 'error' ? 'danger' : (variant as 'success' | 'warning' | 'info');
  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border, borderRadius: theme.radii.md, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] },
        shadow(theme, 'md'),
      ]}
    >
      <Icon name={toastIcon[variant] ?? 'info'} size={20} color={toneColors(theme, tone).fg} />
      <View style={{ flex: 1 }}>
        <Text weight="600">{t(title)}</Text>
        {message && <Text variant="caption" tone="muted">{t(message)}</Text>}
      </View>
      <Pressable onPress={onDismiss} hitSlop={8}>
        <Icon name="x" size={16} color={theme.colors.textMuted} />
      </Pressable>
    </Animated.View>
  );
}

export function ToastHost() {
  const { items, dismiss } = useToastQueue();
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.toasts, { top: insets.top + 8 }]}>
      {items.map((toast) => (
        <ToastItemView key={toast.id} title={toast.title} message={toast.message} variant={toast.variant} onDismiss={() => dismiss(toast.id)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  overlaySheet: { justifyContent: 'flex-end', padding: 0 },
  dialog: { width: '100%', maxWidth: 520, overflow: 'hidden' },
  sheet: { width: '100%', overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 18 },
  body: { padding: 20, gap: 14 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth },
  confirmIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  modeless: { position: 'absolute', left: 0, top: 0, borderWidth: 1 },
  modelessHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 12, paddingRight: 4, paddingVertical: 4 },
  toasts: { position: 'absolute', left: 12, right: 12, gap: 8, zIndex: 2000 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderWidth: 1 },
});

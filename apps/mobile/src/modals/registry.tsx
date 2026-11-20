import { useState } from 'react';
import { View } from 'react-native';
import {
  formatDateTime,
  useExternalSystemService,
  useLocale,
  useModal,
  usersApi,
  type DirectoryUser,
  type ModalContentProps,
  type Order,
} from '@erui/core';
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  DescriptionList,
  ModalBody,
  ModalFooter,
  Select,
  Slider,
  Text,
  TextArea,
  TextField,
  createModalRegistry,
  type ModalContentComponent,
} from '../components/ui';
import { OrderForm } from '../features/orders/OrderForm';

function QuickNote({ close }: ModalContentProps<Record<string, never>, { title: string; body: string }>) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  return (
    <>
      <ModalBody>
        <TextField label="Title" value={title} onChangeText={setTitle} required />
        <TextArea label="Note" value={body} onChangeText={setBody} />
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onPress={() => close()}>Cancel</Button>
        <Button disabled={!title} onPress={() => close({ title, body })}>Save note</Button>
      </ModalFooter>
    </>
  );
}

function Filters({ close }: ModalContentProps<Record<string, never>, { region: string; minScore: number; activeOnly: boolean }>) {
  const [region, setRegion] = useState('na');
  const [minScore, setMinScore] = useState(40);
  const [activeOnly, setActiveOnly] = useState(true);
  return (
    <>
      <ModalBody>
        <Select
          label="Region"
          value={region}
          onChange={setRegion}
          options={[
            { value: 'na', label: 'North America' },
            { value: 'emea', label: 'EMEA' },
            { value: 'apac', label: 'APAC' },
          ]}
        />
        <Slider label="Minimum score" value={minScore} onChange={setMinScore} />
        <Checkbox label="Active customers only" checked={activeOnly} onChange={setActiveOnly} />
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onPress={() => close()}>Reset</Button>
        <Button onPress={() => close({ region, minScore, activeOnly })}>Apply</Button>
      </ModalFooter>
    </>
  );
}

function Inspector({ entry }: ModalContentProps<{ n: number; openedAt: string }>) {
  const [count, setCount] = useState(0);
  return (
    <View style={{ padding: 12, gap: 8 }}>
      <Text variant="caption" tone="muted">Non-blocking: drag the header, minimize, or keep using the screen.</Text>
      <DescriptionList
        items={[
          { label: 'Window', value: `#${entry.props.n}` },
          { label: 'Opened', value: formatDateTime(entry.props.openedAt) },
        ]}
      />
      <Button size="sm" variant="secondary" onPress={() => setCount((c) => c + 1)}>{`Tapped ${count} times`}</Button>
    </View>
  );
}

function Nested({ close }: ModalContentProps) {
  const modal = useModal();
  const [answer, setAnswer] = useState('—');
  return (
    <>
      <ModalBody>
        <Text>This dialog can open another dialog on top of it.</Text>
        <Text tone="muted">Nested result: {answer}</Text>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onPress={async () => setAnswer((await modal.confirm({ title: 'Nested confirm', message: 'Stacked above the parent.' })) ? 'confirmed' : 'cancelled')}>
          Open nested
        </Button>
        <Button onPress={() => close()}>Done</Button>
      </ModalFooter>
    </>
  );
}

function UserDetails({ entry }: ModalContentProps<{ user: DirectoryUser }>) {
  const { t, format } = useLocale();
  const ext = useExternalSystemService();
  const live = usersApi.useGetUserQuery(entry.props.user.id);
  const u = live.data ?? entry.props.user;
  return (
    <ModalBody>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Avatar name={u.name} size={52} status={u.status === 'active' ? 'online' : 'offline'} />
        <View style={{ gap: 4, flex: 1 }}>
          <Text variant="heading">{u.name}</Text>
          <Text tone="muted">{u.title}</Text>
          <Badge tone={u.status === 'active' ? 'success' : u.status === 'invited' ? 'warning' : 'danger'} dot>{u.status}</Badge>
        </View>
      </View>
      <DescriptionList
        items={[
          { label: t('users.email'), value: u.email },
          { label: t('users.department'), value: u.department },
          { label: t('users.role'), value: u.role },
          { label: t('users.location'), value: u.location },
          { label: t('users.lastActive'), value: format.relative(u.lastActiveAt) },
          ...ext.list().map((s) => ({ label: s.name, value: u.externalIds[s.id] ?? '—' })),
        ]}
      />
    </ModalBody>
  );
}

function CreateOrder({ close }: ModalContentProps<Record<string, never>, Order>) {
  return <OrderForm onDone={(order) => close(order)} />;
}

export const modalRegistry = createModalRegistry().registerMany({
  'demo.quickNote': QuickNote as ModalContentComponent,
  'demo.filters': Filters as ModalContentComponent,
  'demo.inspector': Inspector as ModalContentComponent,
  'demo.nested': Nested as ModalContentComponent,
  'users.details': UserDetails as ModalContentComponent,
  'orders.create': CreateOrder as ModalContentComponent,
});

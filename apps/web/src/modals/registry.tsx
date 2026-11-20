import { useState } from 'react';
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
  Select,
  Slider,
  TextArea,
  TextField,
  createModalRegistry,
  type ModalContentComponent,
} from '../components/ui';
import { OrderForm } from '../features/orders/OrderForm';

/* Form inside a modal; resolves with the note */
function QuickNote({ close }: ModalContentProps<Record<string, never>, { title: string; body: string }>) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  return (
    <>
      <div className="modal__body stack gap-md">
        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <TextArea label="Note" rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      <div className="modal__footer">
        <Button variant="secondary" onClick={() => close()}>
          Cancel
        </Button>
        <Button disabled={!title} onClick={() => close({ title, body })}>
          Save note
        </Button>
      </div>
    </>
  );
}

/* Drawer with filters */
function Filters({ close }: ModalContentProps<Record<string, never>, { region: string; minScore: number; activeOnly: boolean }>) {
  const [region, setRegion] = useState('na');
  const [minScore, setMinScore] = useState(40);
  const [activeOnly, setActiveOnly] = useState(true);
  return (
    <>
      <div className="modal__body stack gap-lg">
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
      </div>
      <div className="modal__footer">
        <Button variant="ghost" onClick={() => close()}>
          Reset
        </Button>
        <Button onClick={() => close({ region, minScore, activeOnly })}>Apply filters</Button>
      </div>
    </>
  );
}

/* Modeless inspector (non-blocking) */
function Inspector({ entry }: ModalContentProps<{ n: number; openedAt: string }>) {
  const [count, setCount] = useState(0);
  return (
    <div className="modal__body stack gap-sm">
      <p className="text-muted text-sm">
        Modeless windows do not block the page. Drag the header, minimize, or open several at once.
      </p>
      <DescriptionList
        columns={1}
        items={[
          { label: 'Window', value: `#${entry.props.n}` },
          { label: 'Opened', value: formatDateTime(entry.props.openedAt) },
          { label: 'z-index', value: entry.zIndex },
        ]}
      />
      <Button size="sm" variant="secondary" onClick={() => setCount((c) => c + 1)}>
        Clicked {count} times
      </Button>
    </div>
  );
}

/* Modal that opens another modal */
function Nested({ close }: ModalContentProps) {
  const modal = useModal();
  const [answer, setAnswer] = useState<string>('—');
  return (
    <>
      <div className="modal__body stack gap-md">
        <p>This dialog can open another dialog on top of it. Escape closes only the top-most one.</p>
        <p className="text-muted">Nested result: {answer}</p>
      </div>
      <div className="modal__footer">
        <Button
          variant="secondary"
          onClick={async () => setAnswer((await modal.confirm({ title: 'Nested confirm', message: 'Stacked above the parent.' })) ? 'confirmed' : 'cancelled')}
        >
          Open nested
        </Button>
        <Button onClick={() => close()}>Done</Button>
      </div>
    </>
  );
}

/* User details drawer */
function UserDetails({ entry }: ModalContentProps<{ user: DirectoryUser }>) {
  const { user } = entry.props;
  const { t, format } = useLocale();
  const ext = useExternalSystemService();
  const live = usersApi.useGetUserQuery(user.id);
  const u = live.data ?? user;
  return (
    <div className="modal__body stack gap-lg">
      <div className="row gap-md">
        <Avatar name={u.name} size={56} status={u.status === 'active' ? 'online' : 'offline'} />
        <div className="stack gap-xxs">
          <strong className="text-lg">{u.name}</strong>
          <span className="text-muted">{u.title}</span>
          <span>
            <Badge tone={u.status === 'active' ? 'success' : u.status === 'invited' ? 'warning' : 'danger'} dot>
              {u.status}
            </Badge>
          </span>
        </div>
      </div>
      <DescriptionList
        items={[
          { label: t('users.email'), value: u.email },
          { label: t('users.department'), value: u.department },
          { label: t('users.role'), value: u.role },
          { label: t('users.location'), value: u.location },
          { label: t('users.lastActive'), value: format.relative(u.lastActiveAt) },
          { label: t('orders.created'), value: format.date(u.createdAt) },
        ]}
      />
      <div className="stack gap-sm">
        <strong>{t('externalSystems.linkedIds')}</strong>
        {ext.list().map((s) => (
          <div key={s.id} className="row justify-between ext-row">
            <span className="row gap-sm">
              <span className="ext-swatch" style={{ background: s.color }} />
              {s.name}
            </span>
            <code>{u.externalIds[s.id] ?? '—'}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreateOrder({ close }: ModalContentProps<Record<string, never>, Order>) {
  return <OrderForm onDone={(order) => close(order)} />;
}

/** Modal content registry (component factory for overlays). */
export const modalRegistry = createModalRegistry().registerMany({
  'demo.quickNote': QuickNote as ModalContentComponent,
  'demo.filters': Filters as ModalContentComponent,
  'demo.inspector': Inspector as ModalContentComponent,
  'demo.nested': Nested as ModalContentComponent,
  'users.details': UserDetails as ModalContentComponent,
  'orders.create': CreateOrder as ModalContentComponent,
});

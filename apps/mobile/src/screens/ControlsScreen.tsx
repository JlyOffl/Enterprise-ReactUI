import { useState, type JSX } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COUNTRIES, SAMPLE_OPTIONS, SAMPLE_TIMELINE, SAMPLE_TREE, SKILLS, usePagination, useStepper, useToast } from '@erui/core';
import {
  Accordion,
  ActionMenu,
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  Chip,
  Combobox,
  DatePicker,
  DescriptionList,
  Divider,
  EmptyState,
  FileUpload,
  IconButton,
  MultiSelect,
  NumberStepper,
  Pagination,
  ProgressBar,
  RadioGroup,
  Rating,
  SegmentedControl,
  Select,
  Skeleton,
  Slider,
  Spinner,
  StatCard,
  Stepper,
  Switch,
  Tabs,
  Text,
  TextArea,
  TextField,
  Timeline,
  Tooltip,
  TreeView,
} from '../components/ui';
import { Row, Screen, SectionTitle } from '../components/Screen';

type Category = 'buttons' | 'inputs' | 'selection' | 'pickers' | 'feedback' | 'dataDisplay' | 'navigation';

function ButtonsDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <>
      <SectionTitle>Variants</SectionTitle>
      <Row wrap>
        {(['primary', 'secondary', 'outline', 'ghost', 'success', 'danger', 'link'] as const).map((v) => (
          <Button key={v} variant={v}>{v}</Button>
        ))}
      </Row>
      <SectionTitle>Sizes & states</SectionTitle>
      <Row wrap>
        <Button size="xs">XS</Button>
        <Button size="sm" leftIcon="plus">Small</Button>
        <Button rightIcon="chevronRight">Medium</Button>
        <Button size="lg" leftIcon="send">Large</Button>
        <Button disabled>Disabled</Button>
        <Button loading={loading} onPress={() => (setLoading(true), setTimeout(() => setLoading(false), 1500))}>Load</Button>
      </Row>
      <Button fullWidth leftIcon="check">Full width</Button>
      <SectionTitle>Icon buttons & action menu</SectionTitle>
      <Row>
        <IconButton icon="edit" label="Edit" variant="secondary" />
        <IconButton icon="trash" label="Delete" variant="danger" />
        <IconButton icon="bell" label="Notifications" badge={7} />
        <ActionMenu
          title="Actions"
          trigger={(open) => <Button variant="outline" rightIcon="chevronDown" onPress={open}>Actions</Button>}
          items={[
            { id: 'edit', label: 'Edit', icon: 'edit' },
            { id: 'copy', label: 'Duplicate', icon: 'copy' },
            { id: 'delete', label: 'Delete', icon: 'trash', danger: true },
          ]}
        />
      </Row>
    </>
  );
}

function InputsDemo() {
  const [qty, setQty] = useState(3);
  const [bio, setBio] = useState('');
  return (
    <>
      <TextField label="Full name" placeholder="Jane Cooper" helperText="As it appears on your ID" />
      <TextField label="Search" leftIcon="search" placeholder="Search anything…" />
      <TextField label="Email" leftIcon="globe" defaultValue="not-an-email" error="Enter a valid email address" />
      <TextField label="Disabled" editable={false} defaultValue="Read only value" />
      <TextField label="Password" secureTextEntry defaultValue="secret" />
      <TextArea label="Bio" maxLength={160} showCount value={bio} onChangeText={setBio} placeholder="Tell us about yourself" />
      <NumberStepper label="Quantity" value={qty} onChange={setQty} min={1} max={10} />
    </>
  );
}

function SelectionDemo() {
  const [checks, setChecks] = useState({ a: true, b: false, c: true });
  const all = Object.values(checks).every(Boolean);
  const some = Object.values(checks).some(Boolean);
  const [plan, setPlan] = useState('pro');
  const [notify, setNotify] = useState(true);
  const [chips, setChips] = useState<string[]>(['React']);
  const [view, setView] = useState<'list' | 'grid' | 'board'>('grid');
  return (
    <>
      <Card title="Checkbox">
        <View style={{ gap: 6 }}>
          <Checkbox label="Select all" checked={all} indeterminate={some && !all} onChange={(v) => setChecks({ a: v, b: v, c: v })} />
          {(['a', 'b', 'c'] as const).map((k) => (
            <View key={k} style={{ paddingLeft: 24 }}>
              <Checkbox label={`Option ${k.toUpperCase()}`} description="Helper text" checked={checks[k]} onChange={(v) => setChecks((c) => ({ ...c, [k]: v }))} />
            </View>
          ))}
        </View>
      </Card>
      <RadioGroup
        label="Plan"
        variant="card"
        value={plan}
        onChange={setPlan}
        options={[
          { value: 'basic', label: 'Basic', description: 'Up to 5 users' },
          { value: 'pro', label: 'Professional', description: 'Up to 50 users' },
          { value: 'enterprise', label: 'Enterprise', description: 'SSO, audit, SLA' },
        ]}
      />
      <Switch label="Email notifications" description="Daily digest" checked={notify} onChange={setNotify} />
      <Switch label="Disabled" checked disabled onChange={() => undefined} />
      <SectionTitle>Chips</SectionTitle>
      <Row wrap>
        {SKILLS.map((s) => (
          <Chip key={s} label={s} selected={chips.includes(s)} onPress={() => setChips((c) => (c.includes(s) ? c.filter((x) => x !== s) : [...c, s]))} />
        ))}
      </Row>
      <SegmentedControl value={view} onChange={setView} options={[{ value: 'list', label: 'List', icon: 'menu' }, { value: 'grid', label: 'Grid', icon: 'grid' }, { value: 'board', label: 'Board', icon: 'layers' }]} />
    </>
  );
}

function PickersDemo() {
  const [country, setCountry] = useState('');
  const [tech, setTech] = useState('redux');
  const [tags, setTags] = useState<string[]>(['react', 'zod']);
  const [date, setDate] = useState('');
  const [volume, setVolume] = useState(40);
  const [rating, setRating] = useState(4);
  return (
    <>
      <Select label="Country" placeholder="Choose a country" options={COUNTRIES} value={country} onChange={setCountry} />
      <Combobox label="Technology (autocomplete)" options={SAMPLE_OPTIONS} value={tech} onChange={setTech} />
      <MultiSelect label="Tags" options={SAMPLE_OPTIONS} value={tags} onChange={setTags} allowCustom />
      <DatePicker label="Due date" value={date} onChange={setDate} />
      <Slider label="Volume" value={volume} onChange={setVolume} formatValue={(v) => `${v}%`} />
      <Rating label="Rating" value={rating} onChange={setRating} />
      <FileUpload label="Attachments" maxSizeBytes={2 * 1024 * 1024} maxFiles={4} />
    </>
  );
}

function FeedbackDemo() {
  const toast = useToast();
  return (
    <>
      <Alert tone="info" title="Heads up">A new version is available.</Alert>
      <Alert tone="success" title="Saved">Your changes were saved.</Alert>
      <Alert tone="warning" title="Storage almost full" onClose={() => undefined}>You have used 92% of your quota.</Alert>
      <Alert tone="danger" title="Payment failed" action={<Button size="xs" variant="danger">Retry</Button>}>Card declined.</Alert>
      <SectionTitle>Toasts</SectionTitle>
      <Row wrap>
        <Button size="sm" variant="secondary" onPress={() => toast.success('Saved', 'Profile updated')}>Success</Button>
        <Button size="sm" variant="secondary" onPress={() => toast.info('FYI', 'Sync scheduled')}>Info</Button>
        <Button size="sm" variant="secondary" onPress={() => toast.warning('Careful', 'Unsaved changes')}>Warning</Button>
        <Button size="sm" variant="secondary" onPress={() => toast.error('Error', 'Request failed')}>Error</Button>
      </Row>
      <SectionTitle>Badges & tooltip</SectionTitle>
      <Row wrap>
        {(['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const).map((tone) => (
          <Badge key={tone} tone={tone} dot>{tone}</Badge>
        ))}
        <Badge tone="primary" variant="solid">Solid</Badge>
        <Badge tone="success" variant="outline" icon="check">Outline</Badge>
      </Row>
      <Tooltip content="Long-press reveals tooltips on touch devices">
        <Badge icon="info">Long-press me</Badge>
      </Tooltip>
      <SectionTitle>Progress & loading</SectionTitle>
      <ProgressBar value={72} label="Upload" showValue />
      <ProgressBar value={35} tone="warning" height={4} />
      <ProgressBar indeterminate label="Indeterminate" />
      <Row>
        <Spinner />
        <Spinner size="large" />
      </Row>
      <Skeleton lines={3} />
    </>
  );
}

function DataDisplayDemo() {
  return (
    <>
      <Row>
        <View style={{ flex: 1 }}><StatCard label="MRR" value="$128k" change="+8.2%" trend="up" icon="activity" /></View>
        <View style={{ flex: 1 }}><StatCard label="Churn" value="2.4%" change="-0.6%" trend="down" icon="users" /></View>
      </Row>
      <Card title="Avatars">
        <Row>
          <Avatar name="Maya Chen" status="online" />
          <Avatar name="Diego Martinez" status="away" />
          <AvatarGroup names={['Ava Patel', 'Liam Kim', 'Noah Rossi', 'Emma Silva', 'Omar Haddad']} />
        </Row>
      </Card>
      <Card title="Timeline"><Timeline items={SAMPLE_TIMELINE} /></Card>
      <Card title="Tree view"><TreeView nodes={SAMPLE_TREE} defaultExpanded={['org', 'eng']} /></Card>
      <Card title="Description list">
        <DescriptionList items={[{ label: 'Account', value: 'Contoso Health' }, { label: 'Plan', value: <Badge tone="primary">Enterprise</Badge> }, { label: 'Renewal', value: 'Mar 1, 2027' }]} />
        <Divider label="or" />
        <EmptyState icon="folder" title="No documents" description="Upload a file to get started." />
      </Card>
    </>
  );
}

function NavigationDemo() {
  const [tab, setTab] = useState('overview');
  const [pill, setPill] = useState('week');
  const pagination = usePagination({ total: 120, pageSize: 10 });
  const stepper = useStepper({ steps: [{ id: 'account' }, { id: 'profile' }, { id: 'billing' }, { id: 'review' }] });
  return (
    <>
      <Tabs value={tab} onChange={setTab} items={[{ id: 'overview', label: 'Overview', icon: 'home' }, { id: 'activity', label: 'Activity', badge: 12 }, { id: 'settings', label: 'Settings' }, { id: 'disabled', label: 'Disabled', disabled: true }]} />
      <Tabs variant="pill" value={pill} onChange={setPill} items={[{ id: 'day', label: 'Day' }, { id: 'week', label: 'Week' }, { id: 'month', label: 'Month' }]} />
      <Breadcrumbs items={[{ label: 'Home' }, { label: 'Customers' }, { label: 'Contoso' }]} />
      <Pagination model={pagination} />
      <Card title="Stepper">
        <View style={{ gap: 12 }}>
          <Stepper steps={[{ id: 'account', label: 'Account' }, { id: 'profile', label: 'Profile' }, { id: 'billing', label: 'Billing' }, { id: 'review', label: 'Review' }]} statusOf={stepper.statusOf} onStepPress={stepper.goTo} />
          <Row>
            <Button variant="secondary" disabled={stepper.isFirst} onPress={stepper.back}>Back</Button>
            <Button onPress={stepper.isLast ? stepper.reset : stepper.next}>{stepper.isLast ? 'Restart' : 'Next'}</Button>
          </Row>
        </View>
      </Card>
      <Accordion
        defaultExpanded={['a']}
        items={[
          { id: 'a', title: 'What is shared?', icon: 'layers', content: 'Business logic, state, API, validation, i18n, theme tokens and headless control logic.' },
          { id: 'b', title: 'What is platform specific?', icon: 'grid', content: 'Rendering and small platform adapters (storage, lifecycle, Dynatrace).' },
        ]}
      />
    </>
  );
}

const DEMOS: Record<Category, () => JSX.Element> = {
  buttons: ButtonsDemo,
  inputs: InputsDemo,
  selection: SelectionDemo,
  pickers: PickersDemo,
  feedback: FeedbackDemo,
  dataDisplay: DataDisplayDemo,
  navigation: NavigationDemo,
};

export default function ControlsScreen() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<Category>('buttons');
  const Demo = DEMOS[category];
  return (
    <Screen title={t('controls.title')} subtitle={t('controls.subtitle')}>
      <Tabs variant="pill" value={category} onChange={(v) => setCategory(v as Category)} items={(Object.keys(DEMOS) as Category[]).map((c) => ({ id: c, label: t(`controls.${c}`) }))} />
      <Text variant="caption" tone="muted">Rendering: React Native · Logic: @erui/core headless hooks</Text>
      <Demo />
    </Screen>
  );
}

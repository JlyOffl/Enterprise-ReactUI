import { useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import {
  COUNTRIES,
  SAMPLE_OPTIONS,
  SAMPLE_TIMELINE,
  SAMPLE_TREE,
  SKILLS,
  usePagination,
  useStepper,
  useToast,
} from '@erui/core';
import {
  Accordion,
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Chip,
  Combobox,
  DatePicker,
  DescriptionList,
  Divider,
  DropdownMenu,
  EmptyState,
  FileUpload,
  IconButton,
  Kbd,
  MultiSelect,
  NumberStepper,
  Pagination,
  ProgressBar,
  ProgressRing,
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
  TextArea,
  TextField,
  Timeline,
  Tooltip,
  TreeView,
} from '../components/ui';
import { PageHeader, Section } from '../layout/PageHeader';

type Category = 'buttons' | 'inputs' | 'selection' | 'pickers' | 'feedback' | 'dataDisplay' | 'navigation';

function ButtonsDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <div className="stack gap-lg">
      <Section title="Variants">
        <div className="row wrap gap-sm">
          {(['primary', 'secondary', 'outline', 'ghost', 'success', 'danger', 'link'] as const).map((v) => (
            <Button key={v} variant={v}>
              {v[0]!.toUpperCase() + v.slice(1)}
            </Button>
          ))}
        </div>
      </Section>
      <Section title="Sizes, icons & states">
        <div className="row wrap gap-sm align-center">
          <Button size="xs">Extra small</Button>
          <Button size="sm" leftIcon="plus">Small</Button>
          <Button size="md" rightIcon="chevronRight">Medium</Button>
          <Button size="lg" leftIcon="send">Large</Button>
          <Button disabled>Disabled</Button>
          <Button loading={loading} onClick={() => (setLoading(true), setTimeout(() => setLoading(false), 1500))}>
            Click to load
          </Button>
        </div>
      </Section>
      <Section title="Icon buttons & groups">
        <div className="row wrap gap-md align-center">
          <IconButton icon="edit" label="Edit" variant="secondary" />
          <IconButton icon="trash" label="Delete" variant="danger" />
          <IconButton icon="bell" label="Notifications" badge={7} />
          <IconButton icon="settings" label="Settings" variant="outline" />
          <ButtonGroup attached>
            <Button variant="secondary" leftIcon="chevronLeft">Prev</Button>
            <Button variant="secondary">Today</Button>
            <Button variant="secondary" rightIcon="chevronRight">Next</Button>
          </ButtonGroup>
          <DropdownMenu
            trigger={({ toggle }) => (
              <Button variant="outline" rightIcon="chevronDown" onClick={toggle}>
                Actions
              </Button>
            )}
            items={[
              { id: 'edit', label: 'Edit', icon: 'edit', description: 'Change the record' },
              { id: 'copy', label: 'Duplicate', icon: 'copy' },
              { id: 'd', label: '', divider: true },
              { id: 'delete', label: 'Delete', icon: 'trash', danger: true },
            ]}
          />
        </div>
      </Section>
    </div>
  );
}

function InputsDemo() {
  const [qty, setQty] = useState(3);
  const [bio, setBio] = useState('');
  const [pwd, setPwd] = useState('');
  const [show, setShow] = useState(false);
  return (
    <div className="form-grid">
      <TextField label="Full name" placeholder="Jane Cooper" helperText="As it appears on your ID" />
      <TextField label="Search" leftIcon="search" placeholder="Search anything…" rightElement={<Kbd>⌘K</Kbd>} />
      <TextField label="Email" type="email" leftIcon="globe" defaultValue="not-an-email" error="Enter a valid email address" />
      <TextField label="Disabled" disabled defaultValue="Read only value" />
      <TextField
        label="Password"
        type={show ? 'text' : 'password'}
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
        rightElement={<IconButton size="xs" icon={show ? 'eyeOff' : 'eye'} label="Toggle" onClick={() => setShow((s) => !s)} />}
      />
      <TextField label="Amount" type="number" leftIcon="zap" size="lg" placeholder="0.00" />
      <div className="span-2">
        <TextArea label="Bio" rows={3} maxLength={160} showCount value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself" />
      </div>
      <NumberStepper label="Quantity" value={qty} onChange={setQty} min={1} max={10} />
    </div>
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
    <div className="grid grid--2">
      <Card title="Checkbox (with indeterminate)">
        <div className="stack gap-sm">
          <Checkbox label="Select all" checked={all} indeterminate={some && !all} onChange={(v) => setChecks({ a: v, b: v, c: v })} />
          <div className="stack gap-sm pl-lg">
            {(Object.keys(checks) as Array<keyof typeof checks>).map((k) => (
              <Checkbox key={k} label={`Option ${k.toUpperCase()}`} description="Helper description" checked={checks[k]} onChange={(v) => setChecks((c) => ({ ...c, [k]: v }))} />
            ))}
          </div>
        </div>
      </Card>
      <Card title="Radio group (cards)">
        <RadioGroup
          variant="card"
          value={plan}
          onChange={setPlan}
          options={[
            { value: 'basic', label: 'Basic', description: 'Up to 5 users' },
            { value: 'pro', label: 'Professional', description: 'Up to 50 users' },
            { value: 'enterprise', label: 'Enterprise', description: 'SSO, audit, SLA' },
          ]}
        />
      </Card>
      <Card title="Switches">
        <div className="stack gap-md">
          <Switch label="Email notifications" description="Daily digest at 9am" checked={notify} onChange={setNotify} />
          <Switch label="Small switch" size="sm" checked={!notify} onChange={(v) => setNotify(!v)} />
          <Switch label="Disabled" checked disabled onChange={() => undefined} />
        </div>
      </Card>
      <Card title="Chips & segmented control">
        <div className="stack gap-md">
          <div className="row wrap gap-xs">
            {SKILLS.map((s) => (
              <Chip key={s} label={s} selected={chips.includes(s)} onClick={() => setChips((c) => (c.includes(s) ? c.filter((x) => x !== s) : [...c, s]))} />
            ))}
          </div>
          <SegmentedControl
            value={view}
            onChange={setView}
            options={[
              { value: 'list', label: 'List', icon: 'menu' },
              { value: 'grid', label: 'Grid', icon: 'grid' },
              { value: 'board', label: 'Board', icon: 'layers' },
            ]}
          />
        </div>
      </Card>
    </div>
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
    <div className="form-grid">
      <Select label="Country" placeholder="Choose a country" options={COUNTRIES} value={country} onChange={setCountry} helperText="Keyboard: arrows, type-ahead, Enter" />
      <Combobox label="Technology (autocomplete)" options={SAMPLE_OPTIONS} value={tech} onChange={setTech} />
      <MultiSelect label="Tags (multi-select + custom)" options={SAMPLE_OPTIONS} value={tags} onChange={setTags} allowCustom />
      <DatePicker label="Due date" value={date} onChange={setDate} />
      <Slider label="Volume" value={volume} onChange={setVolume} formatValue={(v) => `${v}%`} marks={[25, 50, 75]} />
      <Rating label="Rating" value={rating} onChange={setRating} />
      <div className="span-2">
        <FileUpload label="Attachments" accept={['.pdf', '.png', '.jpg', 'text/*']} maxSizeBytes={2 * 1024 * 1024} maxFiles={4} />
      </div>
    </div>
  );
}

function FeedbackDemo() {
  const toast = useToast();
  return (
    <div className="stack gap-lg">
      <div className="grid grid--2">
        <Alert tone="info" title="Heads up">A new version is available.</Alert>
        <Alert tone="success" title="Saved">Your changes were saved.</Alert>
        <Alert tone="warning" title="Storage almost full" onClose={() => undefined}>You have used 92% of your quota.</Alert>
        <Alert tone="danger" title="Payment failed" action={<Button size="xs" variant="danger">Retry</Button>}>Card declined.</Alert>
      </div>
      <Section title="Toasts">
        <div className="row wrap gap-sm">
          <Button variant="secondary" onClick={() => toast.success('Saved', 'Profile updated')}>Success</Button>
          <Button variant="secondary" onClick={() => toast.info('FYI', 'Sync scheduled')}>Info</Button>
          <Button variant="secondary" onClick={() => toast.warning('Careful', 'Unsaved changes')}>Warning</Button>
          <Button variant="secondary" onClick={() => toast.error('Error', 'Request failed')}>Error</Button>
        </div>
      </Section>
      <Section title="Badges & tooltips">
        <div className="row wrap gap-sm align-center">
          {(['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const).map((tone) => (
            <Badge key={tone} tone={tone} dot>
              {tone}
            </Badge>
          ))}
          <Badge tone="primary" variant="solid">Solid</Badge>
          <Badge tone="success" variant="outline" icon="check">Outline</Badge>
          <Tooltip content="Tooltips work on hover and focus">
            <Button variant="ghost" size="sm" leftIcon="info">Hover me</Button>
          </Tooltip>
          <Tooltip content="Bottom placement" placement="bottom">
            <Badge>Bottom tooltip</Badge>
          </Tooltip>
        </div>
      </Section>
      <Section title="Progress & loading">
        <div className="grid grid--2">
          <div className="stack gap-md">
            <ProgressBar value={72} label="Upload" showValue />
            <ProgressBar value={35} tone="warning" size="sm" />
            <ProgressBar indeterminate label="Indeterminate" />
          </div>
          <div className="row gap-lg align-center">
            <ProgressRing value={68} />
            <ProgressRing value={92} tone="success" size={72} />
            <Spinner size={28} />
            <div className="grow">
              <Skeleton lines={3} />
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

function DataDisplayDemo() {
  return (
    <div className="stack gap-lg">
      <div className="grid grid--3">
        <StatCard label="MRR" value="$128,420" change="+8.2%" trend="up" icon="activity" />
        <StatCard label="Churn" value="2.4%" change="-0.6%" trend="down" icon="users" />
        <Card title="Team" subtitle="Avatars & groups">
          <div className="row gap-md align-center">
            <Avatar name="Maya Chen" status="online" />
            <Avatar name="Diego Martinez" status="away" />
            <AvatarGroup names={['Ava Patel', 'Liam Kim', 'Noah Rossi', 'Emma Silva', 'Omar Haddad', 'Hana Tanaka']} />
          </div>
        </Card>
      </div>
      <div className="grid grid--3">
        <Card title="Timeline">
          <Timeline items={SAMPLE_TIMELINE} />
        </Card>
        <Card title="Tree view">
          <TreeView nodes={SAMPLE_TREE} defaultExpanded={['org', 'eng']} />
        </Card>
        <Card title="Description list">
          <DescriptionList
            columns={1}
            items={[
              { label: 'Account', value: 'Contoso Health' },
              { label: 'Plan', value: <Badge tone="primary">Enterprise</Badge> },
              { label: 'Renewal', value: 'Mar 1, 2027' },
              { label: 'Shortcut', value: <><Kbd>Ctrl</Kbd> + <Kbd>K</Kbd></> },
            ]}
          />
          <Divider label="or" />
          <EmptyState icon="folder" title="No documents" description="Upload a file to get started." />
        </Card>
      </div>
    </div>
  );
}

function NavigationDemo() {
  const [tab, setTab] = useState('overview');
  const [pill, setPill] = useState('week');
  const pagination = usePagination({ total: 240, pageSize: 10 });
  const stepper = useStepper({ steps: [{ id: 'account' }, { id: 'profile' }, { id: 'billing' }, { id: 'review' }] });
  return (
    <div className="stack gap-lg">
      <Card title="Tabs">
        <div className="stack gap-md">
          <Tabs value={tab} onChange={setTab} items={[{ id: 'overview', label: 'Overview', icon: 'home' }, { id: 'activity', label: 'Activity', badge: 12 }, { id: 'settings', label: 'Settings' }, { id: 'disabled', label: 'Disabled', disabled: true }]} />
          <Tabs variant="pill" value={pill} onChange={setPill} items={[{ id: 'day', label: 'Day' }, { id: 'week', label: 'Week' }, { id: 'month', label: 'Month' }]} />
          <Tabs variant="enclosed" value={tab} onChange={setTab} items={[{ id: 'overview', label: 'Overview' }, { id: 'activity', label: 'Activity' }, { id: 'settings', label: 'Settings' }]} />
        </div>
      </Card>
      <Card title="Breadcrumbs & pagination">
        <div className="stack gap-md">
          <Breadcrumbs items={[{ label: 'Home', onClick: () => undefined }, { label: 'Customers', onClick: () => undefined }, { label: 'Contoso Health' }]} />
          <Pagination model={pagination} />
          <Pagination model={pagination} compact />
        </div>
      </Card>
      <Card title="Stepper">
        <div className="stack gap-md">
          <Stepper
            steps={[
              { id: 'account', label: 'Account', description: 'Credentials' },
              { id: 'profile', label: 'Profile', description: 'About you' },
              { id: 'billing', label: 'Billing', description: 'Payment' },
              { id: 'review', label: 'Review', description: 'Confirm' },
            ]}
            statusOf={stepper.statusOf}
            onStepClick={stepper.goTo}
          />
          <div className="row gap-sm">
            <Button variant="secondary" disabled={stepper.isFirst} onClick={stepper.back}>Back</Button>
            <Button onClick={stepper.isLast ? stepper.reset : stepper.next}>{stepper.isLast ? 'Restart' : 'Next'}</Button>
          </div>
        </div>
      </Card>
      <Card title="Accordion">
        <Accordion
          defaultExpanded={['a']}
          items={[
            { id: 'a', title: 'What is shared between web and mobile?', icon: 'layers', content: 'All business logic, state, API calls, validation, i18n, theming tokens, headless control logic and services.' },
            { id: 'b', title: 'What is platform specific?', icon: 'grid', content: 'Rendering: React DOM components on web and React Native components on mobile, plus small platform adapters.' },
            { id: 'c', title: 'How are services wired?', icon: 'link', subtitle: 'InversifyJS', content: 'Through an IoC container created in createApplication(); hooks resolve services with useService().' },
          ]}
        />
      </Card>
    </div>
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

export default function ControlsPage() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<Category>('buttons');
  const Demo = DEMOS[category];
  return (
    <div className="stack gap-lg">
      <PageHeader title={t('controls.title')} subtitle={t('controls.subtitle')} />
      <Tabs
        value={category}
        onChange={(v) => setCategory(v as Category)}
        items={(Object.keys(DEMOS) as Category[]).map((c) => ({ id: c, label: t(`controls.${c}`) }))}
      />
      <Demo />
    </div>
  );
}

import { useCallback, useMemo, useState } from 'react';
import { createId } from '../utils/id';
import { toIsoDate } from '../utils/format';
import { useControllableState } from './state';

/* ---------------------------------------------------------------- Slider */
export function useSlider({
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue = min,
  onChange,
}: {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (v: number) => void;
}) {
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange });
  const normalize = useCallback(
    (v: number) => {
      const stepped = Math.round((v - min) / step) * step + min;
      return Math.min(max, Math.max(min, Number(stepped.toFixed(6))));
    },
    [min, max, step],
  );
  const percent = max === min ? 0 : ((current - min) / (max - min)) * 100;
  return {
    value: current,
    percent,
    setValue: (v: number) => setCurrent(normalize(v)),
    setFromRatio: (ratio: number) => setCurrent(normalize(min + Math.min(1, Math.max(0, ratio)) * (max - min))),
    increment: () => setCurrent((v) => normalize(v + step)),
    decrement: () => setCurrent((v) => normalize(v - step)),
    handleKey: (key: string) => {
      const map: Record<string, number> = {
        ArrowRight: step,
        ArrowUp: step,
        ArrowLeft: -step,
        ArrowDown: -step,
        PageUp: step * 10,
        PageDown: -step * 10,
      };
      if (key === 'Home') setCurrent(min);
      else if (key === 'End') setCurrent(max);
      else if (key in map) setCurrent((v) => normalize(v + map[key]!));
      else return false;
      return true;
    },
    min,
    max,
    step,
  };
}

/* ---------------------------------------------------------------- Rating */
export function useRating({
  max = 5,
  value,
  defaultValue = 0,
  onChange,
  readOnly = false,
}: {
  max?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
}) {
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange });
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? current;
  return {
    value: current,
    display,
    items: Array.from({ length: max }, (_, i) => ({ index: i + 1, filled: i + 1 <= display })),
    select: (v: number) => !readOnly && setCurrent(v === current ? 0 : v),
    setHover: (v: number | null) => !readOnly && setHover(v),
    handleKey: (key: string) => {
      if (readOnly) return false;
      if (key === 'ArrowRight' || key === 'ArrowUp') setCurrent((v) => Math.min(max, v + 1));
      else if (key === 'ArrowLeft' || key === 'ArrowDown') setCurrent((v) => Math.max(0, v - 1));
      else return false;
      return true;
    },
  };
}

/* -------------------------------------------------------------- Calendar */
export interface CalendarDay {
  date: Date;
  iso: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

export function useCalendar({
  value,
  defaultValue = '',
  onChange,
  min,
  max,
  locale = 'en',
  weekStartsOn = 0,
}: {
  value?: string;
  defaultValue?: string;
  onChange?: (iso: string) => void;
  min?: string;
  max?: string;
  locale?: string;
  weekStartsOn?: 0 | 1;
}) {
  const [selected, setSelected] = useControllableState({ value, defaultValue, onChange });
  const initial = selected ? new Date(`${selected}T00:00:00`) : new Date();
  const [view, setView] = useState({ year: initial.getFullYear(), month: initial.getMonth() });

  const weeks = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const offset = (first.getDay() - weekStartsOn + 7) % 7;
    const start = new Date(view.year, view.month, 1 - offset);
    const todayIso = toIsoDate(new Date());
    const rows: CalendarDay[][] = [];
    for (let w = 0; w < 6; w++) {
      const row: CalendarDay[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d);
        const iso = toIsoDate(date);
        row.push({
          date,
          iso,
          day: date.getDate(),
          inMonth: date.getMonth() === view.month,
          isToday: iso === todayIso,
          isSelected: iso === selected,
          isDisabled: (!!min && iso < min) || (!!max && iso > max),
        });
      }
      rows.push(row);
    }
    return rows;
  }, [view, selected, min, max, weekStartsOn]);

  const weekdayLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 7 + ((i + weekStartsOn) % 7))));
  }, [locale, weekStartsOn]);

  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    new Date(view.year, view.month, 1),
  );

  const shift = (delta: number) =>
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  return {
    selected,
    select: (iso: string) => setSelected(iso),
    clear: () => setSelected(''),
    weeks,
    weekdayLabels,
    monthLabel,
    nextMonth: () => shift(1),
    prevMonth: () => shift(-1),
    goToToday: () => {
      const t = new Date();
      setView({ year: t.getFullYear(), month: t.getMonth() });
    },
  };
}

/* ----------------------------------------------------------- File upload */
export interface FileDescriptor {
  name: string;
  size: number;
  type: string;
  /** Platform handle: File on web, uri on mobile. */
  source?: unknown;
}

export interface UploadItem extends FileDescriptor {
  id: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  progress: number;
  error?: string;
}

export function useFileUpload({
  accept = [],
  maxSizeBytes = 10 * 1024 * 1024,
  maxFiles = 5,
  uploader,
}: {
  accept?: string[];
  maxSizeBytes?: number;
  maxFiles?: number;
  /** Real uploader; defaults to a simulated progress uploader. */
  uploader?: (file: UploadItem, onProgress: (p: number) => void) => Promise<void>;
} = {}) {
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [rejections, setRejections] = useState<string[]>([]);

  const isAccepted = (f: FileDescriptor) =>
    !accept.length ||
    accept.some((a) => (a.startsWith('.') ? f.name.toLowerCase().endsWith(a.toLowerCase()) : a.endsWith('/*') ? f.type.startsWith(a.slice(0, -1)) : f.type === a));

  const addFiles = (incoming: FileDescriptor[]) => {
    const errors: string[] = [];
    const accepted: UploadItem[] = [];
    for (const f of incoming) {
      if (files.length + accepted.length >= maxFiles) errors.push(`${f.name}: max ${maxFiles} files`);
      else if (!isAccepted(f)) errors.push(`${f.name}: type not allowed`);
      else if (f.size > maxSizeBytes) errors.push(`${f.name}: exceeds size limit`);
      else accepted.push({ ...f, id: createId('file'), status: 'pending', progress: 0 });
    }
    setRejections(errors);
    setFiles((prev) => [...prev, ...accepted]);
  };

  const update = (id: string, patch: Partial<UploadItem>) =>
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const simulate = (file: UploadItem, onProgress: (p: number) => void) =>
    new Promise<void>((resolve, reject) => {
      let p = 0;
      const t = setInterval(() => {
        p = Math.min(100, p + 8 + Math.random() * 18);
        onProgress(p);
        if (p >= 100) {
          clearInterval(t);
          if (file.name.toLowerCase().includes('fail')) reject(new Error('Upload rejected by server'));
          else resolve();
        }
      }, 180);
    });

  const uploadAll = async () => {
    const pending = files.filter((f) => f.status === 'pending' || f.status === 'error');
    await Promise.all(
      pending.map(async (file) => {
        update(file.id, { status: 'uploading', progress: 0, error: undefined });
        try {
          await (uploader ?? simulate)(file, (progress) => update(file.id, { progress }));
          update(file.id, { status: 'done', progress: 100 });
        } catch (e) {
          update(file.id, { status: 'error', error: e instanceof Error ? e.message : String(e) });
        }
      }),
    );
  };

  return {
    files,
    rejections,
    addFiles,
    remove: (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id)),
    clear: () => {
      setFiles([]);
      setRejections([]);
    },
    uploadAll,
    isUploading: files.some((f) => f.status === 'uploading'),
    acceptString: accept.join(','),
  };
}

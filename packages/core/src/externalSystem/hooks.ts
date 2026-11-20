import { useMemo, useState } from 'react';
import { useService } from '../di/DIProvider';
import { TYPES } from '../di/tokens';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../auth/authSlice';
import { createCorrelationId } from '../utils/id';
import { baseApi } from '../api/baseApi';
import type { DirectoryUser } from '../features/models';
import type { ExternalSystemService } from './ExternalSystemService';

export const externalSystemsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    lookupByExternalId: build.query<DirectoryUser, { system: string; id: string }>({
      query: ({ system, id }) => ({ url: '/external-systems/lookup', params: { system, id } }),
    }),
  }),
});

export function useExternalSystemService() {
  return useService<ExternalSystemService>(TYPES.ExternalSystemService);
}

/** The id that identifies this client application to downstream systems. */
export function useExternalSystemId() {
  return useExternalSystemService().clientSystemId;
}

/**
 * Page-level logic for the External Systems screen: current user's linked ids,
 * live validation for a typed id, cross-system lookup and request header preview.
 */
export function useExternalSystemsWorkbench() {
  const service = useExternalSystemService();
  const user = useAppSelector(selectUser);
  const systems = useMemo(() => service.list(), [service]);
  const [systemId, setSystemId] = useState(systems[0]?.id ?? '');
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState<{ system: string; id: string } | null>(null);

  const validation = useMemo(() => (value ? service.validate(systemId, value) : null), [service, systemId, value]);
  const lookup = externalSystemsApi.useLookupByExternalIdQuery(submitted ?? { system: '', id: '' }, { skip: !submitted });
  const headers = useMemo(() => service.buildRequestHeaders(createCorrelationId()), [service]);

  const linkedIds = useMemo(
    () =>
      systems.map((s) => ({
        system: s,
        externalId: service.resolve(user, s.id),
        deepLink: service.resolve(user, s.id) ? service.deepLink(s.id, service.resolve(user, s.id)!) : undefined,
      })),
    [service, systems, user],
  );

  return {
    clientSystemId: service.clientSystemId,
    systems,
    selectedSystem: service.get(systemId),
    systemId,
    setSystemId: (id: string) => {
      setSystemId(id);
      setSubmitted(null);
    },
    value,
    setValue,
    validation,
    canLookup: !!validation?.valid,
    runLookup: () => setSubmitted({ system: systemId, id: value.trim() }),
    lookup,
    linkedIds,
    headers,
  };
}

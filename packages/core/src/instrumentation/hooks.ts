import { useCallback, useEffect, useRef } from 'react';
import { useService } from '../di/DIProvider';
import { TYPES } from '../di/tokens';
import type { AnalyticsProps, AnalyticsService } from './AnalyticsService';

export function useAnalytics(): AnalyticsService {
  return useService<AnalyticsService>(TYPES.AnalyticsService);
}

export function useTrackEvent() {
  const analytics = useAnalytics();
  return useCallback((name: string, props?: AnalyticsProps) => analytics.track(name, props), [analytics]);
}

/** Records a screen view once per mount (and when the name changes) plus time-on-screen on unmount. */
export function useScreenView(screenName: string, props?: AnalyticsProps) {
  const analytics = useAnalytics();
  const propsRef = useRef(props);
  propsRef.current = props;
  useEffect(() => {
    analytics.screen(screenName, propsRef.current);
    const stop = analytics.startTimer(`screen.time.${screenName}`);
    return () => {
      stop();
    };
  }, [analytics, screenName]);
}

/** Wraps a callback so each invocation is tracked. */
export function useTrackedCallback<TArgs extends unknown[], TResult>(
  eventName: string,
  callback: (...args: TArgs) => TResult,
  props?: AnalyticsProps,
) {
  const analytics = useAnalytics();
  const cbRef = useRef(callback);
  cbRef.current = callback;
  return useCallback(
    (...args: TArgs) => {
      analytics.track(eventName, props);
      return cbRef.current(...args);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [analytics, eventName],
  );
}

/** Measures how long an async operation takes. */
export function usePerformanceTimer() {
  const analytics = useAnalytics();
  return useCallback(
    async <T,>(name: string, op: () => Promise<T>, props?: AnalyticsProps): Promise<T> => {
      const stop = analytics.startTimer(name, props);
      try {
        const result = await op();
        stop({ outcome: 'success' });
        return result;
      } catch (e) {
        stop({ outcome: 'failure' });
        throw e;
      }
    },
    [analytics],
  );
}

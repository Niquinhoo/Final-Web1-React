import { useId as useReactId } from 'react';

/**
 * Stable unique id generator for label/input associations.
 * Wraps React 19's useId with a configurable prefix.
 */
export function useId(prefix = 'md3'): string {
  const reactId = useReactId();
  return `${prefix}-${reactId.replace(/[:]/g, '')}`;
}

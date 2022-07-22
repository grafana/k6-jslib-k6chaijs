import { group } from 'k6';
import { handleUnexpectedException } from './exceptions';

/**
 * Handle assertion grouping the K6 way
 */
export function describe(name: string, fn: (...xs: unknown[]) => unknown) {
  let success = true;

  group(name, () => {
    try {
      fn();

      success = true;
    } catch (error: any) {
      if (error.name !== 'AssertionError') {
        handleUnexpectedException(error, name);
      }

      success = false;
    }
  });

  return success;
}

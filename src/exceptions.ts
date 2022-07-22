import { check } from 'k6';

/**
 * Handle exceptions the K6 way
 */
export const handleUnexpectedException = (error: string, testName: string) => {
  console.error(
    `Exception raised in test "${testName}". Failing the test and continuing. \n${error}`
  );

  check(null, {
    [`Exception raised "${error}"`]: () => false
  });
};

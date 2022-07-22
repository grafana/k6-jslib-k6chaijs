export type AssertionArgsWithoutExpression = [
  successMessage: string,
  failureMessage: string,
  expected: object,
  actual?: object,
  showDiff?: boolean
];

export type Assert = (
  expression: object,
  ...args: AssertionArgsWithoutExpression
) => asserts expression;

export type AssertionArgs = [
  expression: object,
  ...args: AssertionArgsWithoutExpression
];

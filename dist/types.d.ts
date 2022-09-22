export declare type AssertionArgsWithoutExpression = [
    successMessage: string,
    failureMessage: string,
    expected: object,
    actual?: object,
    showDiff?: boolean
];
export declare type Assert = (expression: object, ...args: AssertionArgsWithoutExpression) => asserts expression;
export declare type AssertionArgs = [
    expression: object,
    ...args: AssertionArgsWithoutExpression
];

declare namespace Chai {
  export interface Assertion extends Assertion {
    anonymize: (msg: string) => string;
    validJsonBody: Assertion;
  }

  export interface AssertStatic {
    (
      expression: unknown,
      message: string,
      negateMsg: string,
      expected: object | null,
      _actual?: unknown,
      showDiff?: boolean
    ): asserts expression;
  }

  export interface Config {
    truncateVariableThreshold: number;
    truncateMsgThreshold: number;
    aggregateChecks: boolean;
    logFailures: boolean;
  }

  export interface ChaiUtils {
    getOperator(object: object, arguments: unknown): operator | undefined;
  }
}

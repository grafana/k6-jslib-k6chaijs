import { check } from 'k6';
import { Assert, AssertionArgs } from './types';
import chai from './config';
import { isFunction, regexTag, truncate } from './utils';

const getObjectDisplay = (obj: object) => {
  return chai.util.objDisplay(obj) as unknown as string;
};

const truncateByVariableThreshold = (str: string) => {
  return truncate(str, chai.config.truncateVariableThreshold);
};

/**
 * Create the base expectation message template
 *
 * Example: "expected #{this} to be above 4"
 */
function createExpectationTemplate(context: object, params: AssertionArgs) {
  const [expression, successMessage, failureMessage, expected] = params;
  const negate = chai.util.flag(context, 'negate');
  const anonymizeMsgFunction = chai.util.flag(context, 'anonymizeMsgFunction');

  let message = negate ? failureMessage : successMessage;

  // Chai only prints messages when something fails, for this reason phrasing is often
  // assuming failure. k6 wants to collect both failed and successful checks so messages must be
  // neutral. for this reason we are changing the phrasing from
  //    expected { a: 1, b: 2, c: 3 } to have property 'b' of 2, but got 2
  // to expected { a: 1, b: 2, c: 3 } to have property 'b' of 2, got 2
  message = message.replace('but ', '');

  if (anonymizeMsgFunction) {
    message = anonymizeMsgFunction(message);
  }

  if (isFunction(message)) {
    message = message();
  }

  message = message || '';
  message = message.replace(regexTag('exp'), () =>
    truncateByVariableThreshold(getObjectDisplay(expected))
  );

  return message;
}

/**
 * Create the final expectation message
 *
 * Example: "Number of crocs: expected 8 to be above 4"
 */
function createExpectationText(
  context: object,
  str = '',
  params: AssertionArgs
) {
  const object = chai.util.flag(context, 'object');
  const actual = chai.util.getActual(context, params);
  const message = chai.util.flag(context, 'message');

  let result = str
    .replace(regexTag('this'), () =>
      truncateByVariableThreshold(getObjectDisplay(object))
    )
    .replace(regexTag('act'), () =>
      truncateByVariableThreshold(getObjectDisplay(actual))
    );

  if (message && !chai.config.aggregateChecks) {
    result = message ? message + ': ' + result : result;
  }

  return result;
}

/**
 * Create the test name
 *
 * Example: "expected Number of crocs to be above 4"
 */
function createTestName(context: object, str = '') {
  const message = chai.util.flag(context, 'message');

  const testName = str
    .replace(regexTag('this'), () => message || '${this}')
    .replace(regexTag('act'), () => '${actual}');

  return truncateByVariableThreshold(testName);
}

/**
 * Overriding Chai's main assert() function to inject check() calls for both
 * successful and failed assertions.
 *
 * The original chai.util.getMessage did not truncate strings.
 * We are overriding it to prevent users from shooting themselves in the foot by
 * asserting large request.body and getting it printed on the terminal as a check message.
 */
export function assert(): Assert {
  return function (
    expression,
    successMessage,
    failureMessage,
    expected,
    _actual,
    showDiff
  ) {
    showDiff = !expected && !_actual;

    const context = this as object;
    const params: AssertionArgs = [
      expression,
      successMessage,
      failureMessage,
      expected,
      _actual,
      showDiff
    ];

    const ok = chai.util.test(context, params);
    const object = chai.util.flag(context, 'object');
    const actual = chai.util.getActual(context, params);

    const template = createExpectationTemplate(context, params);
    const testExpectation = createExpectationText(context, template, params);

    const testName = chai.config.aggregateChecks
      ? createTestName(context, template)
      : testExpectation;

    check(
      null,
      {
        [testName]: () => ok
      },
    );

    if (!ok) {
      const truncatedExpectation = truncateByVariableThreshold(testExpectation);
      const operator = chai.util.getOperator(context, params);

      const error = {
        actual,
        expected,
        showDiff,
        operator
      };

      if (chai.config.logFailures) {
        console.warn(truncatedExpectation);
      }

      throw new chai.AssertionError(
        truncatedExpectation,
        error,
        chai.config.includeStack ? chai.assert : chai.util.flag(context, 'ssfi')
      );
    }
  };
}

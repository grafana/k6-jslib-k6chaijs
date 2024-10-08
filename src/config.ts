import chai from 'chai';
import {
  AGGREGATE_CHECKS,
  EXIT_ON_ERROR,
  LOG_FAILURES,
  TRUNCATE_VARIABLE_THRESHOLD,
  TRUNCATE_MSG_THRESHOLD
} from './constants';
import { assert } from './assert';
import { anonymize, validJsonBody } from './matchers';

chai.config.truncateVariableThreshold = TRUNCATE_VARIABLE_THRESHOLD; // individual variables should be up to X chars after rendering..
chai.config.truncateMsgThreshold = TRUNCATE_MSG_THRESHOLD; // whole check() message must be below X chars.
chai.config.aggregateChecks = AGGREGATE_CHECKS; // the {#this} and {#exp} are not interpolated to aggregate checks.
chai.config.logFailures = LOG_FAILURES; // console.warn(full_message)
chai.config.exitOnError = EXIT_ON_ERROR;

chai.Assertion.addMethod('anonymize', anonymize);
chai.Assertion.addMethod('validJsonBody', validJsonBody);
chai.Assertion.overwriteMethod('assert', assert);

export default chai;

import { Assert } from './types';
/**
 * Overriding Chai's main assert() function to inject check() calls for both
 * successful and failed assertions.
 *
 * The original chai.util.getMessage did not truncate strings.
 * We are overriding it to prevent users from shooting themselves in the foot by
 * asserting large request.body and getting it printed on the terminal as a check message.
 */
export declare function assert(): Assert;

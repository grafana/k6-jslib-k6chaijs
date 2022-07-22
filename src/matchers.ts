import chai from './config';
import { regexTag } from './utils';

const fallbackAnonymize = (msg = '') => {
  return msg.replace(regexTag('this'), () => {
    return '<anonymized>';
  });
};

/**
 * Anonymizes the value of "this" in the message
// useful for hiding tokens/passwords in the check messages.
 */
export function anonymize(fn = fallbackAnonymize) {
  chai.util.flag(this, 'anonymizeMsgFunction', fn);
}

/**
 * Determines whether the object is valid JSON
 */
export function validJsonBody() {
  const response = chai.util.flag(this, 'object');
  let isCheckSuccessful = true;

  try {
    response.json('__unlikelyidefintifier1');
  } catch (e) {
    isCheckSuccessful = false;
  }

  chai.assert(
    isCheckSuccessful,
    `has valid json body`,
    'does not have a valid json body',
    null, // expected
    null // actual
  );
}

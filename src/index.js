import { check, group } from "k6";
import chai from "chai";

var util = chai.util, 
    expect = chai.expect,
    Assertion = chai.Assertion,
    AssertionError = chai.AssertionError,
    config = chai.config,
    flag = chai.util.flag;

const truncateString = (str, len) => str.length > len ? `${str.substring(0, len)}...` : str;

config.truncateValueThreshold = 100; // individual variables should be up to 100 chars.
config.truncateMsgThreshold = 300; // whole check() message must be below 300 chars.

//
// The original chai.util.getMessage did not truncate strings.
// We are overriding it to prevent users from shooting themselves in a foot by
// assering large request.body and getting it printed on the terminal as a check message. 
// 
function getMessage(obj, args){
  var negate = flag(obj, 'negate')
    , val = flag(obj, 'object')
    , expected = args[3]
    , actual = util.getActual(obj, args)
    , msg = negate ? args[2] : args[1]
    , flagMsg = flag(obj, 'message')
    , anonymizeMsgFunction = flag(obj, 'anonymizeMsgFunction');

  if(anonymizeMsgFunction){
    msg = anonymizeMsgFunction(msg)
  }

  if(typeof msg === "function") msg = msg();
  msg = msg || '';
  msg = msg
    .replace(/#\{this\}/g, function () { return truncateString(util.objDisplay(val), config.truncateValueThreshold) })
    .replace(/#\{act\}/g, function () { return truncateString(util.objDisplay(actual), config.truncateValueThreshold) })
    .replace(/#\{exp\}/g, function () { return truncateString(util.objDisplay(expected), config.truncateValueThreshold) });
config.truncateValueThreshold
  msg = flagMsg ? flagMsg + ': ' + msg : msg;

  return truncateString(msg, config.truncateMsgThreshold);
}

/*
Overriding Chai's main assert() function to inject check() calls for both
successful and failed assertions. 
*/
util.overwriteMethod(Assertion.prototype, 'assert', function (_super) {
  return function (expr, msg, negateMsg, expected, _actual, showDiff) {
    var ok = util.test(this, arguments);
    if (false !== showDiff) showDiff = true;
    if (undefined === expected && undefined === _actual) showDiff = false;
    if (true !== config.showDiff) showDiff = false;

    msg = getMessage(this, arguments); // our implementation.

    var actual = util.getActual(this, arguments);
    var assertionErrorObjectProperties = {
        actual: actual
      , expected: expected
      , showDiff: showDiff
    };

    var operator = util.getOperator(this, arguments);
    if (operator) {
      assertionErrorObjectProperties.operator = operator;
    }

    if (!ok) {
      check(null, {
        [msg]: false
      })
      throw new AssertionError(
        msg,
        assertionErrorObjectProperties,
        (config.includeStack) ? this.assert : util.flag(this, 'ssfi'));
    }
    else{
      check(null, {
        [msg]: true
      })
    }
  };
});

// anonymizes the value of "this" in the message
// useful for hiding tokens/passwords in the check messages.
util.addMethod(Assertion.prototype, 'anonymize', function (anonymizeMsgFunction) {
  anonymizeMsgFunction = anonymizeMsgFunction || function(msg) {
    return msg.replace(/#\{this\}/g, function () { return "<anonymized>"; })
  }

  flag(this, 'anonymizeMsgFunction', anonymizeMsgFunction);
});

util.addMethod(Assertion.prototype, 'validJsonBody', function () {
  var response = flag(this, 'object');

  let checkIsSuccessful = true;
  try {
    response.json();
  }
  catch (e) {
    checkIsSuccessful = false;
  }

  this.assert(
    checkIsSuccessful
  , `has valid json body`
  , "does not have a valid json body"
  , null   // expected
  , null   // actual
  );    
});

function handleUnexpectedException(e, testName) {
  console.error(`Exception raised in test "${testName}". Failing the test and continuing. \n${e}`)

  check(null, {
    [`Exception raised "${e}"`]: false
  });
}

let describe = function (stepName, stepFunction) {
  let success = true;

  group(stepName, () => {
    try {
      stepFunction();
      success = true;
    }
    catch (e) {
      if (e.name === "AssertionError" ) { // chai way
        success = false;
      }
      else {
        success = false;
        handleUnexpectedException(e, stepName)
      }
    }
  });
  return success;
};


export {
  describe,
  expect,
  chai, // allow users to extend the library.
}
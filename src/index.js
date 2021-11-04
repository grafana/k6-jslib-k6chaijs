import { check, group } from "k6";
import chai from "chai";

var util = chai.util, 
    expect = chai.expect,
    Assertion = chai.Assertion,
    AssertionError = chai.AssertionError,
    config = chai.config,
    flag = chai.util.flag;

const truncateString = (str, len) => str.length > len ? `${str.substring(0, len)}...` : str;

config.truncateVariableThreshold = 100; // individual variables should be up to 100 chars after rendering..
config.truncateMsgThreshold = 300; // whole check() message must be below 300 chars.
config.aggregateChecks = true; // the {#this} and {#exp} are not interpolated to aggregate checks.
config.logFailures = false; // console.warn(full_message)

//
// The original chai.util.getMessage did not truncate strings.
// We are overriding it to prevent users from shooting themselves in the foot by
// asserting large request.body and getting it printed on the terminal as a check message.
// 
function getCheckMessage(obj, args){
  var negate = flag(obj, 'negate')
    , val = flag(obj, 'object')
    , expected = args[3]
    , actual = util.getActual(obj, args)
    , msg = negate ? args[2] : args[1]
    , flagMsg = flag(obj, 'message')
    , anonymizeMsgFunction = flag(obj, 'anonymizeMsgFunction');

  // console.log(`Original: ${msg}`)

  // Chai only prints messages when something fails, for this reason phrasing is often
  // assuming failure. k6 wants to collect both failed and successful checks so messages must be
  // neutral. for this reason we are changing the phrasing from
  //    expected { a: 1, b: 2, c: 3 } to have property 'b' of 2, but got 2
  // to expected { a: 1, b: 2, c: 3 } to have property 'b' of 2, got 2
  msg = msg.replace('but ', '')

  if(anonymizeMsgFunction){
    msg = anonymizeMsgFunction(msg)
  }

  let thisDisplay = truncateString(util.objDisplay(val), config.truncateVariableThreshold);
  let actualDisplay = truncateString(util.objDisplay(actual), config.truncateVariableThreshold);
  let expectedDisplay = truncateString(util.objDisplay(expected), config.truncateVariableThreshold);

  if(typeof msg === "function") msg = msg();
  msg = msg || '';
  msg = msg.replace(/#\{exp\}/g, function () { return expectedDisplay });

  let aggregatedMessage = msg
      .replace(/#\{this\}/g, function () { return flagMsg || "${this}" })
      .replace(/#\{act\}/g, function () { return "${actual}" })

  msg = msg
    .replace(/#\{this\}/g, function () { return thisDisplay })
    .replace(/#\{act\}/g, function () { return actualDisplay} )

  if(flagMsg && !config.aggregateChecks){
    msg = flagMsg ? flagMsg + ': ' + msg : msg;
  }

  let checkName = config.aggregateChecks ? aggregatedMessage: msg

  // return truncateString(msg, config.truncateMsgThreshold)
  return {
    checkName: truncateString(checkName, config.truncateMsgThreshold),
    message: truncateString(msg, config.truncateMsgThreshold),
    thisDisplay: thisDisplay,
    actualDisplay: actualDisplay,
    expectedDisplay: expectedDisplay,
  };
}

/*
Overriding Chai's main assert() function to inject check() calls for both
successful and failed assertions. 
*/
util.overwriteMethod(Assertion.prototype, 'assert', function (_super) {
  return function (expr, msg, negateMsg, expected, _actual, showDiff) {
    let ok = util.test(this, arguments);
    if (false !== showDiff) showDiff = true;
    if (undefined === expected && undefined === _actual) showDiff = false;
    if (true !== config.showDiff) showDiff = false;

    let checkMessage = getCheckMessage(this, arguments) // our implementation.
    let checkName = checkMessage.checkName;

    let actual = util.getActual(this, arguments);
    let assertionErrorObjectProperties = {
        actual: actual
      , expected: expected
      , showDiff: showDiff
    };

    check(null, {
      [checkName]: ok
    }, {
      this: checkMessage.thisDisplay,
      actual: checkMessage.actualDisplay,
      expected: checkMessage.expectedDisplay,
      // message: checkMessage.message,
    })

    if (!ok) {
      let operator = util.getOperator(this, arguments);
      if (operator) {
        assertionErrorObjectProperties.operator = operator;
      }

      if(config.logFailures){
        console.warn(checkMessage.message)
      }

      throw new AssertionError(
        checkMessage.message,
        assertionErrorObjectProperties,
        (config.includeStack) ? this.assert : util.flag(this, 'ssfi'));
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
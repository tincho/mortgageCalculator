
// import calculateResults from './calc';
// const calculateResults = require('./calc');
const $ = sel => document.querySelector(sel);
$.all = sel => document.querySelectorAll(sel);

class ValidationError extends Error {
  constructor(invalidFields) {
    super('Form has invalid fields');
    this.invalidFields = invalidFields;
    this.name = 'ValidationError';
  }
}

/**
 * Get values from given UI inputs
 * @param {Array} fieldIds
 * @param {string} form Selector to limit scope of values picked from UI elements
 */
function getValues(fieldIds, form = '') {
  const fieldValue = id => $(`${form} #${id}`).value;

  // harvest values from UI
  return fieldIds.reduce((state, field) => Object.assign(state, {
    [field]: fieldValue(field),
  }), {});
}

function setValues(results) {
  const setResultValue = (result, value) => {
    const formatCurrency = v => parseFloat(v).toFixed(2);
    // @TODO update "source of truth" instead of DOM directly
    $(`#${result} dd`).innerText = formatCurrency(value);
  };

  Object.keys(results).forEach((result) => {
    setResultValue(result, results[result]);
  });
}

function calculate(calculatorState) {
  const results = window.calculateResults(calculatorState);
  setValues(results);
}

function validate(values, checks) {
  const invalidFields = Object.keys(values).reduce((invalid, key) => {
    const isValid = checks.reduce((valid, check) => valid && check(values[key]), true);
    if (!isValid) {
      invalid.push(key);
    }
    return invalid;
  }, []);
  if (invalidFields.length) throw new ValidationError(invalidFields);
}

const mirrorValue = (input) => {
  let format = v => v;
  if (input.step && !Number.isInteger(input.step)) {
    format = v => parseFloat(v).toFixed(1);
  }
  $(`input[data-from='${input.id}']`).value = format(input.value);
};

function showValidationMessages(e) {
  e.invalidFields.forEach((fieldId) => {
    $(`#${fieldId}-wrapper .error-message`).style.display = 'block';
  });
}
window.onload = () => {
  $.all('input[type=range]').forEach((i) => {
    mirrorValue(i);
    i.addEventListener('input', () => mirrorValue(i));
  });

  // main function
  $('#calculate').addEventListener('click', () => {
    const fields = [
      'yearsOfMortgage',
      'interestRate',
      'loanAmount',
      'annualTax',
      'annualInsurance',
    ];
    try {
      const calculatorState = getValues(fields);
      validate(calculatorState, [
        v => v && v !== null && v !== '',
        v => parseFloat(v) && parseFloat(v) > 0,
      ]);
      calculate(calculatorState);
    } catch (e) {
      if (e instanceof ValidationError) {
        showValidationMessages(e);
      }
    }
  });
};

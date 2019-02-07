
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

  return fieldIds.reduce((values, field) => Object.assign(values, {
    [field]: fieldValue(field),
  }), {});
}

/**
 * Set result values into view
 * @param {Object} results As they come from calc module
 */
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

/**
 * Validates input values
 * @param {Array} values Values to validate if all checks pass
 * @param {...Function} checks Functions that should return true if value is valid
 * @throws ValidationError
 */
function validate(values, checks) {
  const invalidFields = Object.keys(values)
    .filter(key => checks.some(check => !check(values[key])));
  if (invalidFields.length) throw new ValidationError(invalidFields);
}

/**
 * Bind value from an input into another that references its ID inside data-from attr
 * @param {Element} input Source input
 */
const mirrorValue = (input) => {
  const copyValue = () => {
    let format = v => v;
    if (input.step && !Number.isInteger(input.step)) {
      format = (v) => {
        if (parseInt(v) == 10) return v;
        return parseFloat(v).toFixed(1);
      }
    }
    $(`input[data-from='${input.id}']`).value = format(input.value);
  };
  copyValue();
  input.addEventListener('input', copyValue);
};

/**
 * Show view validation error messages
 * @param {ValidationError} e Error thrown by validator
 */
function handleInvalid(e) {
  if (!(e instanceof ValidationError)) {
    // ignore other types of Error
    return;
  }
  const showMessage = (fieldId) => {
    $(`#${fieldId}-wrapper`).classList.add('field-error');
  };
  const hideMessage = (fieldId) => {
    $(`#${fieldId}-wrapper`).classList.remove('field-error');
  };
  e.invalidFields.forEach((fieldId) => {
    showMessage(fieldId);
    $(`#${fieldId}`).addEventListener('input', () => hideMessage(fieldId));
  });
}

/**
 * Init function
 */
window.onload = () => {
  const yearsOfMortgage = $('#yearsOfMortgage');
  const interestRate = $('#interestRate');
  mirrorValue(yearsOfMortgage);
  mirrorValue(interestRate);
  document.documentElement.classList.add('js');
  yearsOfMortgage.addEventListener('input', () => {
    yearsOfMortgage.style.setProperty('--val', +yearsOfMortgage.value);
  }, false);
  interestRate.addEventListener('input', () => {
    interestRate.style.setProperty('--val', +interestRate.value);
  }, false);

  // main functionality
  const btn = $('#calculate');
  const fields = [
    'yearsOfMortgage',
    'interestRate',
    'loanAmount',
    'annualTax',
    'annualInsurance',
  ];
  const validationRules = [
    // not null not empty
    v => v && v !== null && v !== '',
    // number and greater than zero
    v => parseFloat(v) && parseFloat(v) > 0,
  ];
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const values = getValues(fields);
    try {
      validate(values, validationRules);
      const results = window.calculateMortgage(values);
      setValues(results);
    } catch (e) {
      handleInvalid(e);
    }
  });
};

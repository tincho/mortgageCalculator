/**
 * Principle & Interest based on Annuity formula
 * @param {Object} calculatorState
 * @param {number} calculatorState.interestRate
 * @param {number} calculatorState.loanAmount
 * @param {number} calculatorState.yearsOfMortgage
 * @returns {number}
 */
const calculatePrincipleAndInterest = ({
  interestRate,
  loanAmount,
  yearsOfMortgage,
}) => {
  const I = (interestRate / 100) / 12;
  const Y = -yearsOfMortgage * 12;
  const pow = (1 + I) ** Y;
  return I * loanAmount / (1 - pow);
};

/**
 * Arrange the values to show as results
 * @param {Object} input
 * @param {number} input.annualTax
 * @param {number} input.annualInsurance
 * @param {...number} calculatorState Rest of the values, relevant to calculatePrincipleAndInterest
 * @see calculatePrincipleAndInterest
 * @returns {Object} Calculated values
 */
function calculateMortgage({
  annualTax,
  annualInsurance,
  ...calculatorState
}) {
  const principleAndInterest = calculatePrincipleAndInterest(calculatorState);
  const monthlyTax = annualTax / 12;
  const monthlyInsurance = annualInsurance / 12;
  const totalMonthlyPayment = principleAndInterest + monthlyTax + monthlyInsurance;

  return {
    principleAndInterest,
    monthlyTax,
    monthlyInsurance,
    totalMonthlyPayment,
  };
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = calculateMortgage;
} else {
  window.calculateMortgage = calculateMortgage;
}

const assert = require('assert');
const calculateMortgage = require('../src/calc');

describe('calc module', () => {
  const sampleInput = {
    interestRate: 8,
    loanAmount: 100000,
    yearsOfMortgage: 30,
    annualTax: 1000,
    annualInsurance: 300,
  };

  it('should return these 4 values', () => {
    const q = calculateMortgage(sampleInput);
    const expectedKeys = [
      'monthlyInsurance',
      'monthlyTax',
      'principleAndInterest',
      'totalMonthlyPayment',
    ];
    assert.deepEqual(expectedKeys, Object.keys(q).sort());
  });

  it('should apply formula', () => {
    const q = calculateMortgage(sampleInput);
    assert.equal(q.principleAndInterest.toFixed(2), 733.76);
  });

  it('should divide annualInsurance by 12', () => {
    const q = calculateMortgage(sampleInput);
    assert.equal(q.monthlyInsurance, 25);
  });

  it('should divide annualTax by 12', () => {
    const q = calculateMortgage(sampleInput);
    assert.equal(Math.floor(q.monthlyTax), 83);
  });

  it('should sum principle, tax and insurance to get total', () => {
    const q = calculateMortgage(sampleInput);
    const sum = q.principleAndInterest + q.monthlyTax + q.monthlyInsurance;
    assert.equal(q.totalMonthlyPayment, sum);
  });

});

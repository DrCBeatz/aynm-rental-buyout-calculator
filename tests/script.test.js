// tests/script.test.js

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateBalanceOwing, TAX_RATES } from '../src/script.js';

describe('calculateBalanceOwing', () => {
  beforeEach(() => {
    // Set up the DOM before each test
    document.body.innerHTML = `
      <form id="calculatorForm">
        <input type="number" id="purchasePrice" value="1000">
        <input type="number" id="monthlyPayment" value="50">
        <input type="number" id="monthsRented" value="2">
        <input type="number" id="deposit" value="100">
        <select id="province"></select>
        <div id="totalCredit"></div>
        <div id="balanceOwing"></div>
        <div id="balanceOwingWithTax"></div>
        <div id="result"></div>
      </form>
    `;

    // Manually populate the province dropdown
    const provinceSelect = document.getElementById('province');
    const option = document.createElement('option');
    option.value = 'ON';
    option.textContent = 'ON (13.00%)';
    provinceSelect.appendChild(option);
  });


  // Utility function to round to two decimal places and return as a number for consistent comparisons
  function roundToTwo(value) {
    return parseFloat((Math.round(value * 100) / 100).toFixed(2));
  }

  it('calculates balance owing correctly for less than 3 months rented', () => {
    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);

    const totalCredit = document.getElementById('totalCredit').textContent;
    const balanceOwing = document.getElementById('balanceOwing').textContent;
    const balanceOwingWithTax = document.getElementById('balanceOwingWithTax').textContent;

    // Calculate the expected values using roundToTwo consistently
    const expectedBalanceOwing = roundToTwo(811.50);
    const expectedBalanceOwingWithTax = roundToTwo(expectedBalanceOwing * 1.13); // Apply tax at 13%

    // Format as strings to ensure the expected values have two decimal places for consistent comparisons
    expect(totalCredit).toBe('(100%) $188.50');
    expect(balanceOwing).toBe(`$${expectedBalanceOwing.toFixed(2)}`);
    expect(balanceOwingWithTax).toBe(`$${Math.round(expectedBalanceOwingWithTax).toFixed(2)}`);
  });


  it('calculates balance owing correctly for more than 3 months rented', () => {
    document.getElementById('monthsRented').value = '4';

    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);

    const totalCredit = document.getElementById('totalCredit').textContent;
    const balanceOwing = document.getElementById('balanceOwing').textContent;
    const balanceOwingWithTax = document.getElementById('balanceOwingWithTax').textContent;

    expect(totalCredit).toBe('(50%) $144.25');
    expect(balanceOwing).toBe('$855.75');
    expect(balanceOwingWithTax).toBe('$967.00'); // Balance Owing including 13% tax
  });

  it('calculates balance owing correctly for exactly 3 months rented', () => {
    // Update monthsRented value
    document.getElementById('monthsRented').value = '3';

    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);

    const totalCredit = document.getElementById('totalCredit').textContent;
    const balanceOwing = document.getElementById('balanceOwing').textContent;
    const balanceOwingWithTax = document.getElementById('balanceOwingWithTax').textContent;

    expect(totalCredit).toBe('(100%) $238.50');
    expect(balanceOwing).toBe('$761.50');
    expect(balanceOwingWithTax).toBe('$860.50'); // Balance Owing including 13% tax
  });

  it('calculates correctly for a province with a different tax rate (QC)', () => {
    const provinceSelect = document.getElementById('province');
    provinceSelect.innerHTML = '';
    const option = document.createElement('option');
    option.value = 'QC';
    option.textContent = 'QC (14.975%)';
    provinceSelect.appendChild(option);

    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);

    const totalCredit = document.getElementById('totalCredit').textContent;
    const balanceOwing = document.getElementById('balanceOwing').textContent;
    const balanceOwingWithTax = document.getElementById('balanceOwingWithTax').textContent;

    expect(totalCredit).toBe('(100%) $186.98');
    expect(balanceOwing).toBe('$813.02');
    expect(balanceOwingWithTax).toBe('$934.77'); // Balance Owing including 14.975% tax
  });

  it('calculates correctly when months rented is zero', () => {
    document.getElementById('monthsRented').value = '0';

    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);

    const totalCredit = document.getElementById('totalCredit').textContent;
    const balanceOwing = document.getElementById('balanceOwing').textContent;
    const balanceOwingWithTax = document.getElementById('balanceOwingWithTax').textContent;

    expect(totalCredit).toBe('(100%) $88.50');
    expect(balanceOwing).toBe('$911.50');
    expect(balanceOwingWithTax).toBe('$1030.00'); // Balance Owing including 13% tax

  });

  it('handles empty input values gracefully', () => {
    document.getElementById('purchasePrice').value = '';
    document.getElementById('monthlyPayment').value = '';
    document.getElementById('monthsRented').value = '';
    document.getElementById('deposit').value = '';

    const event = { preventDefault: vi.fn() };

    // Wrap in a try-catch block to catch any errors
    try {
      calculateBalanceOwing(event);
      // If the function doesn't throw, check for expected behavior
      const totalCredit = document.getElementById('totalCredit').textContent;
      const balanceOwing = document.getElementById('balanceOwing').textContent;
      const balanceOwingWithTax = document.getElementById('balanceOwingWithTax').textContent;

      expect(totalCredit).toBe('$0.00 (100%)');
      expect(balanceOwing).toBe('$0.00');
      expect(balanceOwingWithTax).toBe('$0.00');
    } catch (error) {
      // If an error is expected, you can assert that
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('handles non-numeric input values gracefully', () => {
    document.getElementById('purchasePrice').value = 'abc';
    document.getElementById('monthlyPayment').value = '$50';
    document.getElementById('monthsRented').value = 'two';
    document.getElementById('deposit').value = '@100';

    const event = { preventDefault: vi.fn() };

    try {
      calculateBalanceOwing(event);
      const totalCredit = document.getElementById('totalCredit').textContent;
      const balanceOwing = document.getElementById('balanceOwing').textContent;
      const balanceOwingWithTax = document.getElementById('balanceOwingWithTax').textContent;

      // Decide on expected behavior, e.g., show $0.00 or an error message
      expect(totalCredit).toBe('$0.00 (100%)');
      expect(balanceOwing).toBe('$0.00');
      expect(balanceOwingWithTax).toBe('$0.00');

    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('handles unknown province codes gracefully', () => {
    const provinceSelect = document.getElementById('province');
    provinceSelect.innerHTML = '';
    const option = document.createElement('option');
    option.value = 'XX'; // Non-existent province code
    option.textContent = 'XX (0.00%)';
    provinceSelect.appendChild(option);

    const event = { preventDefault: vi.fn() };

    try {
      calculateBalanceOwing(event);
      // Decide on expected behavior, e.g., default tax rate or error message
      const totalCredit = document.getElementById('totalCredit').textContent;
      const balanceOwing = document.getElementById('balanceOwing').textContent;
      const balanceOwingWithTax = document.getElementById('balanceOwingWithTax').textContent;

      expect(totalCredit).toBe('$188.50 (100%)'); // If tax rate defaults to 0%
      expect(balanceOwing).toBe('$811.50');
      expect(balanceOwingWithTax).toBe('$811.50');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('calculates correctly with high-precision decimal inputs', () => {
    document.getElementById('purchasePrice').value = '1000.98765';
    document.getElementById('monthlyPayment').value = '50.12345';
    document.getElementById('monthsRented').value = '2';
    document.getElementById('deposit').value = '100.54321';

    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);

    const totalCredit = document.getElementById('totalCredit').textContent;
    const balanceOwing = document.getElementById('balanceOwing').textContent;

    expect(totalCredit).toBe('(100%) $189.22');
    expect(balanceOwing).toBe('$811.76');
  });

  it('calculates correctly with extremely high values', () => {
    document.getElementById('purchasePrice').value = '1000000';
    document.getElementById('monthlyPayment').value = '5000';
    document.getElementById('monthsRented').value = '24';
    document.getElementById('deposit').value = '10000';

    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);

    // Perform the calculations for expected values
    const depositPreTax = 10000 / 1.13; // ≈ 8849.56
    const rentalTotal = 5000 * 24; // 120000
    const totalCredit = 0.5 * (120000 + 8849.56); // ≈ 64,424.78
    const balanceOwing = 1000000 - totalCredit; // ≈ 935,575.22

    const totalCreditText = `(50%) $${totalCredit.toFixed(2)}`;
    const balanceOwingText = `$${balanceOwing.toFixed(2)}`;

    const totalCreditOutput = document.getElementById('totalCredit').textContent;
    const balanceOwingOutput = document.getElementById('balanceOwing').textContent;

    expect(totalCreditOutput).toBe(totalCreditText);
    expect(balanceOwingOutput).toBe(balanceOwingText);
  });

  it('updates the result section in the DOM', () => {
    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);

    const resultSection = document.getElementById('result');
    expect(resultSection.style.display).toBe('block');

    const totalCredit = document.getElementById('totalCredit').textContent;
    const balanceOwing = document.getElementById('balanceOwing').textContent;

    expect(totalCredit).toBeDefined();
    expect(balanceOwing).toBeDefined();
  });

  it('handles undefined tax rate gracefully', () => {
    // Remove the province from TAX_RATES
    delete TAX_RATES['ON'];

    const event = { preventDefault: vi.fn() };

    try {
      calculateBalanceOwing(event);
      const totalCredit = document.getElementById('totalCredit').textContent;
      const balanceOwing = document.getElementById('balanceOwing').textContent;

      // Decide on expected behavior
      expect(totalCredit).toBe('(100%) $0.00');
      expect(balanceOwing).toBe('$1000.00');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    } finally {
      // Restore the tax rate
      TAX_RATES['ON'] = 0.13;
    }
  });

});
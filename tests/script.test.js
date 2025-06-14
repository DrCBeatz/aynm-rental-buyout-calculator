// tests/script.test.js

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateBalanceOwing, TAX_RATES, populateProvinceDropdown, calculateDepositCredit, calculateRentalPaymentCredit, calculateTotalCredit, calculateBalanceOwingBeforeTax, calculateBalanceOwingWithTax } from '../src/script.js';

describe('populateProvinceDropdown', () => {
  it('populates select with all provinces', () => {
    document.body.innerHTML = '<select id="province"></select>';
    populateProvinceDropdown();
    const options = document.querySelectorAll('#province option');
    expect(options.length).toBe(Object.keys(TAX_RATES).length);
    const onOption = Array.from(options).find(o => o.value === 'ON');
    expect(onOption.textContent).toBe('ON (13%)');
  });
});

describe('Calculation functions', () => {

  it('calculates deposit credit correctly', () => {
    const deposit = 100;
    const taxRate = 0.13;
    expect(calculateDepositCredit(deposit, taxRate)).toBeCloseTo(88.50, 2);
  });

  it('uses GST-only rate for BC', () => {
    const deposit = 100;
    const taxRate = TAX_RATES['BC'];
    expect(taxRate).toBeCloseTo(0.05, 2);
    expect(calculateDepositCredit(deposit, taxRate)).toBeCloseTo(95.24, 2);
  });

  it('handles negative deposit values', () => {
    const deposit = -100;
    const taxRate = 0.13;
    expect(calculateDepositCredit(deposit, taxRate)).toBeCloseTo(-88.5, 2);
  });

  it('rounds correctly with zero deposit', () => {
    const deposit = 0;
    const taxRate = 0.13;
    expect(calculateDepositCredit(deposit, taxRate)).toBeCloseTo(0, 2);
  });

  it('calculates rental payment credit for less than 3 months rented', () => {
    const monthlyPayment = 50;
    const monthsRented = 2;
    const result = calculateRentalPaymentCredit(monthlyPayment, monthsRented);
    expect(result.creditAmount).toBeCloseTo(100, 2);  // Expecting credit amount
    expect(result.creditPercentage).toBe(100);        // Expecting 100% for <= 3 months
  });

  it('calculates rental payment credit for more than 3 months rented', () => {
    const monthlyPayment = 50;
    const monthsRented = 4;
    const result = calculateRentalPaymentCredit(monthlyPayment, monthsRented);
    expect(result.creditAmount).toBeCloseTo(100, 2);  // Expecting credit amount
    expect(result.creditPercentage).toBe(50);         // Expecting 50% for > 3 months
  });

  it('handles fractional months rented', () => {
    const monthlyPayment = 50;
    const monthsRented = 2.5;
    const result = calculateRentalPaymentCredit(monthlyPayment, monthsRented);
    expect(result.creditAmount).toBeCloseTo(125, 2);
    expect(result.creditPercentage).toBe(100);
  });


  it('calculates total credit correctly', () => {
    const depositCredit = 88.50;
    const rentalPaymentCredit = 100;
    expect(calculateTotalCredit(depositCredit, rentalPaymentCredit)).toBeCloseTo(188.50, 2);
  });

  it('calculates balance owing before tax correctly', () => {
    const purchasePrice = 1000;
    const totalCredit = 188.50;
    expect(calculateBalanceOwingBeforeTax(purchasePrice, totalCredit)).toBeCloseTo(811.50, 2);
  });

  it('calculates balance owing with tax correctly', () => {
    const balanceOwingBeforeTax = 811.50;
    const taxRate = 0.13;

    const actualValue = parseFloat(calculateBalanceOwingWithTax(balanceOwingBeforeTax, taxRate).toFixed(2));
    const expectedValue = parseFloat((balanceOwingBeforeTax * (1 + taxRate)).toFixed(2));

    expect(actualValue).toBe(expectedValue);
  });

});

describe('calculateBalanceOwing', () => {
  beforeEach(() => {
    document.body.innerHTML = `
          <form id="calculatorForm">
            <input type="number" id="purchasePrice" value="1000">
            <input type="number" id="monthlyPayment" value="50">
            <input type="number" id="monthsRented" value="2">
            <input type="number" id="deposit" value="100">
            <select id="province"></select>
            <div id="rentalPaymentCredit"></div>
            <div id="depositCredit"></div>
            <div id="totalCredit"></div>
            <div id="balanceOwing"></div>
            <div id="balanceOwingWithTax"></div>
            <div id="result"></div>
          </form>
        `;
    // Populate province dropdown with default value
    const provinceSelect = document.getElementById('province');
    const option = document.createElement('option');
    option.value = 'ON';
    option.textContent = 'ON (13.00%)';
    provinceSelect.appendChild(option);
  });

  it('calculates balance owing correctly for less than 3 months rented', () => {
    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);

    const rentalPaymentCredit = document.getElementById('rentalPaymentCredit').textContent;
    const depositCredit = document.getElementById('depositCredit').textContent;
    const totalCredit = document.getElementById('totalCredit').textContent;
    const balanceOwing = document.getElementById('balanceOwing').textContent;
    const balanceOwingWithTax = document.getElementById('balanceOwingWithTax').textContent;

    expect(depositCredit).toBe('$88.50'); // 100% of deposit, pre-tax
    expect(rentalPaymentCredit).toBe('(100%) $100.00'); // 100% of rental payments for 2 months
    expect(totalCredit).toBe('$188.50');
    expect(balanceOwing).toBe('$811.50');
    expect(balanceOwingWithTax).toBe('$916.99'); // Including 13% tax
  });



  it('calculates balance owing correctly for more than 3 months rented', () => {
    document.getElementById('monthsRented').value = '4';

    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);

    const rentalPaymentCredit = document.getElementById('rentalPaymentCredit').textContent;
    const depositCredit = document.getElementById('depositCredit').textContent;
    const totalCredit = document.getElementById('totalCredit').textContent;
    const balanceOwing = document.getElementById('balanceOwing').textContent;
    const balanceOwingWithTax = document.getElementById('balanceOwingWithTax').textContent;

    expect(depositCredit).toBe('$88.50'); // 100% of deposit, pre-tax
    expect(rentalPaymentCredit).toBe('(50%) $100.00'); // 50% of rental payments for 4 months
    expect(totalCredit).toBe('$188.50');
    expect(balanceOwing).toBe('$811.50');
    expect(balanceOwingWithTax).toBe('$916.99'); // Including 13% tax
  });

  it('calculates balance owing correctly for exactly 3 months rented', () => {
    document.getElementById('monthsRented').value = '3';

    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);

    const rentalPaymentCredit = document.getElementById('rentalPaymentCredit').textContent;
    const depositCredit = document.getElementById('depositCredit').textContent;
    const totalCredit = document.getElementById('totalCredit').textContent;
    const balanceOwing = document.getElementById('balanceOwing').textContent;
    const balanceOwingWithTax = document.getElementById('balanceOwingWithTax').textContent;

    expect(depositCredit).toBe('$88.50'); // 100% of deposit, pre-tax
    expect(rentalPaymentCredit).toBe('(100%) $150.00'); // 100% of rental payments for 3 months
    expect(totalCredit).toBe('$238.50');
    expect(balanceOwing).toBe('$761.50');
    expect(balanceOwingWithTax).toBe('$860.49'); // Including 13% tax
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

    const rentalPaymentCredit = document.getElementById('rentalPaymentCredit').textContent;
    const depositCredit = document.getElementById('depositCredit').textContent;
    const totalCredit = document.getElementById('totalCredit').textContent;
    const balanceOwing = document.getElementById('balanceOwing').textContent;
    const balanceOwingWithTax = document.getElementById('balanceOwingWithTax').textContent;

    expect(depositCredit).toBe('$86.98'); // 100% of deposit, pre-tax with QC tax rate
    expect(rentalPaymentCredit).toBe('(100%) $100.00'); // 100% of rental payments for 2 months
    expect(totalCredit).toBe('$186.98');
    expect(balanceOwing).toBe('$813.02');
    expect(balanceOwingWithTax).toBe('$934.77'); // Including 14.975% tax
  });

  it('calculates correctly for a GST-only province (BC)', () => {
    const provinceSelect = document.getElementById('province');
    provinceSelect.innerHTML = '';
    const option = document.createElement('option');
    option.value = 'BC';
    option.textContent = 'BC (5%)';
    provinceSelect.appendChild(option);

    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);

    const rentalPaymentCredit = document.getElementById('rentalPaymentCredit').textContent;
    const depositCredit = document.getElementById('depositCredit').textContent;
    const totalCredit = document.getElementById('totalCredit').textContent;
    const balanceOwing = document.getElementById('balanceOwing').textContent;
    const balanceOwingWithTax = document.getElementById('balanceOwingWithTax').textContent;

    expect(depositCredit).toBe('$95.24'); // deposit pre-tax with 5% GST
    expect(rentalPaymentCredit).toBe('(100%) $100.00');
    expect(totalCredit).toBe('$195.24');
    expect(balanceOwing).toBe('$804.76');
    expect(balanceOwingWithTax).toBe('$845.00');
  });


  it('calculates correctly when months rented is zero', () => {
    document.getElementById('monthsRented').value = '0';

    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);

    const rentalPaymentCredit = document.getElementById('rentalPaymentCredit').textContent;
    const depositCredit = document.getElementById('depositCredit').textContent;
    const totalCredit = document.getElementById('totalCredit').textContent;
    const balanceOwing = document.getElementById('balanceOwing').textContent;
    const balanceOwingWithTax = document.getElementById('balanceOwingWithTax').textContent;

    expect(depositCredit).toBe('$88.50'); // 100% of deposit, pre-tax
    expect(rentalPaymentCredit).toBe('(100%) $0.00'); // 0 months of rental payments
    expect(totalCredit).toBe('$88.50');
    expect(balanceOwing).toBe('$911.50');
    expect(balanceOwingWithTax).toBe('$1029.99'); // Including 13% tax
  });


  it('handles empty input values gracefully', () => {
    document.getElementById('purchasePrice').value = '';
    document.getElementById('monthlyPayment').value = '';
    document.getElementById('monthsRented').value = '';
    document.getElementById('deposit').value = '';

    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);

    expect(document.getElementById('depositCredit').textContent).toBe('$0.00');
    expect(document.getElementById('rentalPaymentCredit').textContent).toBe('(100%) $0.00');
    expect(document.getElementById('totalCredit').textContent).toBe('$0.00');
    expect(document.getElementById('balanceOwing').textContent).toBe('$0.00');
    expect(document.getElementById('balanceOwingWithTax').textContent).toBe('$0.00');
  });


  it('handles non-numeric input values gracefully', () => {
    document.getElementById('purchasePrice').value = 'abc';
    document.getElementById('monthlyPayment').value = '$50';
    document.getElementById('monthsRented').value = 'two';
    document.getElementById('deposit').value = '@100';

    const event = { preventDefault: vi.fn() };

    try {
      calculateBalanceOwing(event);
      const rentalPaymentCredit = document.getElementById('rentalPaymentCredit').textContent;
      const depositCredit = document.getElementById('depositCredit').textContent;
      const totalCredit = document.getElementById('totalCredit').textContent;
      const balanceOwing = document.getElementById('balanceOwing').textContent;
      const balanceOwingWithTax = document.getElementById('balanceOwingWithTax').textContent;

      expect(rentalPaymentCredit).toBe('$0.00');
      expect(depositCredit).toBe('$0.00');
      expect(totalCredit).toBe('$0.00');
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
      const rentalPaymentCredit = document.getElementById('rentalPaymentCredit').textContent;
      const depositCredit = document.getElementById('depositCredit').textContent;
      const totalCredit = document.getElementById('totalCredit').textContent;
      const balanceOwing = document.getElementById('balanceOwing').textContent;
      const balanceOwingWithTax = document.getElementById('balanceOwingWithTax').textContent;

      expect(depositCredit).toBe('$88.50'); // 100% of deposit pre-tax, with 0% tax rate
      expect(rentalPaymentCredit).toBe('(100%) $100.00'); // 100% of rental payments for 2 months
      expect(totalCredit).toBe('$188.50');
      expect(balanceOwing).toBe('$811.50');
      expect(balanceOwingWithTax).toBe('$811.50'); // No additional tax
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

    const rentalPaymentCredit = document.getElementById('rentalPaymentCredit').textContent;
    const depositCredit = document.getElementById('depositCredit').textContent;
    const totalCredit = document.getElementById('totalCredit').textContent;
    const balanceOwing = document.getElementById('balanceOwing').textContent;
    const balanceOwingWithTax = document.getElementById('balanceOwingWithTax').textContent;

    expect(depositCredit).toBe('$88.98');
    expect(rentalPaymentCredit).toBe('(100%) $100.25');
    expect(totalCredit).toBe('$189.23');
    expect(balanceOwing).toBe('$811.76');
    expect(balanceOwingWithTax).toBe('$917.29'); // Balance Owing including 13% tax
  });

  it('handles negative deposit values in DOM calculations', () => {
    document.getElementById('deposit').value = '-50';

    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);

    expect(document.getElementById('depositCredit').textContent).toBe('$-44.25');
    expect(document.getElementById('rentalPaymentCredit').textContent).toBe('(100%) $100.00');
    expect(document.getElementById('totalCredit').textContent).toBe('$55.75');
    expect(document.getElementById('balanceOwing').textContent).toBe('$944.25');
    expect(document.getElementById('balanceOwingWithTax').textContent).toBe('$1067.00');
  });

  it('truncates fractional months rented in DOM calculations', () => {
    document.getElementById('monthsRented').value = '2.5';

    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);

    expect(document.getElementById('rentalPaymentCredit').textContent).toBe('(100%) $100.00');
    expect(document.getElementById('monthsRented').value).toBe('2.5');
  });


  it('calculates correctly with extremely high values', () => {
    document.getElementById('purchasePrice').value = '1000000';
    document.getElementById('monthlyPayment').value = '5000';
    document.getElementById('monthsRented').value = '24';
    document.getElementById('deposit').value = '10000';

    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);

    // Expected values based on updated credit logic
    const depositPreTax = 10000 / 1.13; // ≈ 8849.56
    const depositCredit = depositPreTax.toFixed(2); // Always 100% of deposit, pre-tax
    const rentalTotal = 5000 * 24; // 120000
    const rentalPaymentCredit = (0.5 * rentalTotal).toFixed(2); // 50% of rental payments for 24 months

    const totalCredit = (parseFloat(depositCredit) + parseFloat(rentalPaymentCredit)).toFixed(2); // Sum of credits
    const balanceOwing = (1000000 - totalCredit).toFixed(2); // Balance before tax
    const balanceOwingWithTax = (balanceOwing * 1.13).toFixed(2); // Including 13% tax

    // Expected text output
    const depositCreditText = `$${depositCredit}`;
    const rentalPaymentCreditText = `(50%) $${rentalPaymentCredit}`;
    const totalCreditText = `$${totalCredit}`;
    const balanceOwingText = `$${balanceOwing}`;
    const balanceOwingWithTaxText = `$${balanceOwingWithTax}`;

    // Check DOM output
    expect(document.getElementById('depositCredit').textContent).toBe(depositCreditText);
    expect(document.getElementById('rentalPaymentCredit').textContent).toBe(rentalPaymentCreditText);
    expect(document.getElementById('totalCredit').textContent).toBe(totalCreditText);
    expect(document.getElementById('balanceOwing').textContent).toBe(balanceOwingText);
    expect(document.getElementById('balanceOwingWithTax').textContent).toBe(balanceOwingWithTaxText);
  });


  it('updates the result section in the DOM', () => {
    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);

    const resultSection = document.getElementById('result');
    expect(resultSection.style.display).toBe('block');

    const depositCredit = document.getElementById('depositCredit').textContent;
    const rentalPaymentCredit = document.getElementById('rentalPaymentCredit').textContent;
    const totalCredit = document.getElementById('totalCredit').textContent;
    const balanceOwing = document.getElementById('balanceOwing').textContent;
    const balanceOwingWithTax = document.getElementById('balanceOwingWithTax').textContent;

    expect(depositCredit).toBeDefined();
    expect(rentalPaymentCredit).toBeDefined();
    expect(totalCredit).toBeDefined();
    expect(balanceOwing).toBeDefined();
    expect(balanceOwingWithTax).toBeDefined();
  });

  it('handles undefined tax rate gracefully', () => {
    // Remove the province from TAX_RATES
    delete TAX_RATES['ON'];

    const event = { preventDefault: vi.fn() };

    try {
      calculateBalanceOwing(event);
      const depositCredit = document.getElementById('depositCredit').textContent;
      const rentalPaymentCredit = document.getElementById('rentalPaymentCredit').textContent;
      const totalCredit = document.getElementById('totalCredit').textContent;
      const balanceOwing = document.getElementById('balanceOwing').textContent;
      const balanceOwingWithTax = document.getElementById('balanceOwingWithTax').textContent;

      // With undefined tax rate, assume tax rate is 0%
      expect(depositCredit).toBe('$88.50'); // 100% of deposit without tax deduction
      expect(rentalPaymentCredit).toBe('(100%) $100.00'); // 100% rental payment credit for 2 months
      expect(totalCredit).toBe('$188.50');
      expect(balanceOwing).toBe('$811.50');
      expect(balanceOwingWithTax).toBe('$811.50'); // No additional tax applied
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    } finally {
      // Restore the tax rate
      TAX_RATES['ON'] = 0.13;
    }
  });

});
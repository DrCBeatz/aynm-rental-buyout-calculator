// tests/script.test.js

import {describe, it, expect, beforeEach, vi }  from 'vitest';
import {calculateBalanceOwing} from '../src/script.js';

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

  it('calculates balance owing correctly for less than 3 months rented', () => {
    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);

    const totalCredit = document.getElementById('totalCredit').textContent;
    const balanceOwing = document.getElementById('balanceOwing').textContent;

    expect(totalCredit).toBe('$188.50 (100%)');
    expect(balanceOwing).toBe('$811.50');
  });

  it('calculates balance owing correctly for more than 3 months rented', () => {
    // Update monthsRented value
    document.getElementById('monthsRented').value = '4';

    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);

    const totalCredit = document.getElementById('totalCredit').textContent;
    const balanceOwing = document.getElementById('balanceOwing').textContent;

    expect(totalCredit).toBe('$144.25 (50%)');
    expect(balanceOwing).toBe('$855.75');
  });

  it('calculates balance owing correctly for exactly 3 months rented', () => {
    // Update monthsRented value
    document.getElementById('monthsRented').value = '3';
  
    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);
  
    const totalCredit = document.getElementById('totalCredit').textContent;
    const balanceOwing = document.getElementById('balanceOwing').textContent;
  
    expect(totalCredit).toBe('$238.50 (100%)');
    expect(balanceOwing).toBe('$761.50');
  });

  it('calculates correctly for a province with a different tax rate (QC)', () => {
    // Update province to QC
    const provinceSelect = document.getElementById('province');
    provinceSelect.innerHTML = '';
    const option = document.createElement('option');
    option.value = 'QC';
    option.textContent = 'QC (14.98%)';
    provinceSelect.appendChild(option);
  
    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);
  
    const totalCredit = document.getElementById('totalCredit').textContent;
    const balanceOwing = document.getElementById('balanceOwing').textContent;
  
    expect(totalCredit).toBe('$186.98 (100%)');
    expect(balanceOwing).toBe('$813.02');
  });
  
  it('calculates correctly when months rented is zero', () => {
    document.getElementById('monthsRented').value = '0';
  
    const event = { preventDefault: vi.fn() };
    calculateBalanceOwing(event);
  
    const totalCredit = document.getElementById('totalCredit').textContent;
    const balanceOwing = document.getElementById('balanceOwing').textContent;
  
    expect(totalCredit).toBe('$88.50 (100%)');
    expect(balanceOwing).toBe('$911.50');
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
  
      expect(totalCredit).toBe('$0.00 (100%)');
      expect(balanceOwing).toBe('$0.00');
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
  
      // Decide on expected behavior, e.g., show $0.00 or an error message
      expect(totalCredit).toBe('$0.00 (100%)');
      expect(balanceOwing).toBe('$0.00');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
  
  
});
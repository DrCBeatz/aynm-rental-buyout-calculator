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

  it('calculates balance owing correctly for less than or equal to 3 months rented', () => {
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
});
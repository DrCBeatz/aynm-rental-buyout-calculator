// script.js

/**
 * An object containing tax rates for each Canadian province/territory.
 * @constant
 * @type {Object.<string, number>}
 */
export const TAX_RATES = {
  'ON': 0.13,
  'QC': 0.14975,
  'BC': 0.12,
  'AB': 0.05,
  'MB': 0.12,
  'NB': 0.15,
  'NL': 0.15,
  'NS': 0.15,
  'NT': 0.05,
  'NU': 0.05,
  'PE': 0.15,
  'SK': 0.11,
  'YT': 0.05
};

/**
 * Populates the province dropdown with each province and its corresponding tax rate.
 */
export function populateProvinceDropdown() {
  const provinceSelect = document.getElementById('province');
  if (!provinceSelect) return;
  for (const [province, rate] of Object.entries(TAX_RATES)) {
    const option = document.createElement('option');
    option.value = province;
    option.textContent = `${province} (${(rate * 100)}%)`;
    provinceSelect.appendChild(option);
  }
}

// Attach event listeners if running in the browser
if (typeof window !== 'undefined') {
  // Wait for the DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      populateProvinceDropdown();
      const calculatorForm = document.getElementById('calculatorForm');
      if (calculatorForm) {
        calculatorForm.onsubmit = calculateBalanceOwing;
      }
    });
  } else {
    // DOM is already loaded
    populateProvinceDropdown();
    const calculatorForm = document.getElementById('calculatorForm');
    if (calculatorForm) {
      calculatorForm.onsubmit = calculateBalanceOwing;
    }
  }
}

/**
 * Handles the calculation of the balance owing for a rental instrument buyout.
 * 
 * @param {Event} event - The form submission event.
 * @returns {void}
 */
export function calculateBalanceOwing(event) {
  event.preventDefault();

  const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);
  const monthlyPayment = parseFloat(document.getElementById('monthlyPayment').value);
  const monthsRented = parseInt(document.getElementById('monthsRented').value);
  const deposit = parseFloat(document.getElementById('deposit').value);
  const province = document.getElementById('province').value;

  const taxRate = TAX_RATES[province] || 0;
  const depositPreTax = deposit / (1 + taxRate);
  const rentalTotal = monthlyPayment * monthsRented;

  // Determine the credit percentage based on rental duration
  const creditPercentage = monthsRented <= 3 ? 1.0 : 0.5;
  const creditLabel = monthsRented <= 3 ? "100%" : "50%";

  // Calculate the total credit
  const totalCredit = creditPercentage * (rentalTotal + depositPreTax);

  // Calculate balance owing before tax
  const balanceOwing = purchasePrice - totalCredit;

  // Calculate balance owing including tax
  const balanceOwingWithTax = balanceOwing * (1 + taxRate);

  // Display results
  document.getElementById('totalCredit').textContent = `$${totalCredit.toFixed(2)} (${creditLabel})`;
  document.getElementById('balanceOwing').textContent = `$${balanceOwing.toFixed(2)}`;
  document.getElementById('balanceOwingWithTax').textContent = `$${balanceOwingWithTax.toFixed(2)}`;
  document.getElementById('result').style.display = 'block';
}

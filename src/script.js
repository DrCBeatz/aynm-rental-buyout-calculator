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
 * Calculates the deposit credit by removing the tax from the deposit amount.
 * 
 * @param {number} deposit - The deposit amount.
 * @param {number} taxRate - The tax rate as a decimal (e.g., 0.13 for 13%).
 * @returns {number} - The deposit credit after tax deduction.
 */
export function calculateDepositCredit(deposit, taxRate) {
  return parseFloat((deposit / (1 + taxRate)).toFixed(2));
}

/**
 * Calculates the rental payment credit based on the months rented.
 * 
 * @param {number} monthlyPayment - The monthly rental payment amount.
 * @param {number} monthsRented - The number of months the item has been rented.
 * @returns {Object} - An object containing the credit percentage and calculated rental payment credit.
 */
export function calculateRentalPaymentCredit(monthlyPayment, monthsRented) {
  const creditPercentage = monthsRented <= 3 ? 100 : 50;
  const creditAmount = (creditPercentage / 100) * (monthlyPayment * monthsRented);
  return { creditPercentage, creditAmount: parseFloat(creditAmount.toFixed(2)) };
}

/**
 * Calculates the total credit by summing the deposit credit and rental payment credit.
 * 
 * @param {number} depositCredit - The credit from the deposit.
 * @param {number} rentalPaymentCredit - The credit from rental payments.
 * @returns {number} - The total credit amount.
 */
export function calculateTotalCredit(depositCredit, rentalPaymentCredit) {
  return parseFloat((depositCredit + rentalPaymentCredit).toFixed(2));
}

/**
 * Calculates the balance owing before tax by subtracting total credit from the purchase price.
 * 
 * @param {number} purchasePrice - The original purchase price.
 * @param {number} totalCredit - The total credit amount.
 * @returns {number} - The balance owing before tax.
 */
export function calculateBalanceOwingBeforeTax(purchasePrice, totalCredit) {
  return parseFloat((purchasePrice - totalCredit).toFixed(2));
}

/**
 * Calculates the balance owing with tax applied.
 * 
 * @param {number} balanceOwingBeforeTax - The balance owing before tax.
 * @param {number} taxRate - The applicable tax rate as a decimal.
 * @returns {number} - The balance owing after tax.
 */
export function calculateBalanceOwingWithTax(balanceOwingBeforeTax, taxRate) {
  return parseFloat((balanceOwingBeforeTax * (1 + taxRate)).toFixed(2));
}

/**
 * Populates the province dropdown with each province and its corresponding tax rate.
 * 
 * @returns {void}
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

  const purchasePrice = parseFloat(document.getElementById('purchasePrice')?.value) || 0;
  const monthlyPayment = parseFloat(document.getElementById('monthlyPayment')?.value) || 0;
  const monthsRented = parseInt(document.getElementById('monthsRented')?.value) || 0;
  const deposit = parseFloat(document.getElementById('deposit')?.value) || 0;
  const province = document.getElementById('province')?.value || 'ON';
  const taxRate = TAX_RATES[province] || 0;

  // Calculate components
  const { creditPercentage, creditAmount: rentalPaymentCredit } = calculateRentalPaymentCredit(monthlyPayment, monthsRented);
  const depositCredit = calculateDepositCredit(deposit, taxRate);
  const totalCredit = calculateTotalCredit(depositCredit, rentalPaymentCredit);
  const balanceOwing = calculateBalanceOwingBeforeTax(purchasePrice, totalCredit);
  const balanceOwingWithTax = calculateBalanceOwingWithTax(balanceOwing, taxRate);

  // Display results
  document.getElementById('rentalPaymentCredit').textContent = `(${creditPercentage}%) $${rentalPaymentCredit.toFixed(2)}`;
  document.getElementById('depositCredit').textContent = `$${depositCredit.toFixed(2)}`;
  document.getElementById('totalCredit').textContent = `$${totalCredit.toFixed(2)}`;
  document.getElementById('balanceOwing').textContent = `$${balanceOwing.toFixed(2)}`;
  document.getElementById('balanceOwingWithTax').textContent = `$${balanceOwingWithTax.toFixed(2)}`;
  document.getElementById('result').style.display = 'block';
}

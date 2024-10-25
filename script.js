// script.js

/**
 * An object containing tax rates for each Canadian province/territory.
 * @constant
 * @type {Object.<string, number>}
 */
const TAX_RATES = {
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
function populateProvinceDropdown() {
  const provinceSelect = document.getElementById('province');
  for (const [province, rate] of Object.entries(TAX_RATES)) {
    const option = document.createElement('option');
    option.value = province;
    option.textContent = `${province} (${(rate * 100).toFixed(2)}%)`;
    provinceSelect.appendChild(option);
  }
}
populateProvinceDropdown();

document.getElementById("calculatorForm").onsubmit = calculateBalanceOwing;

/**
 * Handles the calculation of the balance owing for a rental instrument buyout.
 * 
 * @param {Event} event - The form submission event.
 * @returns {void}
 */
function calculateBalanceOwing(event) {
  event.preventDefault();

  /**
   * @type {number} purchasePrice - The initial purchase price of the instrument.
   * @type {number} monthlyPayment - The monthly rental payment amount (pre-tax).
   * @type {number} monthsRented - The number of months the instrument was rented.
   * @type {number} deposit - The refundable deposit amount (includes tax).
   * @type {string} province - The province or territory where the instrument was rented.
   */
  const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);
  const monthlyPayment = parseFloat(document.getElementById('monthlyPayment').value);
  const monthsRented = parseInt(document.getElementById('monthsRented').value);
  const deposit = parseFloat(document.getElementById('deposit').value);
  const province = document.getElementById('province').value;

  const taxRate = TAX_RATES[province];
  const depositPreTax = deposit / (1 + taxRate);
  const rentalTotal = monthlyPayment * monthsRented;

  // Determine the credit percentage based on rental duration
  const creditPercentage = monthsRented <= 3 ? 1.0 : 0.5;
  const creditLabel = monthsRented <= 3 ? "100%" : "50%";

  /**
   * The total credit amount is calculated based on rental payments and deposit.
   * @type {number}
   */
  const totalCredit = creditPercentage * (rentalTotal + depositPreTax);

  /**
   * The remaining balance after applying the credit.
   * @type {number}
   */
  const balanceOwing = purchasePrice - totalCredit;

  // Display results
  document.getElementById('totalCredit').textContent = `$${totalCredit.toFixed(2)} (${creditLabel})`;
  document.getElementById('balanceOwing').textContent = `$${balanceOwing.toFixed(2)}`;
  document.getElementById('result').style.display = 'block';
}

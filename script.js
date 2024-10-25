// script.js

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

// Populate province dropdown with tax rates
const provinceSelect = document.getElementById('province');
for (const [province, rate] of Object.entries(TAX_RATES)) {
  const option = document.createElement('option');
  option.value = province;
  option.textContent = `${province} (${(rate * 100).toFixed(2)}%)`;
  provinceSelect.appendChild(option);
}

document.getElementById("calculatorForm").onsubmit = calculateBalanceOwing;

function calculateBalanceOwing(event) {
  event.preventDefault();

  const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);
  const monthlyPayment = parseFloat(document.getElementById('monthlyPayment').value);
  const monthsRented = parseInt(document.getElementById('monthsRented').value);
  const deposit = parseFloat(document.getElementById('deposit').value);
  const province = document.getElementById('province').value;

  const taxRate = TAX_RATES[province];
  const depositPreTax = deposit / (1 + taxRate);
  const rentalTotal = monthlyPayment * monthsRented;

  let creditPercentage = monthsRented <= 3 ? 1.0 : 0.5;
  let creditLabel = monthsRented <= 3 ? "100%" : "50%";

  const totalCredit = creditPercentage * (rentalTotal + depositPreTax);
  const balanceOwing = purchasePrice - totalCredit;

  document.getElementById('totalCredit').textContent = `$${totalCredit.toFixed(2)} (${creditLabel})`;
  document.getElementById('balanceOwing').textContent = `$${balanceOwing.toFixed(2)}`;
  document.getElementById('result').style.display = 'block';
}

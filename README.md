# AYNM Rental Buyout Calculator

A web application designed to calculate the remaining buyout balance for rented musical instruments. Users input the initial purchase price, monthly payment amount, total months rented, deposit, and tax rate (based on the Canadian province). The app calculates the total credit applied and balance due, providing users with an estimate for purchasing the instrument.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [File Structure](#file-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Province-specific Tax Calculation**: Applies the correct tax rate based on the user's selected Canadian province.
- **Detailed Buyout Calculation**: Computes the balance owed before and after tax, taking rental payments and deposits into account.
- **Responsive Design**: The app is designed to be mobile-friendly and accessible.
- **Clear Display of Results**: Results are displayed in a structured table format for ease of review.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DrCBeatz/aynm-rental-buyout-calculator.git
   cd aynm-rental-buyout-calculator

2. **Install dependencies: Make sure you have Node.js installed. Then run:**
    ```bash
    npm install
    ```

3. **Run the app locally (Optional):** Use a simple HTTP server to serve index.html for testing. For example:
    ```bash
    npx http-server src
    ```

    This will serve the app on `http://localhost:8080` by default.

## Usage

1. **Enter Purchase Information:** Input the full purchase price (including the rental instrument and any added accessories), monthly payment amount (pre-tax), and number of months the item has been rented.
2. **Select Province**: Choose the province to apply the correct tax rate.
3. **Submit:** Click "Calculate" to view the buyout balance details.

The calculator will display:
- **Rental Payment Credit:** A portion of the rental payments that apply toward purchase.
- **Deposit Credit**: Deposit amount adjusted for tax.
- **Total Credit Amount:** Total pplied credit from rental payment and deposit.
- **Balance Owing:** Amount due before and after tax.

## File Structure

The project's organizion is as follows:

```plaintext
.
├── README.md
├── main.tf                      # Terraform configuration for cloud resources
├── package.json                 # Project and dependency metadata
├── src/
│   ├── images/
│   │   └── select-arrow.svg     # Custom select dropdown arrow
│   ├── index.html               # HTML structure for the app
│   ├── script.js                # JavaScript for handling calculations
│   └── styles.css               # Styling for the app
├── tests/
│   └── script.test.js           # Unit tests for JavaScript functions
└── vitest.config.js             # Configuration for Vitest testing framework
```

## Testing

The app includes tests to validate the calculation logic. We use [Vitest](https://vitest.dev) for unit testing.

To run tests:
```bash
npm test
```

## Deployment

This project cn be deployed on AWS with S3, CloudFront, and Route 53 using **Terraform** for automated setup.

### Steps:
1. Configure AWS credentials in your environment
2. Run Terrform to provision the S3 bucket and CloudFront distribution:
    ```bash
    terraform init
    terraform apply
    ```
3. Upload the contents of the src folder to the S3 bucket to make the site live.

## Contributing
Contributions are welcome! Here's how you can help:
1. Fork this repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your chnges and run tests.
4. Submit a pull request.

## License

This project is licensed under the MIT License.
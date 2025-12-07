# Banking Sample App

This repository contains a simple banking-style web application used as a target system for my automation frameworks.  
It provides basic **login**, **accounts**, and **internal transfer** functionality, plus supporting APIs.

The goal of this project is to have a realistic but lightweight banking app that I fully control, so I can design and run
end-to-end automation (UI + API + data validation) without relying on external demos.

## Tech Stack

- **Backend:** Node.js, Express (`server.js`)
- **Frontend:** React (under `banking-sample-app/` and `public/`)
- **Data:** In-memory data model for accounts and transfers (no external DB), for simplicity
- **API:** REST-style endpoints for:
  - user login
  - fetching accounts and balances
  - creating internal transfers

## Main Features

- **Authentication**
  - Basic login flow with validation and error messages.

- **Accounts**
  - List of user accounts with current balances.
  - Simple invariants: total funds across accounts remain conserved.

- **Transfers**
  - Internal transfer between accounts:
    - positive scenarios: valid source/target, sufficient funds
    - negative scenarios: insufficient funds, invalid accounts, invalid amounts

These behaviors are used by my Playwright automation projects to verify UI flows and API responses:
- [Banking-app-Playwright-Typescript](https://github.com/Farhod75/Banking-app-Playwright-Typescript)
- [treasury-payments-e2e_python](https://github.com/Farhod75/treasury-payments-e2e_python)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Install Dependencies

```bash
npm install

Run the App

npm start
By default the app runs on http://localhost:3000 (or as configured in server.js / .env).

Usage in Automation
This app is intentionally small and focused:

UI flows (login → view accounts → make transfer) are exercised by Playwright UI tests.
API endpoints are exercised by Playwright API tests or other HTTP clients.
Balances and transfer rules are used to implement invariant-based assertions (e.g., total funds do not change).
This makes it a good sandbox for demonstrating end-to-end automation design for banking-style systems.
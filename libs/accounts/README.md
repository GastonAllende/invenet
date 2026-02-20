# Accounts Library

## Overview

The `@invenet/accounts` library provides comprehensive account management functionality for the Invenet trading journal platform. It implements a complete CRUD interface for trader accounts, including risk management settings, account types, and soft-delete archival.

## Features

- ✅ **Create Accounts**: Set up new trading accounts with broker details, starting balance, and risk parameters
- ✅ **View Account List**: Browse all accounts with filtering for archived accounts
- ✅ **Edit Accounts**: Update account details while preserving immutable fields (start date, starting balance)
- 🚧 **Archive Accounts**: Soft-delete inactive accounts (planned - Phase 6)
- ✅ **Risk Management**: Configure per-trade risk, daily/weekly loss limits, and enforcement settings
- ✅ **Multi-Currency Support**: Handle accounts in USD, EUR, GBP, JPY, and other major currencies
- ✅ **Timezone Support**: Track accounts across different trading

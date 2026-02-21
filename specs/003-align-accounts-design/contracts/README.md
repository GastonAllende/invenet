# API Contracts: Accounts UI Refactoring

**Date**: 2026-02-20  
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md)

## Overview

This directory contains API contract specifications for the accounts feature modifications. Since this is primarily a UI refactoring, the only new API contract is the DELETE endpoint.

## Existing Endpoints (No Changes)

The following endpoints already exist and require **no modifications**:

- `POST /api/accounts` - Create account
- `GET /api/accounts` - List accounts (with optional `?includeArchived=true` filter)
- `GET /api/accounts/{id}` - Get single account
- `PUT /api/accounts/{id}` - Update account

**Documentation**: See existing API documentation in `apps/api/Invenet.Api/Modules/Accounts/API/AccountsController.cs`

---

## New Endpoints

### DELETE /api/accounts/{id}

Delete an account permanently.

**File**: [delete-account.md](delete-account.md)

**Summary**: Permanently removes an account owned by the authenticated user.

**Request**: No body, account ID in URL
**Response**: `204 No Content` (empty body)
**Authorization**: Required - user must own the account

---

## Contract Validation

All endpoints follow these standards:

1. **Authentication**: Bearer token required (`[Authorize]` attribute)
2. **Authorization**: Operations filter by `UserId` from claims
3. **Error Responses**: Standard HTTP status codes with problem details
4. **Content Type**: `application/json` for request/response bodies
5. **CORS**: Configured to allow frontend origin

---

## Testing Contracts

Contracts can be validated via:

1. **Unit tests**: `apps/api/Invenet.Test/Modules/Accounts/`
2. **Integration tests**: API controller tests with in-memory database
3. **E2E tests**: `apps/invenet-e2e/` Playwright tests

---

## Versioning

API version: `v1` (implicit, no version in URL)

**Breaking changes**: None - the DELETE endpoint is additive.

**Backward compatibility**: ✅ Fully backward compatible - existing clients unaffected.

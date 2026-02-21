# DELETE /api/accounts/{id}

Delete an account permanently.

---

## Request

### HTTP Method

```
DELETE
```

### Endpoint

```
/api/accounts/{id}
```

### Path Parameters

| Parameter | Type | Required | Description                                |
| --------- | ---- | -------- | ------------------------------------------ |
| `id`      | GUID | Yes      | Unique identifier of the account to delete |

**Example**: `/api/accounts/3fa85f64-5717-4562-b3fc-2c963f66afa6`

### Headers

| Header          | Value            | Required | Description      |
| --------------- | ---------------- | -------- | ---------------- |
| `Authorization` | `Bearer {token}` | Yes      | JWT access token |
| `Content-Type`  | N/A              | No       | No request body  |

### Query Parameters

None.

### Request Body

None.

---

## Response

### Success Response

**HTTP Status**: `204 No Content`

**Body**: Empty (no content)

**Headers**:

- Standard response headers only

**Example**:

```http
HTTP/1.1 204 No Content
Date: Thu, 20 Feb 2026 10:30:00 GMT
Server: Kestrel
```

**Behavior**:

- Account is permanently removed from the database
- Associated `AccountRiskSettings` (if any) are cascade-deleted
- Account no longer appears in list endpoints
- Requesting the deleted account returns 404

---

### Error Responses

#### 401 Unauthorized

User is not authenticated.

```json
{
  "type": "https://tools.ietf.org/html/rfc7235#section-3.1",
  "title": "Unauthorized",
  "status": 401,
  "traceId": "00-abc123..."
}
```

**Cause**: Missing or invalid JWT token in Authorization header.

---

#### 404 Not Found

Account does not exist or user does not have permission to delete it.

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "traceId": "00-def456..."
}
```

**Causes**:

- Account ID does not exist in the database
- Account exists but belongs to a different user (authorization failure)
- Account was already deleted

**Security Note**: We return 404 for both "not found" and "not authorized" to avoid leaking account existence information to unauthorized users.

---

#### 400 Bad Request

Invalid account ID format.

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "errors": {
    "id": ["The value 'invalid-id' is not valid."]
  },
  "traceId": "00-ghi789..."
}
```

**Cause**: Account ID in URL is not a valid GUID format.

**Note**: This should be rare since the route constraint `{id:guid}` validates format. Client should always send valid GUIDs.

---

#### 500 Internal Server Error

Unexpected server error (e.g., database connection failure, transaction rollback).

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.6.1",
  "title": "An error occurred while processing your request.",
  "status": 500,
  "traceId": "00-jkl012..."
}
```

**Cause**: Server-side exception during processing.

**Action**: Log error details server-side. Client should retry or report error to user.

---

## Authorization

### Required Claims

- `ClaimTypes.NameIdentifier`: User ID (GUID)

### Authorization Logic

```csharp
var userId = GetCurrentUserId(); // Extract from JWT claims
var account = await _context.Accounts
    .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

if (account == null)
{
    return NotFound(); // Either doesn't exist or not authorized
}
```

**Key Points**:

- User can only delete their own accounts
- `UserId` match is enforced in the database query
- No separate authorization check needed (implicit via UserId filter)

---

## Business Rules

### Validation Rules

1. **Account ID must be a valid GUID** (enforced by route constraint)
2. **Account must exist** (enforced by database query)
3. **User must own the account** (enforced by UserId filter)

### Cascade Deletion

When an account is deleted:

- Associated `AccountRiskSettings` are automatically deleted (cascade delete via EF Core configuration)
- Ensure database foreign key constraints support cascade delete

**Note**: If accounts have related trades or other data, business rules for handling orphaned data should be implemented. Current spec assumptions treat this as an edge case without mandatory handling.

### Idempotency

**DELETE is idempotent**: Deleting an already-deleted account returns 404 (same as not found).

- First delete: `204 No Content` (success)
- Second delete: `404 Not Found` (account no longer exists)

This is correct HTTP behavior - clients can safely retry DELETE operations.

---

## Examples

### Example 1: Successful Deletion

**Request**:

```http
DELETE /api/accounts/3fa85f64-5717-4562-b3fc-2c963f66afa6 HTTP/1.1
Host: api.invenet.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**:

```http
HTTP/1.1 204 No Content
Date: Thu, 20 Feb 2026 10:30:00 GMT
Server: Kestrel
```

**Result**: Account and its risk settings are permanently deleted from database.

---

### Example 2: Account Not Found

**Request**:

```http
DELETE /api/accounts/00000000-0000-0000-0000-000000000000 HTTP/1.1
Host: api.invenet.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**:

```http
HTTP/1.1 404 Not Found
Content-Type: application/problem+json

{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "traceId": "00-abc123..."
}
```

**Result**: No changes to database.

---

### Example 3: Unauthorized (Another User's Account)

**Request**:

```http
DELETE /api/accounts/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee HTTP/1.1
Host: api.invenet.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

(JWT token for User A, but account belongs to User B)

**Response**:

```http
HTTP/1.1 404 Not Found
Content-Type: application/problem+json

{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "traceId": "00-def456..."
}
```

**Result**: No changes to database. Returns 404 (not 403) to avoid leaking account existence.

---

### Example 4: Invalid GUID Format

**Request**:

```http
DELETE /api/accounts/not-a-valid-guid HTTP/1.1
Host: api.invenet.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**:

```http
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "errors": {
    "id": ["The value 'not-a-valid-guid' is not valid."]
  },
  "traceId": "00-ghi789..."
}
```

**Result**: No database query executed (validation fails at routing level).

---

## Implementation Notes

### Controller Method Signature

```csharp
/// <summary>
/// Delete an account.
/// </summary>
/// <param name="id">Account ID to delete</param>
/// <returns>204 No Content on success</returns>
/// <response code="204">Account deleted successfully</response>
/// <response code="404">Account not found or not authorized</response>
/// <response code="401">User not authenticated</response>
[HttpDelete("{id:guid}")]
[ProducesResponseType(StatusCodes.Status204NoContent)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public async Task<IActionResult> Delete(Guid id)
{
    var userId = GetCurrentUserId();

    var account = await _context.Accounts
        .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

    if (account == null)
    {
        return NotFound();
    }

    _context.Accounts.Remove(account);
    await _context.SaveChangesAsync();

    _logger.LogInformation(
        "Account {AccountId} deleted by user {UserId}",
        id,
        userId
    );

    return NoContent();
}
```

### Database Transaction

Entity Framework Core's `SaveChangesAsync()` wraps the delete in a transaction automatically. Cascade deletes for `AccountRiskSettings` are handled by the database if configured correctly in `AccountConfiguration.cs`.

**Ensure EF Core configuration includes**:

```csharp
builder.HasOne(a => a.RiskSettings)
    .WithOne(rs => rs.Account)
    .HasForeignKey<AccountRiskSettings>(rs => rs.AccountId)
    .OnDelete(DeleteBehavior.Cascade); // Important!
```

---

## Testing

### Unit Test Cases

1. ✅ Delete own account → 204 No Content
2. ✅ Delete non-existent account → 404 Not Found
3. ✅ Delete another user's account → 404 Not Found
4. ✅ Delete with invalid GUID → 400 Bad Request
5. ✅ Delete without authentication → 401 Unauthorized
6. ✅ Delete account with risk settings → 204, cascade deletes risk settings

### Integration Test Example

```csharp
[Fact]
public async Task Delete_OwnAccount_Returns204NoContent()
{
    // Arrange
    var userId = Guid.NewGuid();
    var account = CreateTestAccount(userId);
    await _context.Accounts.AddAsync(account);
    await _context.SaveChangesAsync();

    // Act
    var response = await _client.DeleteAsync($"/api/accounts/{account.Id}");

    // Assert
    Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    var deletedAccount = await _context.Accounts.FindAsync(account.Id);
    Assert.Null(deletedAccount);
}
```

---

## Frontend Integration

### API Service Method

```typescript
// libs/accounts/src/data-access/src/lib/services/accounts-api.service.ts
deleteAccount(id: string): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/accounts/${id}`);
}
```

### Store Method

```typescript
// libs/accounts/src/data-access/src/lib/store/accounts.store.ts
deleteAccount: rxMethod<string>(
  pipe(
    switchMap((id) =>
      inject(AccountsApiService)
        .deleteAccount(id)
        .pipe(
          tapResponse({
            next: () => {
              patchState(store, (state) => ({
                entities: state.entities.filter((a) => a.id !== id),
              }));
              inject(MessageService).add({
                severity: 'success',
                summary: 'Success',
                detail: 'Account deleted successfully',
              });
            },
            error: (error: HttpErrorResponse) => {
              inject(MessageService).add({
                severity: 'error',
                summary: 'Error',
                detail: error.error?.message || 'Failed to delete account',
              });
            },
          }),
        ),
    ),
  ),
);
```

### Component Usage

```typescript
// libs/accounts/src/lib/accounts/accounts-shell/accounts-shell.component.ts
onDeleteAccount(id: string) {
  this.confirmationService.confirm({
    message: 'Are you sure you want to delete this account?',
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      this.accountsStore.deleteAccount(id);
    }
  });
}
```

---

## Changelog

| Version | Date       | Changes                               |
| ------- | ---------- | ------------------------------------- |
| 1.0     | 2026-02-20 | Initial DELETE endpoint specification |

---

## References

- HTTP DELETE method: [RFC 7231 Section 4.3.5](https://tools.ietf.org/html/rfc7231#section-4.3.5)
- HTTP 204 No Content: [RFC 7231 Section 6.3.5](https://tools.ietf.org/html/rfc7231#section-6.3.5)
- Problem Details: [RFC 7807](https://tools.ietf.org/html/rfc7807)

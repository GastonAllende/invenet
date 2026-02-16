# Feature Spec: Trades Table with Pagination

## Problem

Users need to view their trading history in an organized, searchable, and paginated format. Currently, the trades page shows only placeholder content with no ability to review past trades, filter results, or analyze trading patterns.

## Goals

- Display trade history in a sortable, paginated table
- Enable users to view key trade details (symbol, type, quantity, price, total, date, status)
- Provide visual indicators for trade types (BUY/SELL) and status (COMPLETED/PENDING/CANCELLED)
- Support pagination for large datasets (10 rows per page default, configurable)
- Lay foundation for future features (filtering, search, export)

## Non-goals

- Real-time trade updates or live data feeds
- Trade creation/editing functionality (placeholder button only)
- Advanced filtering or search capabilities
- Backend API integration (using sample data for now)
- Trade detail drill-down or modal views
- Export functionality

## User/API Behavior

### UI Behavior

- Table displays on `/trades` route
- Default view: 10 trades per page, sorted by ID descending (newest first)
- Users can:
  - Sort by any column (click column header)
  - Change rows per page (5, 10, 20, 50 options)
  - Navigate pages using pagination controls
  - See visual badges for trade type and status
- Table shows loading state during data fetch
- Empty state displayed when no trades exist

### Visual Design

- BUY trades: green badge
- SELL trades: red badge
- COMPLETED status: green badge
- PENDING status: yellow/warning badge
- CANCELLED status: red/danger badge
- Currency formatted with $ symbol and 2 decimals
- Dates formatted in short format (MM/DD/YY, HH:MM AM/PM)

### Error States

- Currently none (using sample data)
- Future: API error handling with user-friendly messages

## Technical Design

### Frontend

- **Component**: `libs/trades/src/lib/trades/trades.ts`
- **Dependencies**: PrimeNG TableModule, ButtonModule, TagModule, CardModule
- **State Management**: Angular signals for reactive data
  - `trades` signal: Trade[]
  - `loading` signal: boolean
- **Data Model**: Trade interface
  ```typescript
  interface Trade {
    id: number;
    symbol: string;
    type: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    total: number;
    date: Date;
    status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  }
  ```
- **Sample Data**: 12 mock trades for demonstration

### Backend

- Not implemented in this phase
- Future: GET /api/trades endpoint with pagination params

### Data/Migrations

- None (frontend-only feature)

## Affected Projects/Files

- `libs/trades/src/lib/trades/trades.ts` - Component logic, interface, sample data
- `libs/trades/src/lib/trades/trades.html` - Table template with PrimeNG components
- `libs/trades/src/lib/trades/trades.css` - Styling for container and card
- `libs/trades/src/index.ts` - Export Trade interface for reuse
- `apps/invenet/src/app/app.routes.ts` - Already configured (no changes needed)

## Acceptance Criteria

1. ✅ Trade table displays on `/trades` route with sample data
2. ✅ Table shows all required columns: ID, Symbol, Type, Quantity, Price, Total, Date, Status
3. ✅ Pagination controls allow 5, 10, 20, or 50 rows per page
4. ✅ Default pagination setting is 10 rows per page
5. ✅ All columns are sortable (ascending/descending)
6. ✅ Trade type displays as colored badge (BUY=green, SELL=red)
7. ✅ Status displays as colored badge (COMPLETED=green, PENDING=yellow, CANCELLED=red)
8. ✅ Currency values formatted with $ symbol
9. ✅ Dates formatted in readable short format
10. ✅ Empty state message displays when no trades exist
11. ✅ Loading state displays during data fetch
12. ✅ "New Trade" button visible (non-functional placeholder for future)

## Test Plan

### Unit

- Trade interface validation
- Component initialization loads sample data
- Loading state toggles correctly
- `getStatusSeverity()` returns correct severity for each status
- `getTypeSeverity()` returns correct severity for BUY/SELL

### Integration

- Table renders with correct data
- Pagination controls work correctly
- Sorting works on all columns
- Badges display with correct colors
- Currency and date pipes format correctly

### E2E

- Navigate to `/trades` route
- Verify table displays with sample data
- Test pagination controls
- Test sorting on multiple columns
- Verify visual appearance of badges
- Change rows per page setting
- Verify current page report displays correctly

## Risks

- **Sample Data Only**: Feature currently uses hardcoded sample data; needs backend integration for production use
- **No Error Handling**: Missing error states for API failures (mitigated by using local data)
- **Performance**: Large datasets may impact performance without server-side pagination (mitigated by pagination limits)
- **No Persistence**: Pagination/sort preferences not saved (acceptable for v1)

## Rollback Plan

Not applicable - frontend-only feature with no backend dependencies or data migrations. If issues arise, revert component changes in `libs/trades`.

## Future Enhancements

- Connect to real backend API
- Add search/filter functionality
- Trade detail view (modal or separate page)
- Export to CSV/Excel
- Real-time updates via WebSocket
- Advanced analytics (P&L, win rate, etc.)
- Bulk actions (cancel multiple pending trades)

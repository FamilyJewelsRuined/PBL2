# UKT Category History Feature

## Overview

The UKT Category History feature allows administrators to track and manage changes in student UKT (University Tuition Fee) categories over time. This feature provides a complete audit trail of category modifications, ensuring data integrity and accountability.

## Features

### 🎯 Core Functionality
- **View History**: Display all UKT category changes in a data grid
- **Add Records**: Create new history entries for category changes
- **Delete Records**: Remove history entries (with confirmation)
- **Search & Filter**: Advanced filtering by student, category, and date
- **Responsive Design**: Works on desktop and mobile devices

### 🔍 Search & Filter Capabilities
- **Global Search**: Search across NIM, student name, and category name
- **NIM Filter**: Filter by specific student NIM
- **Category Filter**: Filter by specific UKT category
- **Reset Filters**: Clear all active filters with one click

### 📊 Data Display
- **ID Riwayat**: Unique identifier for each history record
- **NIM**: Student identification number
- **Nama Mahasiswa**: Student name (resolved from NIM)
- **ID Kategori**: UKT category identifier
- **Nama Kategori**: UKT category name (resolved from ID)
- **Tanggal Perubahan**: Date of category change (formatted in Indonesian)
- **Actions**: Delete functionality for each record

## Database Schema

### Table: `riwayat_kategori_ukt`

```sql
CREATE TABLE riwayat_kategori_ukt (
    id_riwayat INT PRIMARY KEY AUTO_INCREMENT,
    nim VARCHAR(15) NOT NULL,
    id_kategori_ukt INT NOT NULL,
    tanggal_perubahan DATE NOT NULL,
    FOREIGN KEY (nim) REFERENCES mahasiswa(nim),
    FOREIGN KEY (id_kategori_ukt) REFERENCES kategori_ukt(id_kategori_ukt)
);
```

## API Endpoints

The feature expects the following backend API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/riwayat-kategori-ukt` | Get all history records |
| GET | `/api/riwayat-kategori-ukt/{id}` | Get specific record |
| GET | `/api/riwayat-kategori-ukt/nim/{nim}` | Get records by student NIM |
| POST | `/api/riwayat-kategori-ukt` | Create new record |
| PUT | `/api/riwayat-kategori-ukt/{id}` | Update record |
| DELETE | `/api/riwayat-kategori-ukt/{id}` | Delete record |
| GET | `/api/riwayat-kategori-ukt/date-range` | Get records by date range |

## File Structure

```
src/
├── pages/
│   └── UKTCategoryHistory.jsx          # Main component
├── services/
│   └── uktCategoryHistory.ts           # API service layer
└── components/
    └── Layout.jsx                      # Updated with navigation
```

## Installation & Setup

1. **Add the component to your routes** (already done in `App.jsx`):
```jsx
import UKTCategoryHistory from './pages/UKTCategoryHistory';

// Add route
<Route path="/ukt-category-history" element={<UKTCategoryHistory />} />
```

2. **Update navigation** (already done in `Layout.jsx`):
```jsx
{ text: 'UKT Category History', icon: <TimelineIcon />, path: '/ukt-category-history' }
```

3. **Ensure backend API endpoints are implemented** according to the schema above.

## Usage Guide

### Adding a New History Record

1. Navigate to "UKT Category History" in the sidebar
2. Click "Tambah Riwayat" button
3. Select a student from the dropdown
4. Select a UKT category from the dropdown
5. Choose the date of change
6. Click "Tambah" to save

### Searching and Filtering

1. **Global Search**: Use the search box to find records by NIM, student name, or category
2. **NIM Filter**: Select a specific student from the NIM dropdown
3. **Category Filter**: Select a specific category from the category dropdown
4. **Reset**: Click "Reset Filter" to clear all filters

### Deleting Records

1. Find the record you want to delete
2. Click the "Hapus" button in the Actions column
3. Confirm the deletion in the popup dialog

## Technical Implementation

### State Management
- Uses React Query for server state management
- Local state for form data, filters, and UI state
- Optimistic updates for better UX

### Error Handling
- Comprehensive error handling for API calls
- User-friendly error messages in Indonesian
- Success notifications for completed actions

### Performance
- Efficient filtering and search algorithms
- Pagination support in the data grid
- Optimized re-renders with proper dependency arrays

## Dependencies

- **@mui/material**: UI components and styling
- **@mui/x-data-grid**: Data grid for displaying records
- **@tanstack/react-query**: Server state management
- **@mui/icons-material**: Icons for the interface

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Future Enhancements

Potential improvements for future versions:

1. **Export Functionality**: Export history data to Excel/PDF
2. **Bulk Operations**: Select multiple records for bulk actions
3. **Advanced Filtering**: Date range filters and more complex queries
4. **Audit Logging**: Track who made changes to the history
5. **Notifications**: Real-time notifications for new category changes
6. **Analytics Dashboard**: Charts and graphs showing change patterns

## Troubleshooting

### Common Issues

1. **API Connection Errors**: Check if the backend API is running and accessible
2. **Authentication Issues**: Ensure the user is logged in with valid credentials
3. **Data Not Loading**: Verify that the API endpoints are correctly implemented
4. **Filter Not Working**: Check if the filter values match the data format

### Debug Mode

Enable debug logging by checking the browser console for detailed error messages and API responses.

## Contributing

When contributing to this feature:

1. Follow the existing code style and patterns
2. Add proper error handling for new functionality
3. Update the documentation for any changes
4. Test thoroughly before submitting changes

## License

This feature is part of the SIMPADU system and follows the same licensing terms.

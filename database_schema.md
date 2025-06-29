# Database Schema Documentation

## Table: riwayat_kategori_ukt

This table stores the history of UKT category changes for students.

### Structure

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id_riwayat` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the history record |
| `nim` | VARCHAR(15) | NOT NULL, FOREIGN KEY | Student NIM (references mahasiswa.nim) |
| `id_kategori_ukt` | INT | NOT NULL, FOREIGN KEY | UKT category ID (references kategori_ukt.id_kategori_ukt) |
| `tanggal_perubahan` | DATE | NOT NULL | Date when the category change occurred |

### Foreign Key Relationships

- `nim` → `mahasiswa.nim` (Student table)
- `id_kategori_ukt` → `kategori_ukt.id_kategori_ukt` (UKT Categories table)

### Sample Data

```sql
INSERT INTO riwayat_kategori_ukt (nim, id_kategori_ukt, tanggal_perubahan) VALUES
('2021001', 1, '2024-01-15'),
('2021002', 2, '2024-01-16'),
('2021003', 1, '2024-01-17');
```

### API Endpoints

The following API endpoints are expected to be implemented on the backend:

- `GET /api/riwayat-kategori-ukt` - Get all UKT category history
- `GET /api/riwayat-kategori-ukt/{id}` - Get specific history record
- `GET /api/riwayat-kategori-ukt/nim/{nim}` - Get history by student NIM
- `POST /api/riwayat-kategori-ukt` - Create new history record
- `PUT /api/riwayat-kategori-ukt/{id}` - Update history record
- `DELETE /api/riwayat-kategori-ukt/{id}` - Delete history record
- `GET /api/riwayat-kategori-ukt/date-range` - Get history by date range

### Frontend Implementation

The frontend implementation includes:

1. **UKTCategoryHistory.jsx** - Main page component for managing UKT category history
2. **uktCategoryHistory.ts** - Service layer for API communication
3. **Navigation** - Added to the main navigation menu
4. **Features**:
   - View all UKT category history
   - Add new history records
   - Delete history records
   - Search and filter functionality
   - Responsive design with Material-UI

### Usage

This feature allows administrators to:
- Track changes in student UKT categories over time
- Maintain an audit trail of category modifications
- Generate reports on category change patterns
- Ensure data integrity and accountability 
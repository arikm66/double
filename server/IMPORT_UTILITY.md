# Noun Import Utility

## Overview
This utility allows administrators to bulk import nouns from a JSON file into the database.

## How It Works
1. Parses a JSON file containing nouns
2. For each noun:
   - Checks if a noun with the same `nameEn` already exists (skips if exists)
   - Looks up the category in the categories database by `categoryHe`
   - If category found: uses the existing category's ObjectId
   - If category not found: automatically creates a new category with the given name
   - If no category provided in JSON: ignores the noun (validation error)
   - Creates the noun with the category's ObjectId
3. Generates a detailed log file saved in the server root directory

## API Endpoint
**POST** `/api/import/nouns`

**Authentication:** Admin access required (JWT token)

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
[
  {
    "nameEn": "apple",
    "nameHe": "תפוח",
    "categoryHe": "פירות",
    "imageUrl": "https://example.com/apple.jpg"
  },
  {
    "nameEn": "banana",
    "nameHe": "בננה",
    "categoryHe": "פירות"
  }
]
```

**Fields:**
- `nameEn` (required): English name of the noun
- `nameHe` (required): Hebrew name of the noun
- `categoryHe` (required): Hebrew category name (will be created if it doesn't exist)
- `imageUrl` (optional): URL to the noun's image

## Response
```json
{
  "message": "Import completed",
  "logFile": "import-log-2026-02-09_14-30-45.txt",
  "stats": {
    "total": 100,
    "imported": 85,
    "skipped": 10,
    "categoriesCreated": 3,
    "errors": 2
  },
  "duration": "2.45s"
}
```

## Log File
A log file is created for each import with the filename format:
```
import-log-YYYY-MM-DD_HH-MM-SS.txt
```

The log includes:
- Start and end timestamps
- Processing details for each noun
- Skip/import/error reasons
- Summary statistics
- Total duration

## Usage Example

### Using cURL:
```bash
curl -X POST http://localhost:5000/api/import/nouns \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d @sample-import.json
```

### Using Postman:
1. Set method to POST
2. URL: `http://localhost:5000/api/import/nouns`
3. Headers:
   - `Authorization`: `Bearer YOUR_ADMIN_TOKEN`
   - `Content-Type`: `application/json`
4. Body (raw JSON):
   - Paste the contents of your JSON file

### Using JavaScript/Fetch:
```javascript
const importNouns = async (nounsData, token) => {
  const response = await fetch('http://localhost:5000/api/import/nouns', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nouns: nounsData })
  });
  
  const result = await response.json();
  console.log(result);
};
```

## Important Notes

1. **Admin Only**: Only users with admin role can access this endpoint
2. **Duplicate Check**: Uses `nameEn` to check for existing nouns
3. **Auto-Category Creation**: Categories are automatically created if they don't exist
4. **Category Lookup**: Matches against `categoryHe` field in categories collection
5. **Direct Array Format**: Send nouns as a direct JSON array, not wrapped in an object
6. **Atomicity**: Each noun is processed independently - partial imports are possible
7. **Log Persistence**: Log files are saved even if the import process fails

## Sample Data
See `sample-import.json` for an example of the expected JSON format.

## Error Handling
- Missing required fields (including categoryHe): Logged as error and skipped
- Category not found: Automatically creates new category and continues
- Duplicate nouns: Logged and skipped
- Other errors: Logged with error message

## Security
- Requires valid JWT token
- Requires admin role
- No file upload vulnerabilities (uses request body)

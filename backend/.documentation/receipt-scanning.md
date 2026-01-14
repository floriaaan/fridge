# Receipt Scanning Feature

## Overview

The receipt scanning feature allows users to photograph their grocery receipts and automatically extract products using AI-powered OCR. This significantly reduces the time needed to add multiple products to the fridge inventory.

## Architecture

### Backend Components

#### 1. OCR Service (`src/application/services/ocr.service.ts`)

The OCR service is responsible for extracting data from receipt images and enriching the products with additional information.

**Key Methods:**
- `extractReceiptData(imageBase64: string): Promise<ReceiptData>` - Uses multimodal LLM to extract receipt data
- `enhanceWithOpenFoodFacts(items: RawReceiptItem[]): Promise<EnhancedProduct[]>` - Enriches products with Open Food Facts data
- `detectStore(text: string): Promise<StoreInfo>` - Detects the store name from receipt text

**Extracted Data:**
- Store name
- Purchase date
- List of items (name, quantity, price, unit)
- Total amount

#### 2. AI Providers (`src/infrastructure/ai/`)

Extended to support multimodal image analysis:
- **Gemini**: Uses Google's Gemini Vision API
- **OpenAI**: Uses GPT-4 Vision API
- **Ollama**: Uses local vision-capable models

All providers implement the `parseReceiptImage` method that takes a base64-encoded image and returns structured receipt data.

#### 3. Open Food Facts Service (`src/application/services/openfoodfacts.service.ts`)

Enriches extracted products with:
- Product categories
- Estimated expiry dates based on category
- Product images
- Confidence scores for matches

**Category-based expiry estimates:**
- Meat: 3 days
- Dairy: 7 days
- Vegetables/Fruits: 7 days
- Bread: 5 days
- Frozen: 90 days
- Pantry: 180 days
- Other: 30 days

#### 4. Database Schema

**Receipt Table:**
```sql
CREATE TABLE receipt (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  scanned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  total_amount NUMERIC(10, 2) NOT NULL,
  image_url TEXT,
  ocr_raw_data JSONB,
  items_count INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Product Table Updates:**
- Added `receipt_id` foreign key (nullable)
- Added `price` field for expense tracking

#### 5. API Endpoints

**POST `/api/receipt/scan`**
- Scans a receipt image and returns extracted products
- Request: `{ imageBase64: string }`
- Response: `{ storeName, date, totalAmount, items: EnhancedProduct[] }`

**POST `/api/receipt/import`**
- Imports confirmed products into the database
- Request: `{ storeName, totalAmount, date, items: ImportReceiptItem[], imageUrl?, ocrRawData? }`
- Response: `{ receipt, products }`

**GET `/api/receipt/history`**
- Returns list of previously scanned receipts
- Response: `Receipt[]`

### Mobile Components

#### 1. Receipt Scan Screen (`mobile/app/receipt/scan.tsx`)

Camera interface for capturing receipt photos:
- Uses `expo-camera` for camera access
- Shows framing overlay to guide user
- Displays tips for better scanning results
- Captures photo and passes to confirmation screen

**Features:**
- Camera permission handling
- Photo capture with quality optimization (0.8 quality)
- Base64 encoding for API transmission
- Visual feedback and loading states

#### 2. Receipt Confirmation Screen (`mobile/app/receipt/confirm.tsx`)

Product review and editing interface:
- Displays extracted products with checkboxes
- Shows confidence indicators (high/medium/low)
- Allows location selection per product (fridge, freezer, pantry)
- Displays estimated expiry dates
- Batch import of selected products

**User Actions:**
- Toggle product inclusion with checkboxes
- Edit location for each product
- Review and adjust before import
- Retry scan if results are incorrect

#### 3. Receipt API Client (`mobile/src/lib/api/receipt.ts`)

TypeScript client for receipt API:
- `scanReceipt(imageBase64: string)` - Scan receipt image
- `importReceipt(input: ImportReceiptInput)` - Import products
- `getReceiptHistory()` - Fetch receipt history

## Usage Flow

1. **User taps "Scan ticket" button** on main screen
2. **Camera screen opens** with framing guide and tips
3. **User takes photo** of receipt
4. **Image is sent to backend** for OCR processing
5. **AI extracts** store name, date, items, and prices
6. **Products are enriched** with Open Food Facts data
7. **Confirmation screen** shows extracted products
8. **User reviews/edits** products and locations
9. **User taps "Validate"** to import selected products
10. **Products are created** in database linked to receipt
11. **User returns** to main screen with new products

## Error Handling

### Backend
- Invalid image data → 400 Bad Request
- AI processing failure → 500 with error message
- Open Food Facts API failure → Gracefully degrades, products added without enrichment

### Mobile
- Camera permission denied → Show permission request screen
- Blurry/unreadable image → Display error with retry option
- No products detected → Show error and suggest retake
- Network error → Display error alert with retry option

## Configuration

### Backend Environment Variables
```env
# AI Provider (gemini, openai, or ollama)
AI_PROVIDER=gemini

# API Keys (only required for selected provider)
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash

OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:4b

# User preferences
USER_LANGUAGE=fr
```

### Mobile Configuration
- API base URL in `mobile/src/lib/api-config.ts`
- Camera permissions in `app.json`

## Best Practices

### For Users
- Place receipt on flat surface
- Ensure good lighting
- Avoid shadows and reflections
- Make sure text is readable
- Keep receipt unfolded and unwrinkled

### For Developers
- Always handle camera permissions gracefully
- Compress images before transmission (quality: 0.8)
- Implement proper error recovery
- Show progress indicators during processing
- Provide clear user feedback
- Log errors for debugging

## Future Enhancements

1. **Image Storage**
   - Store receipt images in Cloudinary/S3
   - Auto-delete after 30 days (RGPD compliance)

2. **Expense Tracking**
   - Monthly spending reports
   - Category-based analytics
   - Price trend tracking

3. **Improved OCR**
   - Fallback to Tesseract.js for offline mode
   - Support for more receipt formats
   - Multi-language receipt support

4. **First-time Tutorial**
   - Slideshow with tips
   - Best practices for scanning
   - Example receipt walkthrough

5. **Gallery Import**
   - Add expo-image-picker
   - Support photo selection from gallery
   - Batch processing of multiple receipts

## Troubleshooting

### Receipt not scanning correctly
- Ensure AI provider is properly configured
- Check API keys are valid
- Verify model supports vision (e.g., GPT-4 Vision)
- Check network connectivity
- Review backend logs for errors

### Products not enriched
- Verify Open Food Facts API is accessible
- Check product names are in correct language
- Review OCR confidence scores
- Manual category selection available as fallback

### Database migration not applied
- Run `npm run db:generate` in backend directory
- Apply migration with your migration tool
- Verify database connection

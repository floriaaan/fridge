# 🧾 Receipt Scanning Feature

Automatically add multiple products to your fridge by scanning grocery receipts!

## ✨ Features

- 📸 **Camera-based scanning** - Point and shoot your receipt
- 🤖 **AI-powered OCR** - Extracts products, prices, and details automatically
- 🏪 **Store detection** - Identifies which store the receipt is from
- 🗓️ **Expiry estimation** - Automatically calculates expiration dates
- ✅ **Review & Edit** - Confirm or adjust detected products before import
- 💰 **Expense tracking** - Keeps history of your grocery spending

## 🚀 Quick Start

### Prerequisites

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

2. **Configure AI Provider** (choose one):
   
   Edit `backend/.env`:
   ```env
   # Option 1: Google Gemini (recommended)
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-2.5-flash
   
   # Option 2: OpenAI
   AI_PROVIDER=openai
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-4o-mini
   
   # Option 3: Local Ollama
   AI_PROVIDER=ollama
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llava:latest  # or another vision-capable model
   ```

3. **Run Database Migration**
   ```bash
   cd backend
   npm run db:generate
   # Then apply the migration using your database tool
   ```

4. **Start the Backend**
   ```bash
   npm run dev
   ```

5. **Mobile Setup**
   ```bash
   cd mobile
   npm install
   npx expo start
   ```

## 📱 How to Use

1. **Open the app** and navigate to the main fridge screen
2. **Tap "Scan ticket"** button (green button at the bottom)
3. **Point your camera** at the receipt
   - Make sure the receipt is flat and well-lit
   - Avoid shadows and reflections
   - Keep text readable
4. **Take the photo** using the capture button
5. **Wait for processing** (5-10 seconds)
6. **Review extracted products**:
   - ✅ Check/uncheck items to include
   - 📍 Set location (fridge, freezer, pantry)
   - ⚠️ Review items marked as "uncertain"
7. **Tap "Validate"** to import selected products
8. **Done!** Products are now in your fridge

## 💡 Tips for Best Results

- ✨ Place receipt on a flat, contrasting surface
- 💡 Use good lighting (natural light works best)
- 📏 Capture the entire receipt in frame
- 🔍 Ensure text is sharp and readable
- 📱 Hold phone steady when capturing

## 🛠️ Supported AI Providers

### Gemini (Recommended)
- ✅ Fast and accurate
- ✅ Good with various receipt formats
- ✅ Affordable pricing
- 🔗 Get API key: https://makersuite.google.com/app/apikey

### OpenAI (GPT-4 Vision)
- ✅ Very accurate
- ✅ Handles complex receipts
- ⚠️ More expensive
- 🔗 Get API key: https://platform.openai.com/api-keys

### Ollama (Local)
- ✅ Free and private
- ✅ No internet required
- ⚠️ Requires vision-capable model (llava, bakllava)
- ⚠️ Slower than cloud options
- 🔗 Install: https://ollama.ai/

## 🗂️ API Endpoints

### `POST /api/receipt/scan`
Scan a receipt image and extract products.

**Request:**
```json
{
  "imageBase64": "base64_encoded_image"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "storeName": "Carrefour",
    "date": "2026-01-14T00:00:00.000Z",
    "totalAmount": 42.50,
    "items": [
      {
        "name": "Lait demi-écrémé",
        "quantity": 1,
        "unit": "L",
        "price": 2.50,
        "category": "dairy",
        "confidence": "high",
        "estimatedExpiryDays": 7,
        "openfoodfactId": "3274080005003"
      }
    ]
  }
}
```

### `POST /api/receipt/import`
Import confirmed products into the database.

**Request:**
```json
{
  "storeName": "Carrefour",
  "totalAmount": 42.50,
  "date": "2026-01-14",
  "items": [
    {
      "name": "Lait demi-écrémé",
      "quantity": 1,
      "unit": "L",
      "price": 2.50,
      "category": "dairy",
      "location": "frigo",
      "estimatedExpiryDays": 7
    }
  ]
}
```

### `GET /api/receipt/history`
Get history of scanned receipts.

## 🔧 Troubleshooting

### Receipt not detected
- ✅ Check that AI provider is properly configured
- ✅ Verify API keys are valid
- ✅ Ensure model supports vision (Gemini Flash, GPT-4 Vision, etc.)
- ✅ Try retaking the photo with better lighting

### Products not enriched
- ✅ Check internet connection (for Open Food Facts)
- ✅ Product names might not be in database
- ✅ Manual adjustments available on confirmation screen

### Camera not working
- ✅ Grant camera permissions when prompted
- ✅ Check device camera is functional
- ✅ Restart the app

## 📚 Documentation

For detailed technical documentation, see:
- [Backend Documentation](./backend/.documentation/receipt-scanning.md)
- [API Reference](./backend/README.md)

## 🤝 Contributing

Found a bug or have a suggestion? Please open an issue!

## 📄 License

See the main repository license.

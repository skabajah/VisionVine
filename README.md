# VisionVine

**AI-Powered Alcohol Label Verification**

---

## Overview

VisionVine is a web application that uses AI (Groq's Qwen 3.6-27b vision model) to extract and validate information from alcohol beverage labels. It is designed to assist TTB compliance agents in verifying that labels meet regulatory requirements.

---

## Features

- Upload 1–3 label images (drag & drop or click to browse)
- AI-powered text extraction (brand name, class/type, ABV, net contents, government warning)
- Automatic beverage type detection (spirits, wine, beer)
- Validation of required fields
- Government Warning header check (must be in ALL CAPS)
- Pass/Fail results with field-by-field status
- Clean, modern user interface with Material Icons
- Responsive design for desktop and mobile

---

## Tech Stack

| **Component** | **Technology** |
|---------------|----------------|
| Backend | Python + FastAPI |
| AI/OCR | Groq API (Qwen 3.6-27b) |
| Frontend | HTML + CSS + JavaScript |
| Icons | Google Material Icons |
| Hosting | Render (or local development) |

---

## Project Structure

```
VisionVine/
├── main.py              # FastAPI backend
├── requirements.txt     # Python dependencies
├── static/
│   ├── index.html       # Frontend page
│   ├── style.css        # Styling
│   ├── app.js           # Frontend logic
│   └── cleaner.js       # Data cleaning & validation
└── README.md            # This file
```

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/skabajah/VisionVine.git
cd VisionVine
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Up Environment Variables

Create a `.env` file or set the following environment variable:

```bash
export GROQ_API_KEY="your-groq-api-key-here"
```

### 4. Run Locally

```bash
python main.py
```

The app will open automatically at `http://localhost:8000`.

---

## Deployment

The app is deployed on Render:

```
https://visionvine.onrender.com
```

To deploy your own version:

1. Push your code to GitHub
2. Connect your repo to Render
3. Add `GROQ_API_KEY` as an environment variable
4. Deploy

---

## Usage

1. Click the **+** button or drag & drop 1–3 label images
2. Click **Process This**
3. View the verification results on the right panel:
   - Each field shows PASS or FAIL
   - Government Warning must start with "GOVERNMENT WARNING" in ALL CAPS
   - Overall PASS or FAIL decision

---

## Validation Rules

| **Field** | **Rule** |
|-----------|----------|
| Brand Name | Must be present |
| Class/Type | Must be present |
| ABV | Must be present |
| Net Contents | Must be present |
| Government Warning | Must be present and start with "GOVERNMENT WARNING" in ALL CAPS |
| Beverage Type | Must be present (spirits, wine, or beer) |

---

## Assumptions

- Labels are for alcohol beverages (spirits, wine, or beer)
- The label image is clear enough for OCR
- The app is a prototype and does not cover all legal variations
- The Government Warning check only validates the header, not the full text

---

## Limitations

- Supports 1–3 images per product
- Only one image is processed per request (the first uploaded)
- Batch upload is not yet implemented
- Wine and beer labels may have lower OCR accuracy due to decorative fonts

---

## Future Enhancements

- Batch upload support (multiple products at once)
- Form matching (compare label data against application data)
- Support for more beverage types
- Improved fuzzy matching for brand names
- Export results to CSV or PDF

---

## License

This project is for demonstration and educational purposes.

---

## Contact

**Shadi Kabajah**  
skabajah@icloud.com

---

**VisionVine • Prototype for TTB Label Compliance**
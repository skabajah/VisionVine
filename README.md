### 1. Project Title
**VisionVine** – AI-Powered Alcohol Label Verification

---

### 2. Author, Date & Live Demo

- **Author:** Shadi Kabajah  
- **Email:** skabajah@icloud.com  
- **Date:** August 2026  
- **Live Demo:** [https://visionvine.onrender.com](https://visionvine.onrender.com)

---

### 3. Overview
- 2–3 sentences describing what the app does
- Who it's for (TTB compliance agents)
- The core problem it solves (manual label verification)

---

### 4. Features
- Upload **1–3 images per product** (front label, back label, angle shots)
- Supports:
  - **Single label image** (one picture)
  - **Multiple images** (2–3 pictures of the same product)
  - **Combined label** (multiple labels in one image)
- AI-powered text extraction (brand, class/type, ABV, net contents, government warning)
- Automatic beverage type detection (spirits, wine, beer)
- Validation of required fields
- Government Warning header check (must be in ALL CAPS)
- Pass/Fail results with field-by-field status
- Clean, modern UI with Material Icons
- Responsive design for desktop and mobile

---

### 5. Demo Example

The `screenshots/` folder contains:
- **Example results** – Screenshots of the app in action showing PASS and FAIL states
- **Test label images** – Sample label images you can download and use to test the app

| **File** | **Description** |
|----------|-----------------|
| `screenshots/pass-result.png` | Example of a PASS result |
| `screenshots/fail-result.png` | Example of a FAIL result |
| `screenshots/sample-label-1.png` | Sample label image 1 |
| `screenshots/sample-label-2.png` | Sample label image 2 |
| `screenshots/combined-label.png` | Combined label image |

---

### 6. Tech Stack

| **Component** | **Technology** | **Homepage** |
|---------------|----------------|--------------|
| Backend | Python + FastAPI | [fastapi.tiangolo.com](https://fastapi.tiangolo.com) |
| AI / OCR | Groq API (Qwen 3.6-27b) | [console.groq.com](https://console.groq.com) |
| Frontend | HTML + CSS + JavaScript | — |
| Icons | Google Material Icons | [fonts.google.com/icons](https://fonts.google.com/icons) |
| Hosting | Render | [render.com](https://render.com) |

---

### 7. UX Path

1. User lands on the page and sees a clean split-screen layout.
2. On the left panel, the user drags and drops **1–3 images** of an alcohol label (or clicks the + button to browse).
3. The user clicks **"Verify Label"**.
4. The app sends the image(s) to the backend, which calls Groq's vision model to extract:
   - Brand name
   - Class/Type
   - ABV
   - Net contents
   - Government warning
   - Beverage type
5. The extracted data is validated against TTB requirements.
6. Results appear on the right panel with:
   - Field-by-field PASS/FAIL status
   - Government Warning header check (must be in ALL CAPS)
   - Overall PASS or FAIL decision
7. The user can click **"Start Over"** to reset and test another label.

---

### 8. Assumptions
- List of assumptions made during development
- e.g., "Supports 1–3 images per product"
- "Focus on distilled spirits labels"
- "Government Warning check only verifies the header is in ALL CAPS"

---

### 9. Limitations
- What the app does not do
- e.g., "Batch upload for multiple products not yet implemented"
- "No matching against application form data"

---

### 10. Future Enhancements
- Optional stretch goals
- e.g., "Add batch upload support"
- "Support beer and wine labels"

---

### 11. File Structure
- Overview of the project folder structure

```
visionvine/
├── main.py
├── requirements.txt
├── screenshots/
│   ├── pass-result.png
│   ├── fail-result.png
│   ├── sample-label-1.png
│   ├── sample-label-2.png
│   └── combined-label.png
├── static/
│   ├── index.html
│   ├── app.js
│   ├── cleaner.js
│   └── style.css
└── README.md
```

---

### 12. Contact
- **Author:** Shadi Kabajah  
- **Email:** skabajah@icloud.com

 
 
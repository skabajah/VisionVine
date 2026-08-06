from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
import groq
import os
import base64
import json
import re

app = FastAPI()

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Groq client
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
client = groq.Client(api_key=GROQ_API_KEY)

@app.get("/")
async def root():
    print("✅ [1] Serving index.html")
    with open("static/index.html", "r") as f:
        return HTMLResponse(f.read())

@app.post("/process")
async def process_label(file: UploadFile = File(...)):
    print("=" * 50)
    print("📸 [2] Image received by backend")
    
    try:
        print("📖 [3] Reading image file...")
        contents = await file.read()
        print(f"✅ [3] Image read: {len(contents)} bytes")
        
        print("🔐 [4] Converting to base64...")
        base64_image = base64.b64encode(contents).decode("utf-8")
        print(f"✅ [4] Base64 conversion complete: {len(base64_image)} characters")
        
        print("🤖 [5] Calling Groq API...")
        print(f"   [5] Model: qwen/qwen3.6-27b")
        print(f"   [5] API Key set: {bool(GROQ_API_KEY)}")
        
        # ✅ EXACT STRUCTURE FROM YOUR WORKING CURL TEST
        response = client.chat.completions.create(
            model="qwen/qwen3.6-27b",
            messages=[
                {
                    "role": "system",
                    "content": """Extract from this alcohol label:
- Brand name
- Class/Type
- ABV
- Net contents
- Government warning
- Beverage type (distilled_spirit, wine, beer)

Return ONLY valid JSON. No extra text, no explanations, no markdown."""
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ]
        )
        
        print("✅ [5] Groq API call successful")
        
        print("📝 [6] Extracting response content...")
        data = response.choices[0].message.content
        print(f"✅ [6] Raw response received ({len(data)} characters)")
        print(f"📄 [6] Raw response preview: {data[:200]}...")
        
        # Extract JSON from the response
        print("🔍 [7] Extracting JSON from response...")
        json_match = re.search(r'\{.*\}', data, re.DOTALL)
        if json_match:
            clean_data = json_match.group(0)
            print("✅ [7] JSON extracted successfully")
        else:
            print("❌ [7] No JSON found in response")
            raise ValueError("No JSON found in response")
        
        print("🔍 [8] Parsing JSON...")
        parsed = json.loads(clean_data)
        print("✅ [8] JSON parsed successfully")
        
        # Normalize the keys to match your app's field names
        print("🔄 [8] Normalizing field names...")
        key_map = {
            "Brand name": "brand_name",
            "Class/Type": "class_type",
            "ABV": "abv",
            "Net contents": "net_contents",
            "Government warning": "government_warning",
            "Beverage type": "beverage_type"
        }
        normalized = {}
        for key, value in parsed.items():
            if key in key_map:
                normalized[key_map[key]] = value
            else:
                normalized[key] = value
        parsed = normalized
        print("✅ [8] Field names normalized")
        
        print("✅ [9] Validating extracted data...")
        fields = ["brand_name", "class_type", "abv", "net_contents", "government_warning", "beverage_type"]
        results = {}
        all_pass = True
        
        for field in fields:
            val = parsed.get(field, "")
            present = bool(val and val.strip() and val != "Not readable")
            results[field] = {"present": present, "value": val or "Not found"}
            if not present:
                all_pass = False
                print(f"   [9] ⚠️ Missing field: {field}")
        
        if parsed.get("government_warning"):
            warning = parsed["government_warning"]
            results["government_warning"]["all_caps"] = warning == warning.upper()
            if warning != warning.upper():
                all_pass = False
                print("   [9] ⚠️ Government warning not in ALL CAPS")
        
        print(f"✅ [9] Validation complete. Overall: {'PASS' if all_pass else 'FAIL'}")
        print("=" * 50)
        
        return JSONResponse({
            "success": True,
            "extracted": parsed,
            "validation": results,
            "overall_pass": all_pass
        })
        
    except Exception as e:
        print(f"❌ [ERROR] {str(e)}")
        print(f"❌ [ERROR] Error type: {type(e).__name__}")
        print("=" * 50)
        return JSONResponse({
            "success": False,
            "error": str(e)
        })
from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
import groq
import os
import base64
import json

app = FastAPI()

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Groq client
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
client = groq.Client(api_key=GROQ_API_KEY)

@app.get("/")
async def root():
    with open("static/index.html", "r") as f:
        return HTMLResponse(f.read())

@app.post("/process")
async def process_label(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        base64_image = base64.b64encode(contents).decode("utf-8")

        response = client.chat.completions.create(
            model="qwen/qwen3.6-27b",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": """Extract from this alcohol label:
                            - Brand name
                            - Class/Type
                            - ABV
                            - Net contents
                            - Government warning
                            - Beverage type (distilled_spirit, wine, beer)

                            Return as JSON only."""
                        },
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

        data = response.choices[0].message.content
        parsed = json.loads(data)

        fields = ["brand_name", "class_type", "abv", "net_contents", "government_warning", "beverage_type"]
        results = {}
        all_pass = True

        for field in fields:
            val = parsed.get(field, "")
            present = bool(val and val.strip() and val != "Not readable")
            results[field] = {"present": present, "value": val or "Not found"}
            if not present:
                all_pass = False

        if parsed.get("government_warning"):
            warning = parsed["government_warning"]
            results["government_warning"]["all_caps"] = warning == warning.upper()
            if warning != warning.upper():
                all_pass = False

        return JSONResponse({
            "success": True,
            "extracted": parsed,
            "validation": results,
            "overall_pass": all_pass
        })

    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        })
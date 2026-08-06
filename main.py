from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from typing import List
import groq
import os
import base64
import json

app = FastAPI()

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Groq client — uses environment variable on Render
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
client = groq.Client(api_key=GROQ_API_KEY)

@app.get("/")
async def root():
    print("✅ [1] Serving index.html")
    with open("static/index.html", "r") as f:
        return HTMLResponse(f.read())

@app.post("/process")
async def process_label(files: List[UploadFile] = File(...)):
    print("=" * 60)
    print(f"📸 [2] Received {len(files)} image(s)")
    
    try:
        # Build content array with text prompt + all images
        content = [
            {
                "type": "text",
                "text": "Extract from this alcohol label:\\n- Brand name\\n- Class/Type\\n- ABV\\n- Net contents\\n- Government warning (include the full text, including the '\''GOVERNMENT WARNING:'\'' header, if present)\\n- Beverage type (distilled_spirit, wine, beer)\\n\\nIf the label contains multiple images, combine the information from all images.\\nReturn as JSON only."

            }
        ]

        # Process each image
        for idx, file in enumerate(files):
            print(f"📖 [3] Reading image {idx + 1}: {file.filename}")
            contents = await file.read()
            print(f"✅ [3] Image {idx + 1} read: {len(contents)} bytes")
            
            print(f"🔐 [4] Converting image {idx + 1} to base64...")
            base64_image = base64.b64encode(contents).decode("utf-8")
            print(f"✅ [4] Base64 conversion complete: {len(base64_image)} characters")
            
            content.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{base64_image}"
                }
            })

        print(f"🤖 [5] Calling Groq API with {len(files)} image(s)...")
        print(f"   [5] Model: qwen/qwen3.6-27b")
        print(f"   [5] API Key set: {bool(GROQ_API_KEY)}")
        
        response = client.chat.completions.create(
            model="qwen/qwen3.6-27b",
            messages=[
                {
                    "role": "system",
                    "content": "Extract from this alcohol label:\n- Brand name\n- Class/Type\n- ABV\n- Net contents\n- Government warning\n- Beverage type (distilled_spirit, wine, beer)\n\nReturn as JSON only."
                },
                {
                    "role": "user",
                    "content": content
                }
            ]
        )
        
        print("✅ [5] Groq API call successful")
        
        print("📝 [6] Extracting response content...")
        data = response.choices[0].message.content
        print(f"✅ [6] Raw response received ({len(data)} characters)")
        print("\n" + "=" * 60)
        print("📄 [6] FULL RAW RESPONSE FROM GROQ:")
        print("=" * 60)
        print(data)
        print("=" * 60 + "\n")
        
        return JSONResponse({
            "success": True,
            "raw_response": data
        })
        
    except Exception as e:
        print(f"❌ [ERROR] {str(e)}")
        print(f"❌ [ERROR] Error type: {type(e).__name__}")
        print("=" * 60)
        return JSONResponse({
            "success": False,
            "error": str(e)
        })


@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "VisionVine is running"}
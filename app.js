// ============================================
// VisionVine – Frontend Logic
// ============================================

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxBwcgwD3p6tseMBQBFdK6ulyOyfVLD9qMD77N6oXEVRDlJLMyPuFMFcf1FYJ_69leRgw/exec";

const CORS_PROXY = "https://api.allorigins.win/raw?url=";

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const browseBtn = document.getElementById("browseBtn");
const thumbnails = document.getElementById("thumbnails");
const processBtn = document.getElementById("processBtn");
const statusMsg = document.getElementById("statusMessage");
const resultsContainer = document.getElementById("resultsContainer");

let uploadedFiles = [];

// ===== Click to browse =====
browseBtn.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("click", () => fileInput.click());

// ===== File selection =====
fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
});

// ===== Drag and drop =====
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
});

// ===== Handle uploaded files =====
function handleFiles(files) {
    if (uploadedFiles.length + files.length > 3) {
        statusMsg.textContent = "⚠️ Maximum 3 images allowed.";
        return;
    }

    files.forEach((file) => {
        if (!file.type.startsWith("image/")) {
            statusMsg.textContent = "⚠️ Only image files are allowed.";
            return;
        }
        uploadedFiles.push(file);
        displayThumbnail(file);
    });

    statusMsg.textContent = `✅ ${uploadedFiles.length} image(s) loaded.`;
    processBtn.disabled = false;
}

// ===== Display thumbnail =====
function displayThumbnail(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        thumbnails.appendChild(img);
    };
    reader.readAsDataURL(file);
}

// ===== Process button =====
processBtn.addEventListener("click", async () => {
    if (uploadedFiles.length === 0) {
        statusMsg.textContent = "⚠️ Please upload at least one image.";
        return;
    }

    processBtn.disabled = true;
    processBtn.textContent = "⏳ Processing...";
    statusMsg.textContent = "⏳ Sending to AI...";
    resultsContainer.innerHTML = `<p class="placeholder">⏳ Waiting for results...</p>`;

    try {
        // Convert images to base64
        const imageData = await Promise.all(
            uploadedFiles.map((file) => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
            })
        );

        // Send to AppScript via CORS proxy
        const targetUrl = encodeURIComponent(APPS_SCRIPT_URL);
        const response = await fetch(CORS_PROXY + targetUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ images: imageData })
        });

        const data = await response.json();

        if (data.success) {
            displayResults(data);
            statusMsg.textContent = "✅ Processing complete.";
        } else {
            statusMsg.textContent = "❌ Error: " + (data.error || "Unknown error");
            resultsContainer.innerHTML = `<p class="placeholder">❌ ${data.error || "Unknown error"}</p>`;
        }

    } catch (error) {
        console.error("Fetch error:", error);
        statusMsg.textContent = "❌ Error: " + error.message;
        resultsContainer.innerHTML = `<p class="placeholder">❌ Failed to connect to backend. Please try again.</p>`;
    } finally {
        processBtn.disabled = false;
        processBtn.textContent = "🚀 PROCESS THIS";
    }
});

// ===== Display results =====
function displayResults(data) {
    if (!data.success) {
        resultsContainer.innerHTML = `<p class="placeholder">❌ Error: ${data.error || "Unknown error"}</p>`;
        return;
    }

    const validation = data.validation;
    const overall = data.overall_pass;

    let html = "";

    const fields = [
        { key: "brand_name", label: "Brand Name" },
        { key: "class_type", label: "Class / Type" },
        { key: "beverage_type", label: "Beverage Type" },
        { key: "abv", label: "ABV" },
        { key: "net_contents", label: "Net Contents" },
        { key: "government_warning", label: "Government Warning" }
    ];

    for (const field of fields) {
        const result = validation[field.key];
        if (!result) continue;

        const present = result.present;
        const value = result.value || "Not found";
        const extra = field.key === "government_warning" && result.all_caps !== undefined
            ? (result.all_caps ? " ✅ ALL CAPS" : " ❌ Not ALL CAPS")
            : "";

        html += `
            <div class="result-item">
                <span class="result-label">${field.label}</span>
                <span class="result-value">${value}${extra}</span>
                <span class="result-status ${present ? 'pass' : 'fail'}">
                    ${present ? '✅' : '❌'}
                </span>
            </div>
        `;
    }

    const decisionClass = overall ? "pass" : "fail";
    const decisionText = overall ? "✅ PASS" : "❌ FAIL";

    html += `
        <button class="decision-btn ${decisionClass}">
            ${decisionText}
        </button>
    `;

    resultsContainer.innerHTML = html;
}

// ===== Reset (optional) =====
function resetApp() {
    uploadedFiles = [];
    thumbnails.innerHTML = "";
    resultsContainer.innerHTML = `<p class="placeholder">Upload a label and click "PROCESS THIS" to see results.</p>`;
    statusMsg.textContent = "";
    processBtn.disabled = true;
}
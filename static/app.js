// ============================================
// VisionVine – Frontend Logic (Render Version)
// ============================================

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const browseBtn = document.getElementById("browseBtn");
const thumbnails = document.getElementById("thumbnails");
const processBtn = document.getElementById("processBtn");
const statusMsg = document.getElementById("statusMessage");
const resultsContainer = document.getElementById("resultsContainer");

let uploadedFiles = [];

console.log("✅ [0] VisionVine frontend loaded");

// ===== Click to browse =====
browseBtn.addEventListener("click", () => {
    console.log("🖱️ [1] Browse button clicked");
    fileInput.click();
});

dropZone.addEventListener("click", () => {
    console.log("🖱️ [1] Drop zone clicked");
    fileInput.click();
});

// ===== File selection =====
fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    console.log(`📁 [2] File input changed: ${files.length} file(s) selected`);
    handleFiles(files);
});

// ===== Drag and drop =====
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
    console.log("📂 [1] Dragging over drop zone");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
    console.log("📂 [1] Drag left drop zone");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const files = Array.from(e.dataTransfer.files);
    console.log(`📂 [1] Drop: ${files.length} file(s) dropped`);
    handleFiles(files);
});

// ===== Handle uploaded files =====
function handleFiles(files) {
    console.log(`📁 [3] handleFiles called with ${files.length} file(s)`);
    
    if (uploadedFiles.length + files.length > 3) {
        console.warn("⚠️ [3] Maximum 3 images allowed");
        statusMsg.textContent = "⚠️ Maximum 3 images allowed.";
        return;
    }

    let validFiles = 0;
    files.forEach((file) => {
        if (!file.type.startsWith("image/")) {
            console.warn(`⚠️ [3] Skipping non-image file: ${file.name} (${file.type})`);
            statusMsg.textContent = "⚠️ Only image files are allowed.";
            return;
        }
        uploadedFiles.push(file);
        displayThumbnail(file);
        validFiles++;
        console.log(`✅ [3] File added: ${file.name} (${file.size} bytes)`);
    });

    console.log(`📊 [3] Total uploaded files: ${uploadedFiles.length}`);
    statusMsg.textContent = `✅ ${uploadedFiles.length} image(s) loaded.`;
    processBtn.disabled = false;
}

// ===== Display thumbnail =====
function displayThumbnail(file) {
    console.log(`🖼️ [4] Displaying thumbnail for: ${file.name}`);
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        thumbnails.appendChild(img);
        console.log(`✅ [4] Thumbnail rendered for: ${file.name}`);
    };
    reader.readAsDataURL(file);
}

// ===== Process button =====
processBtn.addEventListener("click", async () => {
    console.log("🚀 [5] PROCESS THIS button clicked");
    
    if (uploadedFiles.length === 0) {
        console.warn("⚠️ [5] No files uploaded");
        statusMsg.textContent = "⚠️ Please upload at least one image.";
        return;
    }

    console.log(`📤 [5] Starting processing for ${uploadedFiles.length} file(s)`);
    processBtn.disabled = true;
    processBtn.textContent = "⏳ Processing...";
    statusMsg.textContent = "⏳ Sending to AI...";
    resultsContainer.innerHTML = `<p class="placeholder">⏳ Waiting for results...</p>`;

    try {
        console.log("📦 [6] Creating FormData...");
        const formData = new FormData();
        formData.append("file", uploadedFiles[0]);
        console.log(`📦 [6] FormData created with file: ${uploadedFiles[0].name}`);

        console.log("📡 [7] Sending POST request to /process...");
        const response = await fetch("/process", {
            method: "POST",
            body: formData
        });

        console.log(`📡 [7] Response received: ${response.status} ${response.statusText}`);
        
        console.log("📄 [8] Parsing JSON response...");
        const data = await response.json();
        console.log("📄 [8] JSON parsed successfully:", data);

        if (data.success) {
            console.log("✅ [9] Processing successful");
            displayResults(data);
            statusMsg.textContent = "✅ Processing complete.";
        } else {
            console.error("❌ [9] Backend error:", data.error);
            statusMsg.textContent = "❌ Error: " + (data.error || "Unknown error");
            resultsContainer.innerHTML = `<p class="placeholder">❌ ${data.error || "Unknown error"}</p>`;
        }

    } catch (error) {
        console.error("❌ [9] Fetch error:", error);
        console.error("❌ [9] Error message:", error.message);
        console.error("❌ [9] Error stack:", error.stack);
        statusMsg.textContent = "❌ Error: " + error.message;
        resultsContainer.innerHTML = `<p class="placeholder">❌ Failed to connect to backend. Please try again.</p>`;
    } finally {
        console.log("🔓 [9] Re-enabling process button");
        processBtn.disabled = false;
        processBtn.textContent = "🚀 PROCESS THIS";
    }
});

// ===== Display results =====
function displayResults(data) {
    console.log("📊 [10] Displaying results...");
    
    if (!data.success) {
        console.error("❌ [10] Data success is false:", data.error);
        resultsContainer.innerHTML = `<p class="placeholder">❌ Error: ${data.error || "Unknown error"}</p>`;
        return;
    }

    const validation = data.validation;
    const overall = data.overall_pass;

    console.log(`📊 [10] Overall pass: ${overall}`);
    console.log("📊 [10] Validation data:", validation);

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
        if (!result) {
            console.warn(`⚠️ [10] No validation data for: ${field.key}`);
            continue;
        }

        const present = result.present;
        const value = result.value || "Not found";
        const extra = field.key === "government_warning" && result.all_caps !== undefined
            ? (result.all_caps ? " ✅ ALL CAPS" : " ❌ Not ALL CAPS")
            : "";

        console.log(`📊 [10] ${field.label}: ${present ? '✅' : '❌'} - ${value}`);

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

    console.log(`📊 [10] Final decision: ${decisionText}`);

    html += `
        <button class="decision-btn ${decisionClass}">
            ${decisionText}
        </button>
    `;

    resultsContainer.innerHTML = html;
    console.log("✅ [10] Results displayed");
}
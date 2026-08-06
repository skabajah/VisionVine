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

console.log("[0] VisionVine frontend loaded");

// ===== Initialize button state =====
function setButtonState(state) {
    // state: 'no_images', 'ready', 'processing', 'done'
    switch(state) {
        case 'no_images':
            processBtn.textContent = "Upload Images First";
            processBtn.disabled = true;
            processBtn.classList.remove('enabled');
            break;
        case 'ready':
            processBtn.textContent = "Verify Label";
            processBtn.disabled = false;
            processBtn.classList.add('enabled');
            break;
        case 'processing':
            processBtn.textContent = "Verifying...";
            processBtn.disabled = true;
            processBtn.classList.remove('enabled');
            break;
        case 'done':
            processBtn.textContent = "Start Over";
            processBtn.disabled = false;
            processBtn.classList.add('enabled');
            break;
        default:
            break;
    }
}

// ===== Reset the app =====
function resetApp() {
    fileInput.value = "";
    uploadedFiles = [];
    thumbnails.innerHTML = "";
    resultsContainer.innerHTML = `<p class="placeholder">Results will appear here.</p>`;
    statusMsg.textContent = "";
    setButtonState('no_images');
    console.log("[0] App reset");
}

// ===== Click to browse =====
browseBtn.addEventListener("click", () => {
    console.log("[1] Browse button clicked");
    fileInput.click();
});

dropZone.addEventListener("click", () => {
    console.log("[1] Drop zone clicked");
    fileInput.click();
});

// ===== File selection =====
fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    console.log(`[2] File input changed: ${files.length} file(s) selected`);
    handleFiles(files);
});

// ===== Drag and drop =====
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
    console.log("[1] Dragging over drop zone");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
    console.log("[1] Drag left drop zone");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const files = Array.from(e.dataTransfer.files);
    console.log(`[1] Drop: ${files.length} file(s) dropped`);
    handleFiles(files);
});

// ===== Handle uploaded files =====
function handleFiles(files) {
    console.log(`[3] handleFiles called with ${files.length} file(s)`);
    
    if (uploadedFiles.length + files.length > 3) {
        console.warn("[3] Maximum 3 images allowed");
        statusMsg.textContent = "Maximum 3 images allowed.";
        return;
    }

    let validFiles = 0;
    files.forEach((file) => {
        if (!file.type.startsWith("image/")) {
            console.warn(`[3] Skipping non-image file: ${file.name} (${file.type})`);
            statusMsg.textContent = "Only image files are allowed.";
            return;
        }
        uploadedFiles.push(file);
        displayThumbnail(file);
        validFiles++;
        console.log(`[3] File added: ${file.name} (${file.size} bytes)`);
    });

    console.log(`[3] Total uploaded files: ${uploadedFiles.length}`);
    statusMsg.textContent = `${uploadedFiles.length} image(s) loaded.`;
    
    if (uploadedFiles.length > 0) {
        setButtonState('ready');
    } else {
        setButtonState('no_images');
    }
}

// ===== Remove file =====
function removeFile(fileToRemove) {
    const index = uploadedFiles.indexOf(fileToRemove);
    if (index !== -1) {
        uploadedFiles.splice(index, 1);
    }
    renderThumbnails();
    if (uploadedFiles.length === 0) {
        setButtonState('no_images');
        statusMsg.textContent = "No images uploaded.";
    } else {
        setButtonState('ready');
        statusMsg.textContent = `${uploadedFiles.length} image(s) loaded.`;
    }
}

// ===== Render thumbnails =====
function renderThumbnails() {
    thumbnails.innerHTML = "";
    for (const file of uploadedFiles) {
        displayThumbnail(file);
    }
}

// ===== Display thumbnail =====
function displayThumbnail(file) {
    console.log(`[4] Displaying thumbnail for: ${file.name}`);
    const reader = new FileReader();
    reader.onload = (e) => {
        const wrapper = document.createElement("div");
        wrapper.className = "thumbnail-wrapper";

        const img = document.createElement("img");
        img.src = e.target.result;
        wrapper.appendChild(img);

        const removeBtn = document.createElement("button");
        removeBtn.className = "thumbnail-remove";
        removeBtn.setAttribute("aria-label", "Remove image");

        const removeIcon = document.createElement("span");
        removeIcon.className = "material-icons";
        removeIcon.textContent = "close";
        removeBtn.appendChild(removeIcon);

        removeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            removeFile(file);
        });

        wrapper.appendChild(removeBtn);
        thumbnails.appendChild(wrapper);
        console.log(`[4] Thumbnail rendered for: ${file.name}`);
    };
    reader.readAsDataURL(file);
}

// ===== Process button =====
processBtn.addEventListener("click", async () => {
    // If the button says "Start Over", reset the app
    if (processBtn.textContent === "Start Over") {
        resetApp();
        return;
    }

    if (uploadedFiles.length === 0) {
        console.warn("[5] No files uploaded");
        statusMsg.textContent = "Please upload at least one image.";
        return;
    }

    console.log(`[5] Starting processing for ${uploadedFiles.length} file(s)`);
    setButtonState('processing');
    statusMsg.textContent = "Sending to AI...";
    resultsContainer.innerHTML = `<p class="placeholder">Waiting for results...</p>`;

    try {
        console.log("[6] Creating FormData...");
        const formData = new FormData();
        
        for (let i = 0; i < uploadedFiles.length; i++) {
            formData.append("files", uploadedFiles[i]);
            console.log(`[6] Added file ${i + 1}: ${uploadedFiles[i].name}`);
        }

        console.log("[7] Sending POST request to /process...");
        const response = await fetch("/process", {
            method: "POST",
            body: formData
        });

        console.log(`[7] Response received: ${response.status} ${response.statusText}`);
        
        const rawText = await response.text();
        console.log("[8] Raw response text:", rawText);

        const parsedResponse = JSON.parse(rawText);

        // ADD THE SAFETY CHECK HERE
        if (!parsedResponse.raw_response) {
            console.error("[8] No raw_response in parsed response");
            statusMsg.textContent = "Error: No response from AI";
            resultsContainer.innerHTML = `<p class="placeholder">Error: No response from AI</p>`;
            setButtonState('done');
            return;
        }

        const cleanedData = cleanGroqResponse(parsedResponse.raw_response);
        console.log("[8] Cleaned data:", cleanedData);

        if (cleanedData.success) {
            console.log("[9] Processing successful");
            displayResults(cleanedData);
            statusMsg.textContent = "Processing complete.";
            setButtonState('done');
        } else {
            console.error("[9] Cleaner error:", cleanedData.error);
            statusMsg.textContent = "Error: " + (cleanedData.error || "Unknown error");
            resultsContainer.innerHTML = `<p class="placeholder">${cleanedData.error || "Unknown error"}</p>`;
            setButtonState('done');
        }

    } catch (error) {
        console.error("[9] Fetch error:", error);
        console.error("[9] Error message:", error.message);
        console.error("[9] Error stack:", error.stack);
        statusMsg.textContent = "Error: " + error.message;
        resultsContainer.innerHTML = `<p class="placeholder">Failed to connect to backend. Please try again.</p>`;
        setButtonState('done');
    }
});

// ===== Display results =====
function displayResults(data) {
    console.log("[10] Displaying results...");
    
    if (!data.success) {
        console.error("[10] Data success is false:", data.error);
        resultsContainer.innerHTML = `<p class="placeholder">Error: ${data.error || "Unknown error"}</p>`;
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
        if (!result) {
            console.warn(`[10] No validation data for: ${field.key}`);
            continue;
        }

        let present = result.present;
        const value = result.value || "Not found";
        let extra = "";

        if (field.key === "government_warning" && result.all_caps !== undefined) {
            if (result.all_caps === true) {
                extra = '<br><span class="warning-status standard">Standard Warning</span>';
            } else if (result.all_caps === false) {
                extra = '<br><span class="warning-status non-standard">Non-Standard Warning</span>';
                present = false;
            }
        }

        console.log(`[10] ${field.label}: ${present ? 'PASS' : 'FAIL'} - ${value}`);

        html += `
            <div class="result-item">
                <span class="result-label">${field.label}</span>
                <span class="result-value">${value}${extra}</span>
                <span class="result-status ${present ? 'pass' : 'fail'}">
                    <span class="material-icons">${present ? 'check_circle' : 'cancel'}</span>
                </span>
            </div>
        `;
    }

    const decisionClass = overall ? "pass" : "fail";
    const decisionText = overall ? "PASS" : "FAIL";
    const decisionIcon = overall ? "check_circle" : "cancel";

    html += `
        <button class="decision-btn ${decisionClass}">
            <span class="material-icons">${decisionIcon}</span>
            ${decisionText}
        </button>
    `;

    resultsContainer.innerHTML = html;
    console.log("[10] Results displayed");
}

// ===== Set initial state =====
setButtonState('no_images');
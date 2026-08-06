// ============================================
// VisionVine – Data Cleaner
// ============================================

function cleanGroqResponse(rawText) {
    try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No JSON found in response");
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Normalize field names: lowercase + underscore (replace spaces AND slashes)
        const normalized = {};
        for (const [key, value] of Object.entries(parsed)) {
            const newKey = key.toLowerCase().replace(/[ /]/g, "_");
            let cleanedValue = value;
            if (typeof value === 'string') {
                cleanedValue = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            }
            normalized[newKey] = cleanedValue;
        }

        const fields = ["brand_name", "class_type", "abv", "net_contents", "government_warning", "beverage_type"];
        const results = {};
        let allPass = true;

        for (const field of fields) {
            const val = normalized[field] || "";
            const present = Boolean(val && val.trim() && val !== "Not readable");
            results[field] = { present, value: val || "Not found" };
            if (!present) allPass = false;
        }

        if (normalized.government_warning) {
            const warning = normalized.government_warning;
            results.government_warning.all_caps = (warning === warning.toUpperCase());
            if (!results.government_warning.all_caps) allPass = false;
        }

        return {
            success: true,
            extracted: normalized,
            validation: results,
            overall_pass: allPass
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}
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
                // ✅ Skip accent stripping for government_warning
                if (newKey !== "government_warning") {
                    cleanedValue = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                } else {
                    cleanedValue = value; // Keep warning text as-is
                }
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

        // check that "GOVERNMENT WARNING" is in ALL CAPS
        if (normalized.government_warning) {
            const warning = normalized.government_warning;
            const cleanWarning = warning.trim();
            const hasGovWarningHeader = /^GOVERNMENT WARNING:?/i.test(cleanWarning);
            const isHeaderAllCaps = /^GOVERNMENT WARNING:?/.test(cleanWarning);
            results.government_warning.all_caps = hasGovWarningHeader && isHeaderAllCaps;
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
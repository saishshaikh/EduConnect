/**
 * Input sanitization & security helpers for EduConnect
 */

export const sanitizeUrl = (url) => {
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim();
    if (!trimmed) return "";

    // Reject dangerous schemes
    const dangerousSchemes = /^(javascript:|data:|vbscript:|file:|about:)/i;
    if (dangerousSchemes.test(trimmed)) {
        return "";
    }

    // If starts with http:// or https://, validate format
    if (/^https?:\/\//i.test(trimmed)) {
        try {
            const parsed = new URL(trimmed);
            if (["http:", "https:"].includes(parsed.protocol)) {
                return trimmed;
            }
            return "";
        } catch {
            return "";
        }
    }

    // If it's a domain/path without protocol (e.g. github.com/user or myportfolio.com), add https://
    if (/^[a-zA-Z0-9][-a-zA-Z0-9+&@#/%?=~_|!:,.;]*\.[a-zA-Z]{2,}/.test(trimmed)) {
        return `https://${trimmed}`;
    }

    return trimmed;
};

export const sanitizeString = (str, maxLength = 5000) => {
    if (str === undefined || str === null) return "";
    if (typeof str !== "string") return String(str);
    return str.slice(0, maxLength).trim();
};

export const safeJsonParse = (data, fallback = []) => {
    if (!data) return fallback;
    if (typeof data === "object") return data;
    try {
        const parsed = JSON.parse(data);
        return parsed !== null && parsed !== undefined ? parsed : fallback;
    } catch {
        return fallback;
    }
};

// Helper for "too many login within one minute"

// in-memory map: ip -> last reset request time (ms)
const lastResetByIp = new Map();

// Simple rate limiter: true if the IP requested too recently.
export function tooSoon(ip) {
    if (process.env.NODE_ENV !== 'production') return false;
    const now = Date.now();
    const last = lastResetByIp.get(ip) || 0;
    const interval = 60_000; // 1 minute
    if (now - last < interval) {
        return true;
    }
    lastResetByIp.set(ip, now);
    return false;
}

// Get client IP, respecting X-Forwarded-For headers for a proxy setup
export function clientIp(req) {
    const fwd = req.headers['x-forwarded-for'];
    if (typeof fwd === 'string' && fwd.length) {
        return fwd.split(',')[0].trim();
    }
    return req.ip || 'unknown';
}
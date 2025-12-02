// Helper functions for user query filterings

const ALLOWED_ROLES = new Set(['regular', 'cashier', 'manager', 'superuser']);

export function parsePagination(query) {

    const pageRaw = query.page ?? '1';
    const limitRaw = query.limit ?? '10';

    const page = Number(pageRaw);
    const limit = Number(limitRaw);

    if (!Number.isInteger(page) || page <= 0) {
        throw new Error('page must be a positive integer');
    }
    if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
        throw new Error('limit must be a positive integer (1..100)');
    }

    return {
        skip: (page - 1) * limit,
        take: limit,
    };
}

export function buildUserFilters({ name, role, verified, activated }) {

    const filters = { AND: [] };
    let or = null;

    // role filter
    if (role !== undefined) {
        const r = String(role).toLowerCase();
        if (!ALLOWED_ROLES.has(r)) {
            throw new Error('role must be one of regular|cashier|manager|superuser');
        }
        filters.AND.push({ role: r });
    }

    // verified filter
    if (verified !== undefined) {
        const v = String(verified).toLowerCase();
        if (v === 'true') {
            filters.AND.push({ verified: true });
        } else if (v === 'false' || v === 'null') {
            filters.AND.push({ verified: false });
        } else {
            throw new Error('verified must be true or false');
        }
    }

    // search by name / utorid
    if (name !== undefined && String(name).trim() !== '') {
        const term = String(name).trim().toLowerCase();
        or = [
            { name: { contains: term } },
            { utorid: { contains: term } },
        ];
    }

    // activated filter
    if (activated !== undefined) {
        const a = String(activated).toLowerCase();
        if (!['true', 'false'].includes(a)) {
            throw new Error('activated must be true or false');
        }
        if (a === 'true') {
            filters.AND.push({ passwordHash: { not: '' } });
        } else {
            // treat "not activated" as "no password set yet"
            filters.AND.push({ passwordHash: '' });
        }
    }

    if (filters.AND.length && or) {
        return { AND: [...filters.AND, { OR: or }] };
    }
    if (filters.AND.length) {
        return { AND: filters.AND };
    }
    if (or) {
        return { OR: or };
    }
    return {};
}

export function toISO(date) {
    return date ? new Date(date).toISOString() : null;
}

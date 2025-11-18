'use strict';

import jwt from 'jsonwebtoken';
import prisma from '../db.js';

function normalizeRole(r) {
    const s = String(r || '').toLowerCase();
    return ['regular', 'cashier', 'manager', 'superuser'].includes(s) ? s : 'regular';
}

const ROLE_ORDER = { regular: 0, cashier: 1, manager: 2, superuser: 3 };

// Middleware for Authentication
export async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !/^bearer\s+/i.test(authHeader)) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const dbUser = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { 
                id: true, 
                role: true, 
                suspicious: true, 
                utorid: true, 
                lastLogin: true 
            },
        });
        if (!dbUser) {
            return res.status(401).json({ error: 'Unauthorized: user not found' });
        }
        req.user = {
            id: dbUser.id,
            role: normalizeRole(decoded.role ?? dbUser.role),
            suspicious: !!dbUser.suspicious,
            utorid: dbUser.utorid,
            lastLogin: dbUser.lastLogin ?? null,
        }
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
}

// Middleware for Role Clearance
export function requireRole(minRole) {
    const need = ROLE_ORDER[normalizeRole(minRole)];
    const min = String(minRole).toLowerCase();
    return (req, res, next) => {
        const have = ROLE_ORDER[normalizeRole(req.user?.role)];
        if (have == null || have < need) {
            return res.status(403).json({ error: 'Forbidden: insufficient clearance' });
        }
        next();
    };
}
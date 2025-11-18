// Handle all endpoints start with /auth
'use strict';

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { isValidUtorid, isValidPassword } from '../helpers/validation.js';
import { tooSoon, clientIp } from '../helpers/rateLimit.js';

const router = express.Router();

// POST /auth/tokens (Any)
router.post('/tokens', async (req, res) => {
    const { utorid, password } = req.body;

    if (!utorid || !password) {
        return res.status(400).json({ error: 'Missing utorid or password' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { utorid } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid utorid or password' });
        }
        if (!user.passwordHash || !user.passwordHash.startsWith('$2')) {
            return res.status(401).json({ error: 'Invalid utorid or password' });
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid utorid or password' });
        }
        const now = new Date();
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: now },
        });
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
        );
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        return res.status(200).json({ token, expiresAt });
    } catch (err) {
        console.error('POST /auth/tokens error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST for /auth/resets (Any)
router.post('/resets', async (req, res) => {
    const ip = clientIp(req);
    if (tooSoon(ip)) {
        return res.status(429).json({error: 'Too Many Requests'});
    }
    const {utorid} = req.body || {};
    if (!isValidUtorid(utorid)) {
        return res.status(400).json({error: 'utorid must be 7-8 alphanumeric characters'});
    }
    try {
        const user = await prisma.user.findUnique({where: {utorid}});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const token = uuidv4();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await prisma.user.update({
            where: {id: user.id},
            data: {resetToken: token, expiresAt},
        });
        return res.status(202).json({
            expiresAt: expiresAt.toISOString(),
            resetToken: token,
        });
    } catch (err) {
        console.error('POST /auth/resets error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST for /auth/resets/:resetToken (Any)
router.post('/resets/:resetToken', async (req, res) => {
    const {resetToken} = req.params;
    const {utorid, password} = req.body || {};
    if (typeof utorid !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: 'utorid and password are required' });
    }
    if (!isValidPassword(password)) {
        return res.status(400).json({
            error: 'Password must be 8-20 chars with uppercase, lowercase, number, and special character',
        });
    }
    try {
        const byToken = await prisma.user.findFirst({where: {resetToken}});
        if (!byToken) {
            return res.status(404).json({ error: 'Reset token invalid' });
        }
        if (byToken.utorid !== utorid) {
            return res.status(401).json({ error: 'Reset token does not belong to this user' });
        }
        if (!byToken.expiresAt || new Date(byToken.expiresAt).getTime() <= Date.now()) {
            await prisma.user.update({
                where: {id: byToken.id},
                data: {resetToken: null, expiresAt: null}
            });
            return res.status(410).json({error: 'Reset token expired'});
        }
        const passwordHash = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: {id: byToken.id},
            data: {passwordHash, resetToken: null, expiresAt: null, verified: true},
        });
        return res.status(200).json({});
    } catch (err) {
        console.error('POST /auth/resets/:resetToken error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
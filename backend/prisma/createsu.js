/*
 * Complete this script so that it is able to add a superuser to the database
 * Usage example: 
 *   node prisma/createsu.js clive123 clive.su@mail.utoronto.ca SuperUser123!
 */
'use strict';

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

function isUtoridValid(utorid) {
    return typeof utorid === 'string' && /^[A-Za-z0-9]{7,8}$/.test(utorid);
}

function isUofTEmail(email) {
    return typeof email === 'string' && /^[^\s@]+@(mail\.)?utoronto\.ca$/.test(email);
}

async function main() {
    const [utorid, email, password] = process.argv.slice(2);

    if (!utorid || !email || !password) {
        console.error('Usage: node prisma/createsu.js <utorid> <email> <password>');
        process.exit(1);
    }
    if (!isUtoridValid(utorid)) {
        console.error('Error: utorid must be 7-8 alphanumeric characters.');
        process.exit(1);
    }
    if (!isUofTEmail(email)) {
        console.error('Error: email must be a valid UofT address (e.g., name@utoronto.ca).');
        process.exit(1);
    }

    const passwordHash = await hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                utorid,
                email,
                passwordHash,
                role: 'superuser',
                verified: true,
                suspicious: false,
            },
        });
    } catch (err) {
        if (err.code === 'P2002') {
            console.error('Error: utorid or email already exists.');
        } else {
            console.error('Unexpected error:', err);
        }
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
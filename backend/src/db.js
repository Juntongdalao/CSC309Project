// This file creates and exports a single shared Prisma client instance.
'use strict';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default prisma;
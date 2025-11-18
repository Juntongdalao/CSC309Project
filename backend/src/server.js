'use strict';

import app from './app.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`StellarPoints backend listening on port ${PORT}`);
});

server.on('error', (err) => {
    console.error(`Cannot start server: ${err.message}`);
    process.exit(1);
});
// Get libraries
const path = require('path');
const process = require('process');
const express = require('express');

// Create properties
const cwd = process.cwd();
const app = express();
const port = 3000;

// Serve static files
app.use(express.static(path.join(cwd, 'lib')));
app.use(express.static(path.join(cwd, 'demo', 'public')));

app.listen(port, () => {
  console.log(`Started demo at http://localhost:${port}`);
});

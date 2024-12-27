const express = require('express');
const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Helper function to get the correct asset path
function getAssetPath(relativePath) {
  return process.pkg 
    ? path.join(path.dirname(process.execPath), relativePath)
    : path.join(__dirname, relativePath);
}

// Ensure the browser directory exists
const browserPath = getAssetPath('browser');
if (!fs.existsSync(browserPath)) {
  console.error('Error: browser directory not found at:', browserPath);
  process.exit(1);
}

// Ensure db.json exists
const dbPath = getAssetPath('db.json');
if (!fs.existsSync(dbPath)) {
  console.error('Error: db.json not found at:', dbPath);
  process.exit(1);
}

// JSON Server middleware
const router = jsonServer.router(dbPath);
app.use('/api', jsonServer.defaults(), router);

// Serve static files from the Angular app
app.use(express.static(browserPath));

// All other routes should redirect to the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(browserPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Browser path: ${browserPath}`);
  console.log(`Database path: ${dbPath}`);
});

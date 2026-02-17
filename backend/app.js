require('dotenv').config(); // Load variables from .env
const express = require('express');
const app = express();

// Use the port from .env, or fallback to 3000 if not found
const port = process.env.PORT || 5000; 

app.get('/', (req, res) => {
  res.send('Server running with .env port!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

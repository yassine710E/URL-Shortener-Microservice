require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

// In-memory database for URLs
let urlDatabase = [];
let idCounter = 1;

// Root route
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Example API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// POST endpoint to create a shortened URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Check if URL is valid
  try {
    const urlObj = new URL(originalUrl);
    const hostname = urlObj.hostname;

    // Verify URL's hostname with dns.lookup
    dns.lookup(hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      // Save URL with a unique ID
      const shortUrl = idCounter++;
      urlDatabase.push({ originalUrl, shortUrl });

      res.json({ original_url: originalUrl, short_url: shortUrl });
    });
  } catch {
    res.json({ error: 'invalid url' });
  }
});

// GET endpoint to redirect to the original URL
app.get('/api/shorturl/:shortUrl', function(req, res) {
  const shortUrl = parseInt(req.params.shortUrl);
  const entry = urlDatabase.find((entry) => entry.shortUrl === shortUrl);

  if (entry) {
    res.redirect(entry.originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

// Start server
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

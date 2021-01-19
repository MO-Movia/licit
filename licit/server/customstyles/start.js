// @flow
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3005;

//allow OPTIONS on all resources
app.options('*', cors());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.text());

const JSONFILE = '../customstyles/customstyles.json';
/** styles as map for fast lookup */
const allStyles = readStyles();
/** styles as sorted array for results */
let sortedStyles = sortStyles(allStyles);

/**
 * Read styles from disk storage.
 *
 * @returns Dictionary of styles.
 */
function readStyles() {
  try {
    const json = fs.readFileSync(JSONFILE, 'utf-8');
    const rawStyles = JSON.parse(json) || [];
    // Convert array into map.
    return rawStyles.reduce((out, style) => {
      const key = style.styleName.toUpperCase();
      out[key] = style;
      return out;
    });
  } catch (err) {
    console.error('Failed to read style file.', JSONFILE);
    // Return empty object.
    return {};
  }
}

/**
 * Write styles to disk storage.
 */
function writeStyles() {
  try {
    const json = JSON.stringify(allStyles);
    fs.writeFileSync(JSONFILE, json, 'utf-8');
  } catch (err) {
    console.error('Failed to write style file', JSONFILE);
  }
}

/**
 * Convert map to a sorted array.
 */
function sortStyles() {
  return Object.keys(allStyles).sort().map(key => allStyles[key]);
}

// [FS] IRAD-1128 2020-12-24
// read the custom style json file to return all styles.
app.get('/getcustomstyles/', function (req, res, next) {
  // Send the memory cache
  res.send(sortedStyles);
});

// [FS] IRAD-1128 2020-12-24
// save the custom style to the json file.
app.post('/savecustomstyle/', function (req, res) {
  const name = req.body.stylename.toUpperCase();
  // Attach new or overwite existing style
  allStyles[name] = req.body;
  // Save changes
  sortedStyles = sortStyles();
  writeStyles();

  res.send(sortedStyles);
});

// [FS] IRAD-1128 2020-12-24
// save the custom style to the json file.
app.post('/renamecustomstyle/', function (req, res) {
  const oldName = req.body.styleName.toUpperCase();
  const style = allStyles[oldName];
  if (style) {
    const newName = req.body.modifiedStyleName;
    style.stylename = newName;
    allStyles[newName.toUpperCase()] = style;
    delete allStyles[oldName];

    sortedStyles = sortStyles();
    writeStyles();
  }

  // Send the memory cache
  res.send(sortedStyles);
});


// [FS] IRAD-1128 2020-12-30
// to remove the selected custom style from the json file.
app.post('/removecustomstyle/', function (req, res) {
  const name = req.body.toUpperCase();

  if (allStyles.hasOwnProperty(name)) {
    delete allStyles[name];
    sortedStyles = sortStyles();
    writeStyles();
  }

  // Send the memory cache
  res.send(sortedStyles);
});

if (!module.parent) {
  const server = app.listen(PORT);
  console.log('Custom Style Server running on port ' + PORT + '!...');

  // Create shutdown method.
  const shutdown = () => {
    console.log('Beginning shutdown.');
    server.close(() => console.log('Shutdown complete.'));
  };

  // Listen for terminal events to trigger shutdown.
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

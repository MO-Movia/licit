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
    //Initially the out variable having some unexpected values, so created a new map variable
    const json = fs.readFileSync(JSONFILE, 'utf-8');
    const rawStyles = JSON.parse(json) || [];
    // Convert array into map.
    return rawStyles.reduce((out, style) => {
      if (style.stylename) {
        out[style.stylename.toUpperCase()] = style;
      }
      return out;
    }, {});
  } catch (err) {
    console.error('Failed to read style file.', JSONFILE, err);
    // Return empty object.
    return {};
  }
}

/**
 * Write styles to disk storage.
 */
function writeStyles() {
  try {
    // Save the array
    const json = JSON.stringify(sortedStyles);
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
app.get('/getcustomstyles/', function (req, res) {
  // Send the memory cache
  res.json(sortedStyles);
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
  const oldName = req.body.stylename.toUpperCase();
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
  res.json(sortedStyles);
});

// Not used by the editor!
// Responds with the current collection of styles as a map. This endpoint
// provides a way to backup / migrate styles from one instance of the service to
// another.
//
// json respone:  { styles: {} }
app.get('/bulk-export', (req, res) => {
  // Wrap map in object to match bulk-import expectations.
  res.json({styles: allStyles});
});

// Not used by the editor!
// Accepts a collection of styles previously exported.  This endoint provides a
// way to restore / migrate styles from one insdtance of the service to another.
//
// json body: { styles: {...}, replace?: true }
//
// The default behavior is to merge incomming styles with any existing ones.
// Styles with same case-insensitvie name will be overwritten.  Setting replace
// to true will delete all existing styles and only the imported styles will be
// retained..
app.post('/bulk-import', (req, res) => {
  const { styles, replace } = req.body;
  if (styles) {
    if (replace) {
      // Delete all existing styles.
      Object.keys(allStyles).forEach(key => delete allStyles[key]);
    }
    // Add styles from incomming collection.
    Object.keys(styles).forEach(key => allStyles[key] = styles[key]);
    sortedStyles = sortStyles();
    writeStyles();
  }

  // Respond with updated style data.
  return res.json({styles: allStyles});
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

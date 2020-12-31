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

// [FS] IRAD-1128 2020-12-24
// read the custom style json file to return all styles.
app.get('/getcustomstyles/', function (req, res, next) {
  fs.exists('../customstyles/customstyles.json', function (exists) {
    if (exists) {
      // if json file exists
      let styles = [];
      fs.readFile('../customstyles/customstyles.json', function (err, data) {
        if (err) {
          res.send(styles);
        }
        styles = JSON.parse(data);
        styles.sort(function (a, b) {
          var styleA = a.stylename.toUpperCase();
          var styleB = b.stylename.toUpperCase();

          return styleA.localeCompare(styleB);
        });
        res.send(styles);
      });
    } else {
      // create a customstyles json file if not exist.
      fs.appendFile('../customstyles/customstyles.json', '[]', function (err) {
        if (err) throw err;
        console.log('JSON File is created successfully.');
      });
    }
  });
});

// [FS] IRAD-1128 2020-12-24
// save the custom style to the json file.
app.post('/savecustomstyle/', function (req, res) {
  fs.readFile('../customstyles/customstyles.json', function (err, data) {
    if (err) {
      return console.error(err);
    }
    var fresult = JSON.parse(data);
    var exists = false;

    // to check, the style already exists
    for (let i = 0; i < fresult.length; i++) {
      if (fresult[i].stylename === req.body.stylename) {
        //if style exists, then modify it
        fresult[i].styles = req.body.styles;
        exists = true;
        break;
      }
    }

    //if style not exists, then add the style to json array
    if (!exists) {
      fresult.push(req.body);
    }

    fs.writeFile(
      '../customstyles/customstyles.json',
      JSON.stringify(fresult),
      function (err, result) {
        if (err) {
          return console.error(err);
        } else {
          console.log('Success');
        }
      }
    );
  });
});

// [FS] IRAD-1128 2020-12-30
// to remove the selected custom style from the json file.
app.post('/removecustomstyle/', function (req, res) {
  fs.readFile('../customstyles/customstyles.json', function (err, data) {
    if (err) {
      return console.error(err);
    }
    var fresult = JSON.parse(data);
    for (let i = 0; i < fresult.length; i++) {
      if (fresult[i].stylename === req.body) {
        fresult.splice(i, 1);
        break;
      }
    }
    fs.writeFile(
      '../customstyles/customstyles.json',
      JSON.stringify(fresult),
      function (err, result) {
        if (err) {
          return console.error(err);
        } else {
          console.log('Success');
        }
      }
    );
  });
});

if (!module.parent) {
  app.listen(PORT);
  console.log('Custom Style Server running on port ' + PORT + '!...');
}

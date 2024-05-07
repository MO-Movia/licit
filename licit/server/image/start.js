// @flow

import express from 'express';
import cors from 'cors';
import formidable from 'formidable';
import mv from 'mv';
import { v4 as uuidv4 } from 'uuid';

const app = express();

const PORT = process.env.PORT || 3004;

//allow OPTIONS on all resources
app.options('*', cors());
app.use(cors());

// Handle asset GET url.
app.use('/assets', express.static('../images/'));
// Handle image upload.
app.post('/saveimage', function (req, res) {
  const form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, blob) {
    const oldpath = blob.file.path;
    const fileid = uuidv4();
    const filename = fileid + '_' + req.query['fn'];
    const newpath = '../images/' + filename;
    mv(oldpath, newpath, function (err) {
      if (err) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.json({error: err});
      } else {
        const host = req.headers['host'];
        const proto = req.connection.encrypted ? 'https' : 'http';
        const imgSrc = proto + '://' + host + '/assets/' + filename;
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.write(
          JSON.stringify({
            id: fileid,
            width: 0,
            height: 0,
            src: imgSrc,
          })
        );
      }
      res.end();
    });
  });
});

// Handle saving recentColor data
app.post('/saverecentcolor', (req, res) => {
  try {
    const data = req.body;
    const filename = 'recentcolor.json';
    const filepath = '../colors/' + filename;

    fs.writeFile(filepath, JSON.stringify(data), (err) => {
      if (err) {
        console.error('Error writing file:', err);
        res.status(500).json({ error: 'Failed to save JSON data' });
      } else {
        res.status(200).json({ message: 'JSON data saved successfully' });
      }
    });
  } catch (error) {
    console.error('Synchronous error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/getrecentcolors', (req, res) => {
  try {
    const filename = 'recentcolor.json';
    const filepath = '../colors/' + filename;

    fs.readFile(filepath, 'utf8', (readError, data) => {
      if (readError) {
        console.error('Error reading file:', readError);
        return res.status(404).json({ error: 'File not found or could not be read' });
      }

      res.status(200).json(JSON.parse(data));
    });
  } catch (error) {
    console.error('Synchronous error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.delete('/deleterecentcolor/:id', (req, res) => {
  try {
    const idToDelete = Number(req.params.id);

    if (isNaN(idToDelete)) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }

    const filename = 'recentcolor.json';
    const filepath = '../colors/' + filename;

    fs.access(filepath, (accessError) => {
      if (accessError) {
        return res.status(404).json({ error: 'File not found' });
      }
      fs.readFile(filepath, 'utf-8', (readError, rawData) => {
        if (readError) {
          console.error('Error reading file:', readError);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        const colorData = JSON.parse(rawData);

        const indexToDelete = colorData.findIndex(entry => entry.id === idToDelete);
        if (indexToDelete !== -1) {
          colorData.splice(indexToDelete, 1);
          fs.writeFile(filepath, JSON.stringify(colorData), (writeError) => {
            if (writeError) {
              console.error('Error writing file:', writeError);
              return res.status(500).json({ error: 'Failed to save JSON data' });
            }

            res.status(200).json({ message: `Entry with ID ${idToDelete} deleted successfully` });
          });
        } else {
          res.status(404).json({ error: `Entry with ID ${idToDelete} not found` });
        }
      });
    });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.listen(PORT, () =>
  console.log('Image Server running on port ' + PORT + '!...')
);
'use strict';

var express = require('express');
var fs = require('fs');
var util = require('util');
var mime = require('mime');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var app = express();

// Simple upload form
var form = '<!DOCTYPE HTML><html><body style=margin-left:25%;margin-top:5%>' +
    "<form method='post' action='/upload' enctype='multipart/form-data'>" +
    "<h3>Select Image :</h3>" +
    "<input type='file' name='image'/>" +
    "<br/><br/>" +
    "<select name='type' id='type'>" +
    "<option name='labelDetection' value='labelDetection' selected> labelDetection </option>" +
    "<option name='textDetection' value='textDetection'> textDetection </option>" +
    "</select>" +
    "<br/><br/>" +
    "<input type='submit' /></form>" +
    '</body></html>';

app.get('/', function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.end(form);
});

// Get the uploaded image
// Image is uploaded to req.file.path
app.post('/upload', upload.single('image'), function (req, res, next) {
    console.log(JSON.stringify(req.body));
    // Imports the Google Cloud client library
    const vision = require('@google-cloud/vision');
    // Creates a client
    const client = new vision.ImageAnnotatorClient();

    // Choose what the Vision API should detect
    // Choices are: faces, landmarks, labels, logos, properties, safeSearch, texts
    // var types = ['labels'];

    if (req.body.type == 'textDetection') {
        client
            .textDetection(req.file.path)
            .then(results => {
                const detections = results[0].textAnnotations;
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.write('<!DOCTYPE HTML><html><body>');

                // Base64 the image so we can display it on the page
                res.write('<img width=400 src="' + base64Image(req.file.path) + '"><br>');

                var mytext = '';
                detections.forEach(text => mytext += text.description);

                res.write('<textarea style="width:50%;height:800px">' + mytext + '</textarea>');

                // Delete file (optional)
                fs.unlinkSync(req.file.path);
                res.end('</body></html>');

            })
            .catch(err => {
                console.error('ERROR:', err);
            });
    } else {
        // Send the image to the Cloud Vision API
        client.labelDetection(req.file.path, function (err, detections, apiResponse) {
            if (err) {
                res.end('Cloud Vision Error');
            } else {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.write('<!DOCTYPE HTML><html><body>');
                // Base64 the image so we can display it on the page
                res.write('<img width=400 src="' + base64Image(req.file.path) + '"><br>');

                // Write out the JSON output of the Vision API
                res.write('<textarea style="width:50%;height:800px">' + JSON.stringify(detections, null, 2) + '</textarea>');

                // Delete file (optional)
                fs.unlinkSync(req.file.path);
                res.end('</body></html>');
            }
        });
    }
});

app.listen(9000);

console.log('Server Started');

// Turn image into Base64 so we can display it easily
function base64Image(src) {
    var data = fs.readFileSync(src).toString('base64');
    return util.format('data:%s;base64,%s', mime.getType(src), data);
}
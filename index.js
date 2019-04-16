async function quickstart() {
    // Imports the Google Cloud client library
    const vision = require('@google-cloud/vision');
    // Creates a client
    const client = new vision.ImageAnnotatorClient();

    client
        .textDetection('./text_test.png')
        .then(results => {
            const detections = results[0].textAnnotations;
            console.log('Text:');
            detections.forEach(text => console.log(text));
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
}

quickstart();
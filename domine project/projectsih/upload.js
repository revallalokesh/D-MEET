const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const Moralis = require("moralis").default;

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        // Serve the HTML front-end
        res.writeHead(200, { 'Content-Type': 'text/html' });
        const html = `
        <!doctype html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Bootstrap demo</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
            <link rel="stylesheet" href="satya.css">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet">
        <style>
            
        
        h1{
            font-family: anton;
            font-weight: 500;
            font-size: 50px;
        }
        
        body{
            background: url('benner.jpg'); /* Change here: Added quotes around the image URL */
            align-items: center;
            justify-content: center;
            display: flex;
            background-size: cover; 
            background-position: center;
            background-repeat: no-repeat;
            height: 528px;
        }
        
        form{
            margin-top: 60px;
            height: 400px;
            /* background-color: #7cb8c4; */
            border: 5px white solid;
            backdrop-filter: blur(10px);
            width: 400px;
            flex-direction: column;
            border-radius: 50px;
            gap: 30px;
        }
        
        .form-group{
            margin: 20px;
            padding: 20px;
        }
        
        .upload-container {
            display: flex;
            align-items: center;
        }
        
        #fileInput {
            display: none; /* Hide the file input */
        }
        
        .upload-button {
            background-color: #007bff; /* Blue color, adjust as needed */
            color: #fff; /* White text color */
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            border: none;
            outline: none;
            transition: background-color 0.3s ease;
        }
        
        .upload-button:hover {
            background-color: #0056b3; /* Darker blue on hover */
        }
        
        .upload-container{
            display: flex;
            flex-direction: column;
            margin-top: 50px;
        }
        
        .bharath{
            margin-top: 50px;
        }
        
        button{
            background-color: #203a55;
            border: #fff 2px solid;
            border-radius: 5px;
            font-size: x-large;
            color: #fff;
            padding: 10px;
        }
        </style>
        </head>
        
        <body>
            <div>
                <form action="/upload" method="post" enctype="multipart/form-data">
                    <div class="form-group">
                        <h1>IPFS File Upload</h1>
        
                        <div class="upload-container">
                            <input type="file" name="file" id="fileInput">
                            <label for="fileInput" class="upload-button">choose a file</label>
                        </div>
        
                        <div class="bharath">
                            <a href="http://127.0.0.1:3000/" style="text-decoration: none; color: #fff; width: 100%; height: 100%; display: inline-block; text-align: center;">
                                <button>Upload to Block</button>
                            </a>
                        </div>
        
                    </div>
                </form>
            </div>
        
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
        </body>
        </html>`;
        res.end(html);
    } else if (req.url === '/upload' && req.method === 'POST') {
        // Handle file upload logic
        const form = new formidable.IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error(err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'An error occurred while parsing the upload form.' }));
                return;
            }

            console.log('files:', files); // Debugging

            const file = files.file[0]; // Retrieve the first file object from the array

            // Use the original filename from the file object
            const originalFilename = file.originalFilename;

            // Ensure filePath is assigned before reading
            const filePath = file.filepath; 

            console.log('filePath:', filePath); // Debugging

            // Read the file asynchronously to avoid blocking, handling errors within the callback
            fs.readFile(filePath, { encoding: 'base64' }, (err, data) => {
                if (err) {
                    console.error(err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'An error occurred while reading the file.' }));
                    return;
                }

                const uploadArray = [
                    {
                        // Use the original filename for the IPFS path
                        path: originalFilename,
                        content: data, // Use the file data read from fs.readFile
                    },
                ];

                Moralis.start({
                    apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjlkZjlhOWMwLTc4YWItNGY4Yi1hM2FkLWQ2ZWRhNWZjYTg0ZSIsIm9yZ0lkIjoiMzU4NTIyIiwidXNlcklkIjoiMzY4NDYwIiwidHlwZUlkIjoiNTZmOTg2OTktNmM4MS00ZmE0LTkyODYtYTU0YzhhMjJiMGE2IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2OTU1MzIwMDIsImV4cCI6NDg1MTI5MjAwMn0.K0_4Rrdazc791I6yx5h0bGnpsGNfIb_ul93RvbEu6kw",
                }).then(() => {
                    Moralis.EvmApi.ipfs.uploadFolder({
                        abi: uploadArray,
                    }).then(response => {
                        console.log(response.result);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ result: response.result }));
                    }).catch(err => {
                        console.error("Upload error:", err); // Add this line for error logging
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'An error occurred during upload.' }));
                    });
                }).catch(err => {
                    console.error("Moralis initialization error:", err); // Add this line for error logging
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'An error occurred during Moralis initialization.' }));
                });
            });
        });
    } else if (req.url === '/benner.jpg') {
        // Serve the background image
        const imagePath = path.join(__dirname, 'benner.jpg');
        const image = fs.readFileSync(imagePath);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(image);
    } else {
        // Handle other routes
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page not found');
    }
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

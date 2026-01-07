import express from 'express';
import fs from 'fs';
import https from 'https';

const httpsOptions = {
  key: fs.readFileSync("C:\\certificates\\localhost.key"),
  cert: fs.readFileSync("C:\\certificates\\localhost.crt"),
};

const port = 4000;
const app = express();
app.use(express.static('public'));

const server = https.createServer(httpsOptions, app);
server.listen(port, () => {
  console.log(`HTTPS Server listening on port ${port}`);
});
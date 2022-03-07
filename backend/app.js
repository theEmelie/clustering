const express = require("express");
const port = 3000;
const app = express();
var path = require("path");

app.locals.blogDB = '../backend/blogdata/blogdata.txt';

const cluster = require('./routes/cluster');

app.use(express.json());
app.use(express.urlencoded());

app.use('/kClustering', cluster);

app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../frontend/index.html'));
});

app.use('/frontend/css', express.static('../frontend/css'));
app.use('/frontend/js/', express.static('../frontend/js/'));

const server = app.listen(port, () => console.log(`Server is listening to ${port}!`));

module.exports = server;
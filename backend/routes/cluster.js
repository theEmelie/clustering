const cluster = require("../models/cluster.js");

var express = require('express');
var router = express.Router();

router.get("/",
    (req, res) => cluster.kmeansClustering(res, req));

module.exports = router;
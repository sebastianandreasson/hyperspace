var express = require('express');
var fs = require('fs');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Hyperspace' });
});

router.post('/', function (req, res) {
//    fs.readFile(req.files.displayImage.path, function (err, data) {
//        var newPath = __dirname + "/" + req.files.displayImage.name;
//        fs.writeFile(newPath, data, function (err) {
//            if (err) throw err;
//        });
//    });
});

module.exports = router;
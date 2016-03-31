var express = require('express');
var app = express();
var mongo = require('mongodb');
var bodyParser = require('body-parser');

const connection = mongo.MongoClient
    .connect('mongodb://localhost:27017/anychart_sample')
    .then(function(db) {
        console.log("Connected correctly to mongodb server.");
        return db;
    })
    .catch(function(err) {
        console.error(err);
        process.exit(1);
    });

app.use(express.static('public'));
app.use(bodyParser.json({type: '*/json'}));

app.get('/', function (req, res) {
    res.sendfile(__dirname+'/public/index.html');
});

app.get('/data', function(req, res) {    
    connection.then(function(db){
        db.collection('probe_readings').find().toArray().then(function(documents) {
            var firstDocument = documents[0];
            var probeReadings = firstDocument['ProbeReadings'];
            res.json(probeReadings);
        })
        .catch(function(err){
            console.log(err)
        })
    })
    .catch(function(err){
        console.log(err)
    })
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('AnyChart sample app listening at http://%s:%s', host, port);
});

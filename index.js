var express = require('express');
var app = express();
var mongo = require('mongodb');
var assert = require('assert');
var async = require('async');
var bodyParser = require('body-parser');

var dbConn;

mongo.MongoClient.connect('mongodb://localhost:27000/anychart_sample', function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to mongodb server.");
    dbConn = db;
});

app.use(express.static('public'));
app.use(bodyParser.json({type: '*/json'}));

app.get('/', function (req, res) {
    res.sendfile(__dirname+'/public/index.html');
});

var asyncFind = function(collection) {
    return function(callback) {
        dbConn.collection(collection).find().toArray(callback);
    };
};

app.get('/init', function(req, res) {
    async.parallel([
        asyncFind('regions'), asyncFind('industries'), asyncFind('products'), asyncFind('sales_reps'),
        function(callback) {
            dbConn.collection('sales').aggregate([{ $group: { "_id": {$year: "$date"}}}]).toArray(callback);
        }
    ], function(err, results) {       
        res.json({
            'regions': results[0],
            'industries': results[1],
            'products': results[2],
            'sales_reps': results[3]
        });
    });
});

app.post('/data', function(req, res) {
    var filters = { $match:
                    {"product": {"$in": req.body.products.map(mongo.ObjectId)},
                     "region": {"$in": req.body.regions.map(mongo.ObjectId)},
                     "sales_rep": {"$in": req.body.sales.map(mongo.ObjectId)}}};
    async.parallel([
        function(callback) {
            dbConn.collection('sales').aggregate([
                filters,
                { $group: { _id: "$product", revenue: {$sum: "$total"} }}
            ]).toArray(callback);
        },
        function(callback) {
            dbConn.collection('sales').aggregate([
                filters,
                { $group: { _id: "$sales_rep", revenue: {$sum: "$total"} }}
            ]).toArray(callback);
        },
        function(callback) {
            dbConn.collection('sales').aggregate([
                filters,
                { $group: { _id: { quarter: {$cond: [{$lte:[{$month:"$date"},3]}, 1,
                                                     {$cond: [{$lte:[{$month:"$date"},6]}, 2,
                                                              {$cond: [{$lte:[{$month:"$date"},9]},
                                                                       3, 4]}]}]},
                                   year: {$year: "$date"}},
                            revenue: {$sum: "$total"} }}]).toArray(callback);
        }
    ], function(err, results) {
        res.json({'by_product': results[0],
                  'by_sales': results[1],
                  'by_quarter': results[2]});
    });
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('AnyChart sample app listening at http://%s:%s', host, port);
});

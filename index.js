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

app.get('/init', function(req, res) {
    connection.then(function(db){
        Promise.all([
            db.collection('regions').find().toArray(),
            db.collection('industries').find().toArray(),
            db.collection('products').find().toArray(),
            db.collection('sales_reps').find().toArray(),
            db.collection('sales').aggregate([{ $group: { "_id": {$year: "$date"}}}]).toArray()
        ])
        .then(function(results){
            res.json({
                'regions': results[0],
                'industries': results[1],
                'products': results[2],
                'sales_reps': results[3]
            });
        })
        .catch(function(err){
            console.error(err); res.send(err)
        });
    })
    .catch(function(err){
        console.log(err)
    })
});

app.post('/data', function(req, res) {
    var filters = { $match:
                    {"product": {"$in": req.body.products.map(mongo.ObjectId)},
                     "region": {"$in": req.body.regions.map(mongo.ObjectId)},
                     "sales_rep": {"$in": req.body.sales.map(mongo.ObjectId)}}};

    connection.then(function(db){
        Promise.all([
            db.collection('sales').aggregate([
                filters,
                { $group: { _id: "$product", revenue: {$sum: "$total"} }}
            ]).toArray(),
            db.collection('sales').aggregate([
                filters,
                { $group: { _id: "$sales_rep", revenue: {$sum: "$total"} }}
            ]).toArray(),
            db.collection('sales').aggregate([
                filters,
                { $group: { _id: { quarter: {$cond: [{$lte:[{$month:"$date"},3]}, 1,
                    {$cond: [{$lte:[{$month:"$date"},6]}, 2,
                        {$cond: [{$lte:[{$month:"$date"},9]},
                            3, 4]}]}]},
                    year: {$year: "$date"}},
                    revenue: {$sum: "$total"} }}]).toArray()
        ])
        .then(function(results){
            res.json({
                'by_product': results[0],
                'by_sales': results[1],
                'by_quarter': results[2]
            });
        })
        .catch(function(err){
            console.error(err); res.send(err)
        });
    })
    .catch(function(err){
        console.log(err)
    });
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('AnyChart sample app listening at http://%s:%s', host, port);
});

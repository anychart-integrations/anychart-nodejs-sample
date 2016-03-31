$(function() {
    var revenueByIndustry = anychart.data.set();
    var revenueBySales = anychart.data.set();
    var revenueByProduct = anychart.data.set();
    var revenueByQuarter;

    var createCharts = function() {
        var bar = anychart.bar(revenueByIndustry);
        bar.container("rev-by-industry");
        bar.title("Revenue by industry");
        bar.draw();

        var column = anychart.column(revenueBySales);
        column.container("rev-by-sales");
        column.title("Revenue by sales");
        column.draw();

        var pie = anychart.pie(revenueByProduct);
        pie.container("rev-by-product");
        pie.title("Revenue by product");
        pie.draw();

        revenueByQuarter = anychart.line();
        revenueByQuarter.container("rev-by-quarter");
        revenueByQuarter.title("Revenue by quarter");
        revenueByQuarter.draw();
    };

    var idMap;

    function mapNames(data, entries) {
        return data.map(function(item) {
            var entry = entries.find(function(i) {
                return item._id == i._id;
            });
            return [entry.name, item.revenue];
        });
    }

    var convertRevenueByIndustry = function(rows) {
        var industries = idMap['industries'];
        var products = idMap['products'];
        var res = {};
        for (var i = 0; i < rows.length; i++) {
            var productId = rows[i]._id;
            var product = products.find(function(i) {
                return i._id == productId;
            });
            if (res[product.industry_id])
                res[product.industry_id] += rows[i].revenue;
            else
                res[product.industry_id] = rows[i].revenue;
        }
        var results = [];
        for (var industryId in res) {
            results.push([industries.find(function(i) {
                return i._id == industryId;
            }).name, res[industryId]]);
        }
        return results;
    };

    var convertRevenueByQuarter = function(rows) {
        var res = {};
        for (var i = 0; i < rows.length; i++) {
            var year = rows[i]._id.year;
            var quarter = rows[i]._id.quarter;
            var total = rows[i].revenue;
            if (res[year] == undefined)
                res[year] = {1: 0, 2: 0, 3: 0, 4: 0};    
            res[year][quarter] = total;
        }
        var rows = [];
        for (var y in res) {
            rows.push([y, res[y][1], res[y][2], res[y][3], res[y][4]]);
        }
        return rows;
    };

    var updateDataSets = function(data) {
        revenueByIndustry.data(convertRevenueByIndustry(data["by_product"]));
        revenueBySales.data(mapNames(data["by_sales"],idMap["sales_reps"]));
        revenueByProduct.data(mapNames(data["by_product"],idMap["products"]));

        revenueByQuarter.removeAllSeries();
        var qData = convertRevenueByQuarter(data["by_quarter"]);
        revenueByQuarter.addSeries.apply(revenueByQuarter,
                                         anychart.data.mapAsTable(qData));
    };

    $.get("/init", function(data) {
        idMap = data;
        setupUI(data, function(state) {
            $.ajax({
                url: '/data',
                type: 'POST',
                data: JSON.stringify(state),
                dataType: 'json',
                contentType:"application/json; charset=utf-8",
                success: updateDataSets
            });
        });
        createCharts();
    });
});

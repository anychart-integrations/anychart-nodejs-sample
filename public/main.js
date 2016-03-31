anychart.onDocumentReady(function() {
  $.get("/data", function(data) {
        // prepare data
        data.forEach(function(item) {
          item["DateTime"] = item["Date"] + " " + item["Time"];
        });

        var dataSet = anychart.data.set(data);
        var seriesData_1 = dataSet.mapAs(null, {x: "DateTime", value: "SmokerTemp"});
        var seriesData_2 = dataSet.mapAs(null, {x: "DateTime", value: "Probe1"});
        var seriesData_3 = dataSet.mapAs(null, {x: "DateTime", value: "Probe2"});
        var seriesData_4 = dataSet.mapAs(null, {x: "DateTime", value: "Probe3"});

        var chart = anychart.line();
        chart.title("Probes");
        chart.legend(true);

        var dateScale = anychart.scales.dateTime();
        chart.xScale(dateScale);

        chart.tooltip().titleFormatter(function() {
          return anychart.format.dateTime(this["points"][0]["x"], "dd MMMM yyyy HH:mm:ss");
        });

        chart.xAxis(0).labels().textFormatter(function() {
          return anychart.format.dateTime(this['tickValue'], "dd MMMM yyyy HH:mm:ss");
        });

        var series_1 = chart.spline(seriesData_1);
        series_1.name("SmokerTemp");

        var series_2 = chart.spline(seriesData_2);
        series_2.name("Probe1");

        var series_3 = chart.spline(seriesData_3);
        series_3.name("Probe2");

        var series_4 = chart.spline(seriesData_4);
        series_4.name("Probe3");

        chart.container('container').draw();
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR, textStatus, errorThrown);
      });
});

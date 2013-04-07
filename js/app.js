

var API_BASE_URL = "http://localhost/12th-plan/api/public/";

(function () {

  var sliders = {
    original_data: {
      "macro"       : 15,
      "agriculture" : 20,
      "health"      : 10,
      "water"       : 15,
      "energy"      : 20,
      "urban"       : 20
    },

    sdata: {},

    renderSliders: function (data) {
      var x, selector;

      for (x in data) {
        if (data.hasOwnProperty(x)) {
          $(".main-sliders .slider[data-name='" + x + "']").slider({
            orientation : "vertical",
            range       : "min",
            min         : 0,
            max         : 100,
            value       : data[x],
            slide      : function (e, ui) {
              sliders.changeState($(e.target), ui.value);
            }
          });

          $(".slabels .slabel[data-name='" + x + "']").html(Math.floor(data[x]));
        }
      }

    },

    renderData: function (data) {
      var x, selector;

      for (x in data) {
        if (data.hasOwnProperty(x)) {
          $(".main-sliders .slider[data-name='" + x + "']").slider("value", data[x]);

          $(".slabels .slabel[data-name='" + x + "']").html(Math.floor(data[x]));
        }
      }
    },

    get_newdata: function (oldData, key, newValue) {
      var ratios = {}, newdata = {}, x, total = 0, difference = 0, remaining = 0;

      for (x in oldData) {
        if (oldData.hasOwnProperty(x)) {
          total = total + oldData[x];
        }
      }

      difference = total - newValue;
      remaining = total - oldData[key];

      for (x in oldData) {
        if (oldData.hasOwnProperty(x) && x != key) {
          ratios[x] = remaining > 0 ? oldData[x] / remaining : 0;
        }
      }

      for (x in oldData) {
        if (oldData.hasOwnProperty(x) && x != key) {
          newdata[x] = ratios[x] * difference;
        }
      }
      newdata[key] = newValue;

      return newdata;
    },

    changeState: function ($obj, newValue) {
      var key = $obj.data('name');
      var newData = sliders.get_newdata(sliders.sdata, key, newValue);
      sliders.renderData(newData);
      sliders.sdata = newData;
      if (key=='agriculture') {
        agriRedraw(newValue);
      }
    },

    getURLHashParameter : function(name) {

        return decodeURI((RegExp('[#|&]' + name + '=' + '(.+?)(&|$)').exec(location.hash)||[null])[1]
        );
    },

    init: function () {
      sliders.sdata = sliders.original_data;
      sliders.renderSliders(sliders.sdata);

      // bind reset
      $("#reset-main-graph").click(function () {
        sliders.renderData(sliders.original_data);
        sliders.sdata = sliders.original_data;
      });

      window.get_slider_data_for_publishing = function () {
        return sliders.sdata;
      };


      // if id given load data
      var entry_id = sliders.getURLHashParameter('id');

      if (entry_id != "undefined") {
        $.ajax({
            type       : "GET",
            url        : API_BASE_URL + "entries/get/" + entry_id,
            dataType   : "json",
            statusCode : {
                200: function(entry) {
                    var ndata = eval("(" + entry.data + ")");

                    var x;

                    for (x in ndata) {
                      if (ndata.hasOwnProperty(x)) {
                        ndata[x] = parseFloat(ndata[x]);
                      }
                    }

                    sliders.sdata = ndata;

                    sliders.renderData(ndata);
                },
                404: function() {
                    // entry not found
                }
            }
        });
      }

    }
  };

  $(document).ready(sliders.init);

}());


(function () {

  var _abc = {
    submit: function () {
      $.ajax({
          type : "POST",
          url  : API_BASE_URL + "entries/add",
          data : {
              email       : $(".publish-form form input[name='email']").val(),
              name        : $(".publish-form form input[name='name']").val(),
              description : $(".publish-form form textarea[name='description']").val(),
              data        : get_slider_data_for_publishing()
          },
          dataType   : "json",
          statusCode : {
              201: function(data) {
                  var entry_id = data.id;

                  window.location = window.location.pathname + "#id=" + entry_id;

                  $(".publish-form").modal("hide");
              },
              400: function(data) {
                  // some validation error
                  // data is an array of error messages
                  alert("Please enter all required fields");
              }
          }
      });
    },

    init: function () {
      $(".publish-form").modal({
        show: false
      });

      $(".publish-button").click(function () {
        $(".publish-form").modal("show");
      });

      $(".publish-form form").submit(function () {
        _abc.submit();
      });
    }
  };

  $(document).ready(_abc.init);

}());


// Grouped Bar Charts
samples = ["11th Plan", "12th Plan Proposed", "Your Allocation"];
sample_data = [["87", "92"], ["93", "92"], ["92", "85"]];


agri_sectors = [{name:"Department of Agriculture and Cooperation", code:'DAC', ratio:40.9793784889786},
{name:"Department of Agricultural Research and Education", code:'DARC', ratio:14.6453994199842},
{name:"Department of Animal Husbandry, Dairying, and Fisheries", code:'DADF', ratio:8.12652598035282},
{name:"Rashtriya Krishi Vikas Yojana", code:'RKVJ', ratio:36.2486961106844}];

agriculture = [['38003','9989','4970','22426'],['71500','25553','14179','63246'],['71500','25553','14179','63246']];
var agriVis;
var n = 4, // number of samples
m = 3; // number of series
var w = 500,
h = 300,
x = d3.scale.linear().domain([0, 100000]).range([0, h]),
y0 = d3.scale.ordinal().domain(d3.range(n)).rangeBands([0, w], .2),
y1 = d3.scale.ordinal().domain(d3.range(m)).rangeBands([0, y0.rangeBand()]),
colors = ["#a4d199", "#65b252", "#437936"];

function agriDraw() {

  agriVis = d3.select("#macro1")
  .append("svg:svg")
  .append("svg:g")
  .attr("transform", "translate(50,25)");

  var g = agriVis.selectAll("g")
  .data(agriculture)
  .enter().append("svg:g")
  .attr("fill", function(d, i) { return colors[i]; })
  .attr("sample", function(d, i) {return samples[i]})
  .attr("transform", function(d, i) { return "translate(" + y1(i) + ",0)"; });

  var rect = g.selectAll("rect");

  rect
  .data(function(agriculture){return agriculture;})
  .enter().append("svg:rect")
  .attr("transform", function(d, i) { return "translate(" + y0(i) + ",0)"; })
  .attr("width", y1.rangeBand())
  .attr("height", x)
  .attr("value", function(d, i) {return d;})
  .transition()
  .delay(50)
  .attr("y", function(d) { return h - x(d); });

  agriVis.selectAll("rect").each(function(d,i) {$(this).tipsy({gravity: 's', title: function(){
    div = d3.select(this);
    parent_svgg = d3.select(div.node().parentNode);
    return parent_svgg.attr('sample')+': '+String($(this).attr('value'));
  }})});

  var text = agriVis.selectAll("text")
  .data(d3.range(n))
  .enter().append("svg:text")
  .attr("class", "group")
  .attr("transform", function(d, i) { return "translate(" + y0(i) + ",0)"; })
  .attr("x", y0.rangeBand() / 2)
  .attr("y", h+6)
  .attr("dy", ".71em")
  .attr("text-anchor", "middle")
  .text(function(d, i) { return agri_sectors[i].code });
}

function agriRedraw(newValue) {
  new_data = [];
  for(var i=0; i<4; i++){
    new_data.push(agri_sectors[i].ratio * newValue);
  }

  newAgridata = agriculture;
  newAgridata.pop();
  newAgridata.push(new_data);
  var g = agriVis.selectAll("g");
  g.data(newAgridata)
  .attr("fill", function(d, i) { return colors[i]; })
  .attr("transform", function(d, i) { return "translate(" + y1(i) + ",0)"; });

  g.selectAll("rect")
  .data(function(newAgridata){return newAgridata;})
  .attr("transform", function(d, i) { return "translate(" + y0(i) + ",0)"; })
  .attr("width", y1.rangeBand())
  .attr("height", x)
  .transition()
  .delay(50)
  .attr("y", function(d) { return h - x(d); });
}

//  $(function() {
//   $( "#slider-macro" ).slider({
//     orientation: "vertical",
//     range: "min",
//     min: 0,
//     max: 100,
//     value: 60,
//     slide: function( event, ui ) {
//       console.log(ui.value);
//     }
//   });
// });


// var margin = {top: 20, right: 20, bottom: 30, left: 60},
//     width = 600 - margin.left - margin.right,
//     height = 400 - margin.top - margin.bottom;

// var formatPercent = d3.format(".0%");

// var x = d3.scale.ordinal()
//     .rangeRoundBands([0, width], .1);

// var y = d3.scale.linear()
//     .range([height, 0]);

// var xAxis = d3.svg.axis()
//     .scale(x)
//     .orient("bottom");

// var yAxis = d3.svg.axis()
//     .scale(y)
//     .orient("left");

// var svg = d3.select("#chart").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// d3.csv("data/data.csv", function(data) {

//   data.forEach(function(d) {
//     d.value = +d.value;
//   });

//   x.domain(data.map(function(d) { return d.sector; }));
//   y.domain([0, 100]);

//   svg.append("g")
//       .attr("class", "x axis")
//       .attr("transform", "translate(0," + height + ")")
//       .call(xAxis);

//   svg.append("g")
//       .attr("class", "y axis")
//       .call(yAxis)
//     .append("text")
//       .attr("transform", "rotate(-90)")
//       .attr("y", 6)
//       .attr("dy", ".71em")
//       .style("text-anchor", "end")
//       .text("Value %");

//   svg.selectAll(".bar")
//       .data(data)
//     .enter().append("rect")
//       .attr("class", "bar")
//       .attr("x", function(d) { return x(d.sector); })
//       .attr("width", x.rangeBand())
//       .attr("y", function(d) { return y(d.value); })
//       .attr("height", function(d) { return height - y(d.value); });

// });



// var valueLabelWidth = 40; // space reserved for value labels (right)
// var barHeight = 40; // height of one bar
// var barLabelWidth = 100; // space reserved for bar labels
// var barLabelPadding = 5; // padding between bar and bar labels (left)
// var gridLabelHeight = 25; // space reserved for gridline labels
// var gridChartOffset = 3; // space between start of grid and first bar
// var maxBarWidth = 420; // width of the bar with the max value

// d3.csv('data/data.csv', function(data) {
// // accessor functions
// var barLabel = function(d) { return d['sector']; };
// var barValue = function(d) { return parseFloat(d['value']); };

// // scales
// var yScale = d3.scale.ordinal().domain(d3.range(0, data.length)).rangeBands([0, data.length * barHeight]);
// var y = function(d, i) { return yScale(i); };
// var yText = function(d, i) { return y(d, i) + yScale.rangeBand() / 2; };
// var x = d3.scale.linear().domain([0, 100]).range([0, maxBarWidth]);

// // svg container element


// var chart = d3.select('#chart').append("svg")
//   .attr('width', maxBarWidth + barLabelWidth + valueLabelWidth)
//   .attr('height', gridLabelHeight + gridChartOffset + data.length * barHeight);
// // grid line labels
// var gridContainer = chart.append('g')
//   .attr('transform', 'translate(' + barLabelWidth + ',' + gridLabelHeight + ')');
// gridContainer.selectAll("text").data(x.ticks(10)).enter().append("text")
//   .attr("x", x)
//   .attr("dy", -3)
//   .attr("text-anchor", "middle")
//   .text(String);
// // vertical grid lines
// gridContainer.selectAll("line").data(x.ticks(10)).enter().append("line")
//   .attr("x1", x)
//   .attr("x2", x)
//   .attr("y1", 0)
//   .attr("y2", yScale.rangeExtent()[1] + gridChartOffset)
//   .style("stroke", "#ccc");
// // bar labels
// var labelsContainer = chart.append('g')
//   .attr('transform', 'translate(' + (barLabelWidth - barLabelPadding) + ',' + (gridLabelHeight + gridChartOffset) + ')');
// labelsContainer.selectAll('text').data(data).enter().append('text')
//   .attr('y', yText)
//   .attr('stroke', 'none')
//   .attr('fill', 'black')
//   .attr("dy", ".35em") // vertical-align: middle
//   .attr('text-anchor', 'end')
//   .text(barLabel);
// // bars
// var barsContainer = chart.append('g')
//   .attr('transform', 'translate(' + barLabelWidth + ',' + (gridLabelHeight + gridChartOffset) + ')');
// barsContainer.selectAll("rect").data(data).enter().append("rect")
//   .attr('y', y)
//   .attr('height', yScale.rangeBand())
//   .attr('width', function(d) { return x(barValue(d)); })
//   .attr('stroke', 'white')
//   .attr('fill', 'steelblue');
// // bar value labels
// barsContainer.selectAll("text").data(data).enter().append("text")
//   .attr("x", function(d) { return x(barValue(d)); })
//   .attr("y", yText)
//   .attr("dx", 3) // padding-left
//   .attr("dy", ".35em") // vertical-align: middle
//   .attr("text-anchor", "start") // text-align: right
//   .attr("fill", "black")
//   .attr("stroke", "none")
//   .text(function(d) { return d3.round(barValue(d), 2); });
// // start line
// barsContainer.append("line")
//   .attr("y1", -gridChartOffset)
//   .attr("y2", yScale.rangeExtent()[1] + gridChartOffset)
//   .style("stroke", "#000");
// });


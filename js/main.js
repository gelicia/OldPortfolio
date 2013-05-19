var data = [];

function init(){
  var dateParse = d3.time.format("%m/%Y").parse;

  var ds = new Miso.Dataset({
    importer : Miso.Dataset.Importers.GoogleSpreadsheet,
    parser : Miso.Dataset.Parsers.GoogleSpreadsheet,
    key : "0AnBqfBIBraOLdFdKOUJZZkYwdnRJRGFjcGV6RzBPb2c",
    worksheet : "1"
  });

  ds.fetch({ 
    success : function() {
      this.each(function(row){ data.push(row); });
      //add a full data attribute
      data = data.map(function(d){d.fullDate = dateParse(d.date); return d;});
      console.log(data);
    },
    error : function() {
      console.log("Error loading the spreadsheet");
    }
  });

}

/*var dateParse = d3.time.format("%m/%Y").parse;

var dataRaw = [{name: "date1", date: "5/2012"},
            {name: "date2", date: "08/2012"},
            {name: "date3", date: "01/2013"},
            {name: "date4", date: "02/2013"},
            {name: "date5", date: "03/2013"},
            {name: "date6", date: "04/2013"}];

var data = dataRaw.map(function(d){return {name: d.name, date: dateParse(d.date)}})

//style
var sideMar = 47;
var margin = {top: 68, left: sideMar, right: sideMar};
var lastDate;
var svg = d3.select('svg');
var tributary= {sw: 1000};
svg.append('line')
.attr({
  x1: margin.left,
  y1: margin.top,
  x2: tributary.sw - (margin.right+margin.left),
  y2: margin.top,
  "stroke": "black"
});

var minDate = d3.min(data, function(d){return d.date});
var d = new Date();

var timeScale = d3.time.scale().domain([minDate, dateParse(d.getMonth()+1 +"/" + d.getFullYear())]).range([margin.left, tributary.sw - (margin.left + margin.right)]);

var monthAxis = d3.svg.axis().scale(timeScale)
	.tickFormat(d3.time.format("%b"))
	.ticks(d3.time.months, 1);

var yearAxis = d3.svg.axis().scale(timeScale)
	.tickFormat(d3.time.format("%Y"))
	.ticks(d3.time.years, 1)
 
svg.append("g")
	.attr({
      "transform": "translate(0," + (margin.top - 35) + ")",
      "class": "scaleStyle"
    })
    .call(monthAxis); 

svg.append("g")
	.attr({
      "transform": "translate(0," + (margin.top - 60) + ")",
      "class": "yearStyle"
    })
    .call(yearAxis); 

var circles = svg.selectAll('circle')
.data(data).
enter()
.append("circle")
.attr({
  cx: function(d){return timeScale(d.date);},
  cy: margin.top,
  r: 7,
  stroke: "black",
  fill: "steelblue",
  id: function(d,i){return "pt" + (dataRaw[i].date).replace('/', '');}
})
.on("click", function(d,i) { return displayInfo(d.date); })
.on("mouseover", function(d,i) {
  d3.select("#pt" + (dataRaw[i].date).replace('/', ''))
  .attr("r","10");
})
.on("mouseout", function(d,i) {
  d3.select("#pt" + (dataRaw[i].date).replace('/', ''))
  .attr("r","7");
});

circles.append('title')
.text(function(d, i){ return dataRaw[i].date + " - " + d.name;});

function displayInfo(date){

  var infoGroup = svg.select("g#infoGroup");
  var rect;
  
  //If it is the second click (the info exists), 
  //transition to remove it and rerun the function to redraw
  if (infoGroup[0][0] !== null){
    rect = d3.select("g#infoGroup > rect");
    
    rect.transition()
    .duration(250)
    .ease("linear")
    .attr({
      height: 0
    })
    .each("end", function(){
      infoGroup.remove(); 
      if (date !== lastDate){
        displayInfo(date);
      }
    });
    
  }
  else {
    infoGroup = svg.append("g")
    .attr({"transform" : "translate(" + margin.left + "," + (margin.top + 30) + ")",
           "id":"infoGroup"
          });
    
    rect = infoGroup.append('rect')
    .attr({
      x: 0,
      y: 0,
          width : tributary.sw - (margin.left*2) - margin.right,
      height: 0,
      rx: 10,
      fill: 'white',
      "stroke-width": 4,
      "stroke":"steelblue"
    })
    .transition()
    .duration(250)
    .ease("linear")
    .attr({
      height: 300
    });
    
    lastDate = date;
  }
}}*/
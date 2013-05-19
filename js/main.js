var data = [];
var lastDate; //save the last clicked date so a double click closes the item

function init(){
  var loadPromise = dataLoad();
  loadPromise.done(
    function(){
      drawTimeline();
    }
  );
}

function dataLoad(){
  var def = $.Deferred();
  var dateParse = d3.time.format("%m/%Y").parse;

  var ds = new Miso.Dataset({
    importer : Miso.Dataset.Importers.GoogleSpreadsheet,
    parser : Miso.Dataset.Parsers.GoogleSpreadsheet,
    key : "0AnBqfBIBraOLdFdKOUJZZkYwdnRJRGFjcGV6RzBPb2c",
    worksheet : "1"
  });

  ds.fetch({ 
    success : function() {
      //put each row of the google doc in an array of objects
      this.each(function(row){ data.push(row); });
      //nest the array with the date as a key
      data = d3.nest()
        .key(function(d) {return d.date;})
        .entries(data);
      //format the data date key to be a real date for the timescale
      data = data.map(function(d){d.fullDate = dateParse(d.key); return d;});
      def.resolve();
    },
    error : function() {
      console.log("Error loading the spreadsheet");
      def.resolve();
    }
  });  
  return def.promise();
}

function drawTimeline(){
  var svg = d3.select('svg');
  //this is the margin for the line of the bar chart. All labels need to fit above it
  var margin = {top: 50, left: 20, right: 20};
  var screenWidth = parseInt(svg.style("width"), 10);

  //min and max dates for the timeline
  var minDate = d3.min(data, function(d){return d.fullDate;});
  //get today's date (max value) and reset it to being the first of the month
  var maxDate = new Date();
  maxDate.setDate(1);
  maxDate.setHours(0,0,0,0);

  var timeScale = d3.time.scale().domain([minDate, maxDate]).range([margin.left, screenWidth - (margin.left + margin.right)]);

  var monthAxis = d3.svg.axis().scale(timeScale)
    .tickFormat(d3.time.format("%b"))
    .ticks(d3.time.months, 1);

  var yearAxis = d3.svg.axis().scale(timeScale)
    .tickFormat(d3.time.format("%Y"))
    .ticks(d3.time.years, 1);

  //draw the timeline line
  svg.append('line')
  .attr({
    x1: margin.left,
    y1: margin.top,
    x2: screenWidth - (margin.right+margin.left),
    y2: margin.top,
    "stroke": "black"
  });

  //Draw month and year labels for the timeline
  svg.append("g")
  .attr({
      "transform": "translate(0," + (margin.top - 30) + ")",
      "class": "monthScale"
    })
    .call(monthAxis); 
  svg.append("g")
  .attr({
      "transform": "translate(0," + (margin.top - 50) + ")",
      "class": "yearScale"
    })
    .call(yearAxis); 

  var circles = svg.selectAll('circle')
    .data(data)
    .enter()
    .append("circle")
    .attr({
      cx: function(d){return timeScale(d.fullDate);},
      cy: margin.top,
      r: 7,
      stroke: "black",
      fill: "#57AFC0",
      id: function(d){return "pt" + (d.key).replace('/', '');}
    })
    .on("click", function(d) { return displayInfo(d.key); })
    .on("mouseover", function(d,i) {
      d3.select("#pt" + (d.key).replace('/', ''))
        .attr("r","10");
    })
    .on("mouseout", function(d,i) {
      d3.select("#pt" + (d.key).replace('/', ''))
      .attr("r","7");
    });

    /*circles.append('title')
    .text(function(d, i){ return dataRaw[i].date + " - " + d.name;});*/

    //displayInfo(mindate);
}

function displayInfo(date){
  //if undo the click change to the last clicked circle
  if (lastDate !== undefined){
    d3.select("#pt" + (lastDate).replace('/', ''))
      .attr("fill","#57AFC0");
  }
  //preform the click change to this circle
  d3.select("#pt" + (date).replace('/', ''))
      .attr("fill","#fff");

  var dateDetails = d3.select("#dateDetails");

  //if there is something displayed, clear it out
  if (dateDetails[0][0].innerHTML !== ""){
    dateDetails[0][0].innerHTML = "";
    //if the click is not the second click of the same date, display the date (post removal)
    if (date !== lastDate){
      displayInfo(date);
    }
    else {
      //if it's the second click to the circle, undo the click change to it
      d3.select("#pt" + (date).replace('/', ''))
      .attr("fill","#57AFC0");
    }
  }
  else {
    var dateData = data.filter(function(d){return d.key == date;})[0].values;
/*
<div>
  <div class="floatLeft"><img src="./img/portfolioThumbs/area.png"></div>
  <div class="clearfix"><p>sdfsfdsdfsfdsfdsfd<p></div>
</div>
*/
    for (var i = 0; i < dateData.length; i++) {
      var mainDiv = dateDetails.append("div");
      var imgDiv = mainDiv.append("div").classed((i%2===0?"floatLeft":"floatRight"), true);
      var contDiv = mainDiv.append("div").classed("clearfix", true);

      var para = contDiv.append("p").classed((i%2===0?"textLeft":"textRight"),true);

      para.text(dateData[i].description);

      if (dateData[i].picture !== null){
        imgDiv.append("img").attr({
          "src" : "./img/portfolioThumbs/" + dateData[i].picture
         })
        .classed("entryImg", true);
      } 
    }

    lastDate = date;
  }
}

/*


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
  }*/
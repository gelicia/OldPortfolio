var data = [];
var lastDate; //save the last clicked date so a double click closes the item

$(document).keydown(function(e){
  if (e.keyCode == 37 || e.keyCode == 39){
    var newIdx;
    if (lastDate === undefined){
      newIdx = e.keyCode == 37? data.length-1 : 0;
    }
    else {
      newIdx = findIdx(lastDate); // find the index of the last pressed date

      if (newIdx===0 && e.keyCode == 37){ //if it's at the beginning and you're going back, go to the end
        newIdx = data.length-1;
      }
      else if (newIdx==data.length-1 && e.keyCode == 39){ //if it's at the end and you're going forward, go to the start
        newIdx = 0;
      }
      else {
        newIdx += (e.keyCode==37? -1 : 1); //otherwise, go the way that makes sense
      }
    }
    displayInfo(data[newIdx].key);
    return false;
  }
});

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
      //make sure it's sorted (we're going to be going forward and backward via keystroke)
      data = data.sort(function(a, b){
        if (a.fullDate < b.fullDate){
          return -1;
        }
        else {
          return 1;
        }
      });
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
      lastDate = undefined;
    }
  }
  //if there is nothing displayed, display it
  else {
    var dateData = data.filter(function(d){return d.key == date;})[0].values;

    for (var i = 0; i < dateData.length; i++) {
      var mainDiv = dateDetails.append("div");
      var imgDiv = mainDiv.append("div").classed((i%2===0?"floatLeft":"floatRight"), true);
      var contDiv = mainDiv.append("div").classed("clearfix", true);
      var descDiv = contDiv.append("div").classed((i%2===0?"textLeft":"textRight"),true);

      var descPara = descDiv.append("p");
      descPara.text(dateData[i].description);

      var urlSect = descDiv.append("p");

      if (dateData[i].sourceURL == dateData[i].url){
        urlSect.append("a")
          .attr("href", dateData[i].url)
          .text("View Visualization with Source");
      }
      else {
        if (dateData[i].url !== null){
          var urlText;
          if (dateData[i].category == "presentation"){
            urlText = "View Slides";
          }
          else {
            urlText = "View Visualization";
          }
          urlSect.append("a")
            .attr("href", dateData[i].url)
            .text(urlText)
            .classed("descLink", true);
        }

        if (dateData[i].sourceURL !== null){
          urlSect.append("a")
            .attr("href", dateData[i].sourceURL)
            .text("Source Repo")
            .classed("descLink", true);
        }

        if (dateData[i].otherRefURL !== null){
          urlSect.append("a")
            .attr("href", dateData[i].otherRefURL)
            .text(dateData[i].otherRefLabel)
            .classed("descLink", true);
        }
      }
      
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

function findIdx(key){
  for (var i = 0; i < data.length; i++) {
    if (data[i].key == key){
      return i;
    }
  }

  return -1;
}
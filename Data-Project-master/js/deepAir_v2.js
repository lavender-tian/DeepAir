var map = new L.map('beijingMap').setView([39.904202, 116.407394], 9);
var layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
map.addLayer(layer);

var color = ["#3288bd","#99d594","#e6f598","#fee08b","#fc8d59","#d53e4f"];

  var getCurColor = function(con){
    var color_cur;
    if(0 <= con && con <= 50){
      color_cur = color[0];
    }else if(51 <= con && con <=100){
      color_cur = color[1];
    }else if(101 <= con && con <=150){
      color_cur = color[2];
    }else if(151 <= con && con <= 200){
      color_cur = color[3];
    }else if(201 <= con && con <= 300){
      color_cur = color[4];
    }else{
      color_cur = color[5];
    }
    return color_cur;
  }

  var getExtent = function(con){
    var e;
    if(0 <= con && con <= 50){
      e = "Good";
    }else if(51 <= con && con <=100){
      e = "Moderate"
    }else if(101 <= con && con <=150){
      e = "Unhealthy for Sensitive Groups";
    }else if(151 <= con && con <= 200){
      e = "Unhealthy";
    }else if(201 <= con && con <= 300){
      e = "Very Unhealthy";
    }else{
      e = "Hazardous";
    }
    return e;
  }
  var hourFormat = d3.time.format('%H'),
      dayFormat = d3.time.format('%j'),
      timeFormat = d3.time.format('%m/%d/%y %H:%M'),
      monthDayFormat = d3.time.format('%m/%d');
  var itemSize = 18,
      cellSize = itemSize - 1;
  var dateExtent = null,
      historyPM25 = null,
      dayOffset = 0,
      dailyValueExtent = {};
  var axisHeight = 0,
      axisWidth = itemSize * 24,
      yAxisScale = d3.time.scale(),
      yAxis = d3.svg.axis().orient('left')
        .ticks(d3.time.days,2)
        .tickFormat(monthDayFormat),
      xAxisScale = d3.scale.linear()
        .range([0,axisWidth])
        .domain([0,24]),
      xAxis = d3.svg.axis().orient('top')
        .ticks(5)
        .tickFormat(d3.format('02d'))
        .scale(xAxisScale);

  var display_12 = function(id){

    var time = [1,2,3,4,5,6,7,8,9,10,11,12];
    var margin = 30;
    var width = 500 -  margin;
    var height = 500 -  margin;

    var svg = d3.select("#svgPM25").append("svg").attr("id","svgHeat")
      .attr("width",width + margin )
      .attr("height",height + margin)
      .attr("transform","translate(0," + 1.5*margin +")");

// var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

// svg.append("g")
// .attr("class","x axis")
// .attr("transform","translate("+ margin + "," +height + ")")
// .call(xAxis);

    var superText = "PM2.5 " + "\u03BC" +"g/m^3";

    d3.csv("historyValue12.csv",function(error,historyPM25){
      // xScale.domain([0,d3.max(historyPM25,function(d){return d.PM25})+50]);
      
      // historyPM25 = historyPM25;
      var station = historyPM25.filter(function(d){
        return d.stationId == id;
      });
      station.forEach(function(d){
        d.PM25 = +d.PM25;
      });

      var xScale = d3.scale.linear().range([0,width-2*margin]).domain([0,d3.max(station,function(d){
      return d.PM25;
    })]);

      var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

      var padding = height - 1.8 * margin;
      svg.append("g").attr("class","x")
      .attr("transform","translate("+1.5*margin+","+padding+")").call(xAxis)
      .append("text")
      .attr("class","label")
      .attr("x",width-4*margin)
      .attr("y",-6)
      .style("text-anchor","start")
      .text(superText);

      var yScale = d3.scale.ordinal().rangeRoundBands([0,height-3*margin],.05);
      var yAxis = d3.svg.axis().scale(yScale).orient("left");

      yScale.domain(time.map(function(d){
          return d;
      }));

      var paddingT = 0.8*margin;
      svg.append("g").attr("class","y")
        .call(yAxis)
        .selectAll("text")
        // .attr("class","label")
        .style("text-anchor","end")
        .attr("dx",".2em")
        .attr("dy",".55em")
        .attr("transform","translate("+ paddingT + ",20)");

        svg.append("text")
        // .attr("transform","rotate(-90)")
        .attr("y",12)
        .attr("x",5)
        .text("Time");

    var barGroup = svg.selectAll(".bar")
         .data(station)
         .enter()
         .append("g");
    barGroup.append("rect")
        .attr("class","bar")
        .attr("x", 1.5*margin)
        .attr("y",function(d,index){
          return (index+1) * height / 12*0.8; 
        })
        .attr("width",function(d){
          return xScale(d.PM25);
        })
        .attr("height",height/12 * 0.5)
        .style("fill",function(d){
          return getCurColor(d.PM25);
        });

    barGroup.append("text")
      .attr("x",function(d){
        return xScale(d.PM25)+1.5*margin+5;
      })
      .attr("y",function(d,index){
        return height / 12*0.7 + yScale(index+1) + yScale.rangeBand()/2;
      })
      .text(function(d){
        return d.PM25;
      })
      .style("text-anchor","start");

    var line = d3.svg.line()
      .x(function(d){
        return xScale(d.PM25);
      })
      .y(function(d,index){
        return height / 12*0.6 + yScale(index+1) + yScale.rangeBand()/2;
      })
      .interpolate("cardinal");

    barGroup.append("path").attr("class","line").attr("d",line(station));
    
    barGroup.append("circle")
      .attr("class","dot")
      .attr("cx",function(d){
        return xScale(d.PM25);
      })
      .attr("cy",function(d,index){
        return height / 12*0.6 + yScale(index+1) + yScale.rangeBand()/2;
      })
      .attr("r",3);
  });
}

  // var display = function(id){

  //   var svgDisplay = d3.select("#svgPM25").append("svg").attr("id","svgHeat")
  //       .attr("width",500).attr("height",500)
  //       .append('g');
  //       // .attr('transform','translate('+25+','+20+')');
  // var rect = null;
  //   d3.csv("historyValue.csv",function(error,historyPM25){
  //     historyPM25 = historyPM25;
  //     historyPM25.forEach(function(d){
  //       d['date'] = timeFormat.parse(d.time);
  //       var day = monthDayFormat(d['date']);
  //       var dayData = dailyValueExtent[day] = (dailyValueExtent[day] || [1000,-1]);
  //       var pmValue = +d.PM25;
  //       dayData[0] = d3.min([dayData[0],pmValue]);
  //       dayData[1] = d3.max([dayData[1],pmValue]);
  //     });
  //     dateExtent = d3.extent(historyPM25,function(d){
  //       return d.date;
  //     });
  //     console.log(dateExtent);
  //     axisHeight = itemSize*(dayFormat(dateExtent[1])-dayFormat(dateExtent[0])+1);
  //   //render axises
  //   yAxis.scale(yAxisScale.range([0,axisHeight]).domain([dateExtent[0],dateExtent[1]]));  
  //   svgDisplay.append('g')
  //     .attr('transform','translate('+50+','+70+')')
  //     .attr('class','y axis')
  //     .call(yAxis)
  //   .append('text')
  //     .text('time')
  //     .attr('transform','translate(400' + ',-10)');

  //   svgDisplay.append('g')
  //     .attr('transform','translate('+47+','+70+')')
  //     .attr('class','x axis')
  //     .call(xAxis)
  //   .append('text')
  //     .text('date')
  //     .attr('transform','translate(-30,130)');

  //   //render heatmap rects
  //   dayOffset = dayFormat(dateExtent[0]);
  //   rect = svgDisplay.selectAll('rect')
  //     .data(historyPM25)
  //   .enter().append('rect')
  //     .attr('width',cellSize)
  //     .attr('height',cellSize)
  //     .attr('y',function(d){
  //       return 70+itemSize*(dayFormat(d.date)-dayOffset);
  //     })
  //     .attr('x',function(d){            
  //       return 50+hourFormat(d.date)*itemSize;
  //     })
  //     .attr('fill',function(d){
  //       return getCurColor(+d.PM25);
  //     });

  //     svgDisplay.append("text")
  //       .text("Olympic Center")
  //       .attr("x",200)
  //       .attr("y",30)

  //   })

  // }

  d3.csv("stations.csv",function(error,station){
    station.forEach(function(d,index){
      setTimeout(function(){
      d.lat = +d.lat;
      d.lng = +d.lng;
      d.v = +d.v;
      // var url = "https://api.waqi.info/feed/geo:" + d.lat + ";" + d.lng + "/?token=d1866be433444f23ed10112eb1378c6fdaa09610";
        // console.log(url);
        // fetch(url).then(response => {
        //   return response.json();
        // }).then(data => {
          // var con = +data.data.iaqi.pm25.v;
          // var time = data.data.time.s;
          // var location = data.data.city.name
          var con = d.v;
          var time = d.time;
          var location = d.id;
          console.log(con);
          var color_cur = getCurColor(con);
          var extent = getExtent(con);
          
          var marker = L.circleMarker([d.lat,d.lng],{
          id:d.id,
          color: color_cur,
          fillColor: color_cur,
          fillOpacity: 2,
          radius: 15,
      	  clickable: true}).addTo(map).bindTooltip(con.toString(),{permanent:true,direction:'center',opacity:0.5,className:"label"});

      	  // marker.on('click',display_12);
          var popupOptions = {
            'className':'popupCustom'
          }
          var popupContent = "<p><strong>Location: </strong>" + d.id + "</p><p><strong>Air Quality: </strong>" + extent + "</p>" + "<p><strong>Time: </strong>" + time + "</p>"
          marker.bindPopup(popupContent,popupOptions);
          marker.on('mouseover',function(e){
            display_12(this.options.id);
            this.openPopup();
          });
          marker.on('mouseout',function(e){
            var rmv = document.getElementById("svgHeat");
            if(rmv != null){
            rmv.remove();
            }
            this.closePopup();
          })
      // })
    },10 * (index + 1));
  });
})
  var colorScale = d3.scale.threshold().domain([0,50,100,150,200,300]).range(color);

  var svgLegend = d3.select("#svgLegend").append("svg")
        .attr("width",120).attr("height",500);
  
  var legend = svgLegend.selectAll(".legend")
        .data(color)
        .enter().append("g")
        .attr("class","legend");
  
  legend.append("rect")
    .attr("x",10)
    .attr("y",function(d,i){
      return 30+50*i;
    })
    .attr("width",15)
    .attr("height",50)
    .style("fill",function(d,i){
      return color[i];
    });

    legend.append("text")
      .text(function(d,i){
        return i * 50;
      })
      .attr("x",30)
      .attr("y",function(d,i){
        return 50+50*i;
      })
      .attr("text-anchor","center");
      var superText = "PM2.5 " + "\u03BC" +"g/m^3";
    legend.append("text")
      .attr("class","label")
      .attr("x",15)
      .attr("y",20)
      .text(superText);



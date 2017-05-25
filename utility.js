  function openTag(evt, TagName){
          var i, tablecontent, tablinks;

          tablecontent = document.getElementsByClassName("tabcontent");
          for ( i = 0; i < tablecontent.length; i++) {
            //console.log("asd");
            tablecontent[i].style.display = "none";
          }
          tablinks = document.getElementsByClassName("tablinks")
          for ( i = 0; i < tablinks.length; i++) {
            //console.log("asd");
            tablinks[i].className = tablinks[i].className.replace(" active", "");
          }
          document.getElementById(TagName).style.display = "block";
          evt.currentTarget.className += " active";
  }



  function openForcast(evt, TagName, lng, lat){
    openTag(evt, TagName);

    $.getJSON(url_forcast1 + lat + url_forcast2 + lng + url_forcast3, function(data) {
      var dateTime = [];
      var tempLabel = [];
      var temperature = [];
      var weather = [];
      var iconLink = [];
      var pop = [];
      var icon = [];
      var dir = ['/img/cloud_day/', '/img/cloud_night/', '/img/cloud_day/'];
      if(data.time.startPeriodName[0] == "Tonight" || data.time.startPeriodName[0] == "Overnight"){
        dir[0] = '/img/cloud_night/';
        dir[1] = '/img/cloud_day/';
        dir[2] = '/img/cloud_night/'
      }

      for( var i = 0; i < 3; i++){
          dateTime.push(data.time.startPeriodName[i]);
          tempLabel.push(data.time.tempLabel[i]);
          temperature.push(data.data.temperature[i]);
          weather.push(data.data.weather[i]);
          iconLink.push(data.data.iconLink[i]);
          pop.push(data.data.pop[i]);

          var index;
          if (weather[i].indexOf('then') != -1){
              index = weather[i].indexOf('then') - 1;
          }else if (weather[i].indexOf('and') != -1){
              index = weather[i].indexOf('and') - 1;
          }else{
              index = weather[i].length;
          }
          weather[i] = weather[i].substring(0,index);
          // console.log(weather[i].substring(0,index));

          if(pop[i]){
              icon[i] = weather[i].toLowerCase();
              if(icon.indexOf('thunderstorms') != -1){
                  icon[i] = dir[i] + "thunderstorm_" +pop[i] + ".png";
              }else{
              icon[i] = dir[i] + "rain_" + pop[i] + ".png";
              }
          }else{
              icon[i] = weather[i].toLowerCase();
              if(icon[i].indexOf('sprinkles') != -1 || icon[i].indexOf('drizzle') != -1){
                  icon[i] = dir[i] + "sprinkles.png";
              }else{
                  icon[i] = dir[i] + icon[i].replace(/ /g,"_") + ".png";
              }
          }
    }
      // console.log(icon);

      var tempColor0;
      var tempColor1;
      var tempColor2;
      
      if (tempLabel[0] == 'High') {
        tempColor0 = "<span style='display:block; text-align:center; color:red'>" + tempLabel[0] + ": " + temperature[0] + " &#8457</span>";
      }else{
        tempColor0 = "<span style='display:block; text-align:center; color:blue'>" +tempLabel[0] + ": " + temperature[0] + " &#8457</span>";
      }

      if (tempLabel[1] == 'High') {
         tempColor1 = "<span style='display:block; text-align:center; color:red'>" + tempLabel[1] + ": " + temperature[1] + " &#8457</span>";
      }else{
         tempColor1 = "<span style='display:block; text-align:center; color:blue'>" + tempLabel[1] + ": " + temperature[1] + " &#8457</span>";
      }

      if (tempLabel[2] == 'High') {
         tempColor2 = "<span style='display:block; text-align:center; color:red'>" + tempLabel[2] + ": " + temperature[2] + " &#8457</span>";
      }else{
         tempColor2 = "<span style='display:block; text-align:center; color:blue'>" + tempLabel[2] + ": " + temperature[2] + " &#8457</span>";
      }

      document.getElementById("forcast").innerHTML =
      "<ul style='display:table; width: 100%; padding-left: 0px;'>"

        + "<li style='display:table-cell; width: 33%; padding: 20px 0px 20px 0px'>"
        + "<span style='display:block; text-align:center'>" + dateTime[0] + "</span><br>"
        + "<img style='display: block;margin-left: auto;margin-right: auto; width:60px; height:60px' src=" + "'." + icon[0] + "'" + "><br>"
        + "<span style='display:block; text-align:center'>" + weather[0] + "</span><br>"
        + tempColor0
        + "</li>"

        + "<li style='display:table-cell; width: 33%; padding: 20px 0px 20px 0px'>"
        + "<span style='display:block; text-align:center'>" + dateTime[1] + "</span><br>"
        + "<img style='display: block;margin-left: auto;margin-right: auto; width:60px; height:60px' src=" + "'." + icon[0] + "'" + "><br>"
        + "<span style='display:block; text-align:center'>" + weather[1] + "</span><br>"
        + tempColor1
        + "</li>"

        + "<li style='display:table-cell; width: 33%; padding: 20px 0px 20px 0px'>"
        + "<span style='display:block; text-align:center'>" + dateTime[2] + "</span><br>"
        + "<img style='display: block;margin-left: auto;margin-right: auto; width:60px;height:60px' src=" + "'." + icon[0] + "'" + "><br>"
        + "<span style='display:block; text-align:center'>" + weather[2] + "</span><br>"
        + tempColor2
        + "</li>"

      + "</ul>";
    });
  }

  function openToolkit(evt, TagName){
     openTag(evt, TagName);
     // need grower and station from fdacs data
  }
    
  function myFunction(x){
          x.classList.toggle("change");
          document.getElementById("myDropdown").classList.toggle("show");
          document.getElementById("map_zoom_slider").classList.toggle("move_left");
          //document.getElementById("map").classList.toggle("map_change");
          //document.getElementById("map_panel").classList.toggle("panel_change");
          //document.getElementById("map_and_panel").classList.toggle("map_change");
  }


    openMenu = function(evt, dataSource){
        var i, tabcontent, tablinks;

        tabcontent = document.getElementsByClassName("side_menu_tabcontent");
        for(i=0; i < tabcontent.length;i++){
          tabcontent[i].style.display="none";
        }
        tablinks = document.getElementsByClassName("tablinks");
       for(i=0;i<tablinks.length;i++){
        tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(dataSource).style.display= "block";
        evt.currentTarget.className += " active";
        // map.removeLayer(removeLayer);
        // map.addLayer(glLayer);
    }

    $(document).ready(function() {
        $("#draggable").draggable({
          containment: "parent"
        });
    });

require([
  "esri/geometry/Point",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/TextSymbol",
  "esri/graphic",
  "esri/layers/FeatureLayer",
  "esri/layers/GraphicsLayer",
  ], function(Point, SimpleMarkerSymbol, TextSymbol, Graphic, FeatureLayer, GraphicsLayer) {

  // loadData object
   loadDataGenerateLayerFdacswx = {
      getDataCreateLayer : function(url, graphLayer){
        $.getJSON(url, function(data){
            for (var i = 0; i < data.length ;i++){
              var json = data[i];
              json["grower_name"]  = FdacswxStdGrowerFinder[data[i].station_name];
              graphLayer.add(addAttr(data[i].longitude, data[i].latitude, json));
            };

            if (graphLayer.id == 'graphicsLayer4') {
              for(var i = 0; i < graphLayer.graphics.length; i++){
                  if (graphLayer.graphics[i].attributes.dry_bulb_air_temp > 200 || graphLayer.graphics[i].attributes.dry_bulb_air_temp < -10)
                  {
                    graphLayer.graphics[i].attributes.dry_bulb_air_temp = 0;
                  }

                  if (graphLayer.graphics[i].attributes.wind_speed != null && graphLayer.graphics[i].attributes.wind_speed.length > 4) 
                  {
                    graphLayer.graphics[i].attributes.wind_speed = graphLayer.graphics[i].attributes.wind_speed.substring(0,4);
                  }

                  if (graphLayer.graphics[i].attributes.dry_bulb_air_temp != null && graphLayer.graphics[i].attributes.dry_bulb_air_temp.length > 4) 
                  {
                    graphLayer.graphics[i].attributes.dry_bulb_air_temp = graphLayer.graphics[i].attributes.dry_bulb_air_temp.substring(0,4);
                  }
              } 
            }
   
            function addAttr(lng,lat,json)
            {
              var p = new Point(lng,lat);
              var t = new TextSymbol(" ").setColor("green").setHaloSize(20);
              var attr = json;
              var g = new Graphic(p,t,attr);
              return g;
            }

        })
      }
    }

  loadDataGenerateLayerFawn = {
      getDataCreateLayer : function(url, graphLayer){
        $.getJSON(url, function(data){

            for (var i = 0; i < data.stnsWxData.length ;i++)
            {
              graphLayer.add(addAttr(data.stnsWxData[i].lng, data.stnsWxData[i].lat, data.stnsWxData[i]));
            };

            if (graphLayer.id == 'graphicsLayer3') 
            {
              for(var i = 0; i < graphLayer.graphics.length; i++){   

                  if (graphLayer.graphics[i].attributes.temp10mF > 200 || graphLayer.graphics[i].attributes.temp10mF < -10) 
                  {
                    graphLayer.graphics[i].attributes.temp10mF = 0;
                  }

              } 
            }

            function addAttr(lng,lat,json)
            {
              var p = new Point(lng,lat);
              var t = new TextSymbol(" ").setColor("red").setHaloSize(20);
              var attr = json;
              var g = new Graphic(p,t,attr);
              return g;
            }
        })
      }
  };













  })

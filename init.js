    // map is global for other js file to use
    var popup;
      require([
        "esri/map",
        "esri/dijit/Search",
      	"dojo/dom-construct",
        "esri/symbols/SimpleFillSymbol",
      	"esri/dijit/InfoWindow",
        "esri/dijit/Popup",
        "esri/dijit/PopupTemplate",
      	"esri/InfoTemplate",
        "esri/geometry/Point",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/TextSymbol",
        "esri/graphic",
        "esri/Color",
        "esri/renderers/SimpleRenderer",
        "esri/symbols/SimpleLineSymbol" ,
        "esri/layers/FeatureLayer",
        "esri/layers/GraphicsLayer",
        "dojo/dnd/Moveable",
        "dojo/dom",
        "dojo/ready",
        "dojo/query",
        "dojo/on",
        "dojo/dom-style",
        "dojo/dom-class",
        "dojo/_base/connect",
        "dojo/domReady!"
      ], 
	  
	  function(
        Map, Search, domConstruct, SimpleFillSymbol, InfoWindow, Popup, PopupTemplate, InfoTemplate, Point, SimpleMarkerSymbol,TextSymbol,Graphic,Color,SimpleRenderer,SimpleLineSymbol,FeatureLayer, GraphicsLayer, Moveable, dom,ready,query, on,domStyle, domClass, connect) {

      var lastestDataNameFawn = ['stnName', 'dateTimes','temp2mF', 'windSpeed10mMph','relHum2mPct','temp60cmF','temp10mF','soilTemp10cmF', 'rainFall2mInch','totalRad2mWm2','windDir10mDeg','dewPoint2mF'];

	  
      var lastestDataNameFdacswx = ['station_id', 'date_time', 'dry_bulb_air_temp', 'wet_bulb_temp', 'humidity', 'wind_speed', 'wind_direction', 'rainfall', 'latitude', 'longitude', 'total_rain_inche_since_installed', 'start_date_of_total_rain', 'station_name', 'vendor_name', 'time_zone', 'solar_radiation', 'et', 'solar_radiation_field_name', 'minutes_old', 'hasET', 'hasSolarRadiation', 'hasRemote', 'hasSoilMoisture', 'standard_date_time', 'fresh', 'grower_name'];

        popup = new Popup({
          titleInBody: true,
          anchor : "auto",
        }, domConstruct.create("div"));

        // create map and layers
        map = new Map("map", {
			
          basemap: "streets",
          center: [-81.379234,28.53833],
          zoom: 8,
          infoWindow: popup,
          sliderPosition: "top-left",
		  showAttribution: false,
		  logo:false
          // sliderStyle: "large"
        });
		
		// Overlay FL Counties 
		
		var countiesColor = new Color("#666");
        var countiesLine = new SimpleLineSymbol("solid", countiesColor, 1.5);
        var countiesSymbol = new SimpleFillSymbol("solid", countiesLine, null);
        var countiesRenderer = new SimpleRenderer(countiesSymbol);
		
		var countiesUrl = "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/Census_Counties_20m/FeatureServer/0";
        var counties = new FeatureLayer(countiesUrl, {
          id: "florida",
          outFields: ["*"]
        });
        counties.setRenderer(countiesRenderer);
		
		map.addLayer(counties)

      // title : "<div class='title'><h1>StationName:  {stnName}</h1><h4 style='float:right; font:initial; width: 100%'>lng:{lng} ／ lat:{lat}</h4></div>",
        // PopupTemplate generate function
      var popupTemplateGenerateFawn = {
          title : "<div class='title'><h1>{stnName}</h1><h4 style='float:right; font:initial; width: 100%'>{dateTimes}</h4></div>",
          descriptionStart : "<ul class='tab'>" +
            "<li><a class='tablinks active' onclick='openTag(event,&#39;current&#39;)'>Current</a></li>" +
            "<li><a class='tablinks' onclick='addBarChart(event, &#39;graph&#39;, {stnID})'>Graph</a></li>" +
            "<li><a class='tablinks' onclick='openForcast(event,&#39;forcast&#39;, {lng}, {lat})'>Prediction</a></li>" +
            "<li><a class='tablinks' onclick='openToolkit(event,&#39;Toolkit&#39;)'>Toolkit</a></li>" +
            "</ul>" +
            "<div id='current' class='tabcontent' style='background-color: #F7F7F7; display: block'>",

          descriptionEnd:
             "</div>"
             +  "<div id='graph' class='tabcontent'>"
             +    "<select id='selectBar' value='Dry Temperature' onchange='changeGraphFAWN()'>"
             +       "<option value='temp2fts'> Dry Temperature </option>"
             +       "<option value='wetBulbTemp'>  Wet Temperature</option>" 
             +       "<option value='rainFall'>  Rain Fall</option>"
             +    "</select>"
             +    "<div id='graphRender' style='overflow:hidden'></div>"
             +  "</div>"
             +  "<div id='forcast' class='tabcontent' style='background-color: #F7F7F7; display: none' ></div>"
             +  "<div id='Toolkit' class='tabcontent' style='background-color: #F7F7F7; display: none'>"
             +  "<button type='button' style='display: block' onclick='window.open(&#39;http://uffawn-datareport.appspot.com/&#39;)' value='Cold Protection'>Cold Protection Toolkit</button>"
             + "<button type='button' style='display: block' onclick='window.open(&#39;http://uffawn-datareport.appspot.com/&#39;))' value='Irrigation Scheduler Toolkit' >Irrigation Scheduler Toolkit</button>"
             + "<button type='button' style='display: block' onclick='window.open(&#39;http://uffawn-datareport.appspot.com/&#39;))' value='Freeze Alert Notification System'>Freeze Alert Notification System</button>"
             + "</div>",

          descriptionContent : '',
          json : { },
          setContent : function(descripContent){
            // this.descriptionContent = descripContent;
              // console.log(descripContent);
              for (var i = 5; i < descripContent.length; i++) {
                this.descriptionContent = this.descriptionContent.concat("<div style='border-bottom: 1px dotted #e9e9e9'><span style='font-weight:700'>" +  descripContent[i] + ":</span><span style='float:right; color: #999'>{" + descripContent[i] + "}</span></div>");
              }
              // console.log(this.descriptionContent);

              return this.json = { title: this.title, description: this.descriptionStart + this.descriptionContent + this.descriptionEnd };
          }
      }

      var popupTemplateGenerateFadacswx = {
          title : "<div class='title'><h1>StationName:  {station_name}</h1><h4 style='float:right; font:initial; width: 100%'>lng:{longitude} ／ lat:{latitude}</h4></div>",
          descriptionStart : "<ul class='tab'>" +
            "<li><a class='tablinks active' onclick='openTag(event,&#39;current&#39;)'>Current</a></li>" +
            "<li><a class='tablinks' onclick='addBarChartFdacswx(event, &#39;graph&#39;, {station_id})'>Graph</a></li>" +
            "<li><a class='tablinks' onclick='openForcast(event,&#39;forcast&#39;, {longitude}, {latitude})'>Prediction</a></li>" +
            "<li><a class='tablinks' onclick='openToolkit(event,&#39;Toolkit&#39;)'>Toolkit</a></li>" +
            "</ul>" +
            "<div id='current' class='tabcontent' style='background-color: #F7F7F7; display: block'>",

          descriptionEnd:
             "</div>"
             +  "<div id='graph' class='tabcontent'>"
             +    "<select id='selectBar' value='Dry Temperature' onchange='changeGraphFadacswx()'>"
             +       "<option value='dry_bulb_air_temp'> Dry Temperature </option>"
             +       "<option value='wet_bulb_temp'>  Wet Temperature</option>" 
             +       "<option value='rainfall'>  Rain Fall</option>"
             +    "</select>"
             +    "<div id='graphRender' style='overflow:hidden' class='graphRender'></div>"
             +  "</div>"
             +  "<div id='forcast' class='tabcontent' style='background-color: #F7F7F7; display: none' ></div>"
             +  "<div id='Toolkit' class='tabcontent' style='background-color: #F7F7F7; display: none'>"
             +  "<button type='button' style='display: block' onclick='coldp(&#39;{grower_name}&#39;, &#39;{station_name}&#39;)' value='Cold Protection'>Cold Protection Toolkit</button>"
             + "<button type='button' style='display: block' onclick='window.open(&#39;http://uffawn-datareport.appspot.com/&#39;))' value='Irrigation Scheduler Toolkit' >Irrigation Scheduler Toolkit</button>"
             + "<button type='button' style='display: block' onclick='window.open(&#39;http://uffawn-datareport.appspot.com/&#39;))' value='Freeze Alert Notification System'>Freeze Alert Notification System</button>"
             + "</div>",

          descriptionContent : '',
          json : { },
          setContent : function(descripContent){
            // this.descriptionContent = descripContent;
              // console.log(descripContent);
              for (var i = 0; i < descripContent.length; i++) {
                this.descriptionContent = this.descriptionContent.concat("<div style='border-bottom: 1px dotted #e9e9e9'><span style='font-weight:700'>" +  descripContent[i] + ":</span><span style='float:right; color: #999'>{" + descripContent[i] + "}</span></div>");
              }
              // console.log(this.descriptionContent);
              return this.json = { title: this.title, description: this.descriptionStart + this.descriptionContent + this.descriptionEnd };
          }
      }

    var templateFdacswx = new PopupTemplate(popupTemplateGenerateFadacswx.setContent(lastestDataNameFdacswx));

    var templateFawn = new PopupTemplate(popupTemplateGenerateFawn.setContent(lastestDataNameFawn));

    gl_attr = new GraphicsLayer({
      infoTemplate: templateFawn,
      outFields:["*"],

      // showAttribution: true
    });

    gl_attr_temp = new GraphicsLayer({
      outFields:["*"],
      minScale: 8000000,
    })

    glAttrFdacswx = new GraphicsLayer({
      infoTemplate: templateFdacswx,
      outFields:["*"],
    });

    glAttrFdacswxTemp = new GraphicsLayer({
      outFields:["*"],
      minScale: 4000000,
    });

    pinpointLayer = new GraphicsLayer({
      outFields:["*"],
    });

    var countyLineSymbol = new SimpleLineSymbol(
      SimpleLineSymbol.STYLE_DASH,
      new Color([0,0,255]),
      3
    );

    var renderer = new SimpleRenderer(countyLineSymbol);

    var featureLayer = new FeatureLayer(url_boundery, {
          mode: FeatureLayer.MODE_ONDEMAND,
          outFields: ["*"],
          opacity : 0.1,
          renderer : renderer
    });
    // console.log(featureLayer);

    loadDataGenerateLayerFawn.getDataCreateLayer(url6, gl_attr);
    loadDataGenerateLayerFawn.getDataCreateLayer(url6, gl_attr_temp);
    loadDataGenerateLayerFdacswx.getDataCreateLayer(url2, glAttrFdacswx);
    loadDataGenerateLayerFdacswx.getDataCreateLayer(url2, glAttrFdacswxTemp);

    map.addLayer(gl_attr);
    map.addLayer(glAttrFdacswx);
    map.addLayer(gl_attr_temp);
    map.addLayer(glAttrFdacswxTemp);
    map.addLayer(featureLayer);
    glAttrFdacswxTemp.visible = false;




/*LAYER CONTROL START---------------------------------------------------------------*/
        //fadacswx checkbox
        var tempLayer = dom.byId("tempLayer");
        var windLayer = dom.byId("windLayer");
		var rainLayer = dom.byId("rainLayer");
        //fawn overall control checkbox
        var FawnControlBox = dom.byId('openDropdownMenuFawn');
        var FdacswxControlBox = dom.byId('openDropdownMenuFdacswx');
		
//FAWN control checkbox of station-fawn and station-fdacs
/*
		$("#openDropdownMenuFawn").ready(function(){
			//map.removeLayer(pinpointLayer);
			gl_attr.visible = FawnControlBox.checked;	
			fawnStationPawn(gl_attr.visible);			
		}).change(function(){
			console.log(gl_attr.graphics);
			
		});
*/		
		on(FawnControlBox, 'change', function(){
			map.removeLayer(pinpointLayer);
			gl_attr.visible = FawnControlBox.checked;	
			fawnStationPawn(gl_attr.visible);
		});
		
//FDACSX control checkbox of station-fawn and station-fdacs
        on(FdacswxControlBox, 'change', function() {
			map.removeLayer(pinpointLayer);
            glAttrFdacswx.visible = FdacswxControlBox.checked;
			fdacsStationPawn(glAttrFdacswx.visible);
        });	
		
		/**
			function that add station point layer when Station -> Fawn weather data info checkbox is checked
			fawnBox: gl_attr.visible
		*/
		function fawnStationPawn(fawnBox) {
			if (fawnBox) {
			console.log("function is working");
				var i = 0;
				while(gl_attr.graphics[i] != null){
					console.log("fawn is true while loop");
					var tempSymbol = new SimpleMarkerSymbol().setSize(45).setColor(new Color([250,70,22,0.8])).setOutline(0);
					gl_attr.graphics[i].setSymbol(tempSymbol);
					// i = math.Round(i);
					i++;
				}
				console.log(gl_attr.graphics.length);
				gl_attr_temp.show();
			} else {
				var b = 0;
				
				while(gl_attr.graphics[b] != null){
					console.log("fawn is false while loop");
					gl_attr.graphics[b].setSymbol(null);
					b++;
				}
				
				gl_attr_temp.hide();	
			}
		}
		
		/**function that add station point layer when Station -> Fdacs weather data info checkbox is checked
			fawnBox: glAttrFdacswx.visible
		*/
		function fdacsStationPawn(fdacsBox) {
            var zoomScale = map.getZoom();
            ZoomInOutScale(glAttrFdacswx, zoomScale);
			if (fdacsBox) {
				var tempSymbol = new SimpleMarkerSymbol().setSize(45).setColor(new Color([0,33,165,0.8])).setOutline(0);
				var i = 0;
				while(glAttrFdacswx.graphics[i] != null){
					glAttrFdacswx.graphics[i].setSymbol(tempSymbol);
					
					i++;
				}

				glAttrFdacswxTemp.show();
				glAttrFdacswxTemp.visible = true;
			} else {
				var b = 0;
				while(glAttrFdacswx.graphics[b] != null){
					glAttrFdacswx.graphics[b].setSymbol(null);
					b++;
				}

				glAttrFdacswxTemp.hide();
				glAttrFdacswxTemp.visible = false;
			}
		}



//customizing temperature layer for both fawn and fdacs
        on(tempLayer, "change", function(){
			console.log("tempLayer is clicked");
            map.removeLayer(pinpointLayer);
			var stationChecked = toggleCheckbox(windLayer, rainLayer);
			if (FawnControlBox.checked) {
				if (stationChecked) {
					var b = 0;
					while(gl_attr.graphics[b] != null){
						gl_attr_temp.graphics[b].setSymbol(null);
						b++;
					}
				}

			gl_attr_temp.visible = tempLayer.checked;
			if (gl_attr_temp.visible == true) {
				var i = 0;
				while(gl_attr_temp.graphics[i] != null){

					var t = new TextSymbol(gl_attr_temp.graphics[i].attributes.temp10mF).setColor("#FFFFFF").setHaloSize(25);
					t.xoffset = 0;
					t.yoffset = -5;
					gl_attr_temp.graphics[i].setSymbol(t);
					i++;
				}

				}else{
					var b = 0;
					while(gl_attr_temp.graphics[b] != null){
						gl_attr_temp.graphics[b].setSymbol(null);
						b++;
					}

				}

			} 
			
			if (FdacswxControlBox.checked) {
				if (stationChecked) {
					var b = 0;
					while(glAttrFdacswxTemp.graphics[b] != null){
					  glAttrFdacswxTemp.graphics[b].setSymbol(null);
					  b++;
					}
				}
				var zoomScale = map.getZoom();
				ZoomInOutScale(glAttrFdacswxTemp, zoomScale);	
				glAttrFdacswxTemp.visible = tempLayer.checked;
				if (glAttrFdacswxTemp.visible == true) {
					var i = 0;
					while(glAttrFdacswxTemp.graphics[i] != null){
						var temp = glAttrFdacswxTemp.graphics[i].attributes.dry_bulb_air_temp;
						
						var t = new TextSymbol(temp).setColor("#FFFFFF").setHaloSize(25);
						t.yoffset = -5;
						glAttrFdacswxTemp.graphics[i].setSymbol(t);
						i++;
					}
				}else{
					var b = 0;
					while(glAttrFdacswxTemp.graphics[b] != null){
						glAttrFdacswxTemp.graphics[b].setSymbol(null);
						b++;
					}
				}				
			} 
        });
//customizing rainfall Layer for both fawn and fdacs

		on(rainLayer, "change", function(){
			console.log("rainLayer is clicked");
			map.removeLayer(pinpointLayer);
			var stationChecked = toggleCheckbox(tempLayer, windLayer);
			if (FawnControlBox.checked) {
				
				if (stationChecked) {
					var b = 0;
					while (gl_attr_temp.graphics[b] != null) {
						gl_attr_temp.graphics[b].setSymbol(null);
						++b;
					}						
				}

				gl_attr_temp.visible = rainLayer.checked;
				
				if (gl_attr_temp.visible) {
					//console.log("FAWN is clicked");
					var i = 0;
					var zoomScale = map.getZoom();
					ZoomInOutScale(glAttrFdacswxTemp, zoomScale);					
					while (gl_attr_temp.graphics[i] != null) {
						//0 number won't show on the map, need to change the 0 number to string in order to show on the map
						var temp = gl_attr_temp.graphics[i].attributes.rainFall2mInch;
						temp = temp.toString();
						var t = new TextSymbol(temp).setColor("#FFFFFF").setHaloSize(25);
						
						t.yoffset = -5;
						gl_attr_temp.graphics[i].setSymbol(t);
						
						i++;
						
					}
					
				} else {
					var b = 0;
					while (gl_attr_temp.graphics[b] != null) {
						gl_attr_temp.graphics[b].setSymbol(null);
						++b;
					}
				}
			}
			if (FdacswxControlBox.checked) {
				if (stationChecked) {
					var b = 0;
					while(glAttrFdacswxTemp.graphics[b] != null){
						glAttrFdacswxTemp.graphics[b].setSymbol(null);
						++b;
					}
				}
				
				var zoomScale = map.getZoom();
				ZoomInOutScale(glAttrFdacswxTemp, zoomScale);

				glAttrFdacswxTemp.visible = rainLayer.checked;
				if (glAttrFdacswxTemp.visible) {
					//console.log("FDACS is clicked");
					var i = 0;
					while(glAttrFdacswxTemp.graphics[i] != null){
						var t = new TextSymbol(glAttrFdacswxTemp.graphics[i].attributes.rainfall).setColor("#FFFFFF").setHaloSize(25);
						//console.log("fadacs rainfall is " + glAttrFdacswxTemp.graphics[i].attributes.rainfall);
						t.yoffset = -5;
						glAttrFdacswxTemp.graphics[i].setSymbol(t);
						//console.log(glAttrFdacswxTemp.graphics[i].attributes);
						i++;
						
					}
				} else {
					var b = 0;
					while(glAttrFdacswxTemp.graphics[b] != null){
						glAttrFdacswxTemp.graphics[b].setSymbol(null);
						b++;
					}
				} 				
			}
		});

		
//customizing wind layer for both fawn and fdacs
        on(windLayer, "change", function(){
			console.log("windLayer is clicked");
            map.removeLayer(pinpointLayer);
			var stationChecked = toggleCheckbox(tempLayer, rainLayer);
			if (FawnControlBox.checked) {
				if (stationChecked) {

					var b = 0;
					while(gl_attr_temp.graphics[b] != null){
						gl_attr_temp.graphics[b].setSymbol(null);
						b++;
					}
				}

				gl_attr_temp.visible = windLayer.checked;
				if (gl_attr_temp.visible == true) {
					
					var i = 0;
					while(gl_attr_temp.graphics[i] != null){
						var t = new TextSymbol(gl_attr_temp.graphics[i].attributes.windSpeed10mMph).setColor("#FFFFFF").setHaloSize(25);
						t.xoffset = 0;
						t.yoffset = -5;
						gl_attr_temp.graphics[i].setSymbol(t);
						//console.log(glAttrFdacswxTemp.graphics[i].attributes);
						i++;
						//console.log(gl_attr_temp.graphics[i].attributes);
					}

				} else {
					var b = 0;
					while(gl_attr_temp.graphics[b] != null){
						gl_attr_temp.graphics[b].setSymbol(null);
						b++;
					}
				}				
			}
		
			if (FdacswxControlBox.checked) {
				if (stationChecked) {
					rainLayer.checked = false;
					tempLayer.checked = false;
					var b = 0;
					while(glAttrFdacswxTemp.graphics[b] != null){
						glAttrFdacswxTemp.graphics[b].setSymbol(null);
						b++;
					}
				}

				var zoomScale = map.getZoom();
				ZoomInOutScale(glAttrFdacswxTemp, zoomScale);

				glAttrFdacswxTemp.visible = windLayer.checked;
				if (glAttrFdacswxTemp.visible == true) {

					var i = 0;
					while(glAttrFdacswxTemp.graphics[i] != null){
						var t = new TextSymbol(glAttrFdacswxTemp.graphics[i].attributes.wind_speed).setColor("#FFFFFF").setHaloSize(25);
						t.yoffset = -5;
						glAttrFdacswxTemp.graphics[i].setSymbol(t);
						i++;
					}
				} else {
					var b = 0;
					while(glAttrFdacswxTemp.graphics[b] != null){
						glAttrFdacswxTemp.graphics[b].setSymbol(null);
						b++;
					}
				} 
			}
        });   
		
		/**function that allow one checkbox checked each click.
			box1: dom checkbox1
			box2: dom checkbox2
			return true if other checkbox state is changed
				   else otherwise*/
		function toggleCheckbox(box1, box2) {
				//console.log("function is clicked");
				if (box1.checked || box2.checked) {
					box1.checked = false;
					box2.checked = false;
					return true;
				}
				return false;
		}	
/*LAYER CONTROL END---------------------------------------------------------------*/

// Used to default select the first tablink 
document.getElementsByClassName('tablinks')[0].click()
//document.getElementsByClassName('custom-control custom-checkbox')[0].click()

        // MAP zoom event
        connect.connect(map,"onZoomEnd",function(){
            var zoomScale = map.getZoom();

            if (windLayer.checked || tempLayer.checked || rainLayer.checked) 
            {
              // console.log("1");
              ZoomInOutScale(glAttrFdacswxTemp, zoomScale);
            }
            ZoomInOutScale(glAttrFdacswx, zoomScale);
        })

        // MAP popup show event
        connect.connect(popup,"onShow",function(){
          var height;
          var width;
          var heightPopup;
          var minHeight;
          $(document).ready(function() {
            width = $("#map").width();
            height = $('#map').height();
          })

          // make sure is anchor is at (25, 25) position;
          popup.maximize(); 
          // popup.resize(width * 0.8 - 25, height * 0.7 - 25);

          //set new width and height to popup window
          var widthPop = width * 0.5;
          var heightPop = height * 0.7;
          $('.esriPopupWrapper').css("height", heightPop);
          $('.esriPopupWrapper').css("width", widthPop);
          // wipe out unnecessary icons
          query(".restore").style("display","none");
          query('.zoomTo').style("display", "none");
          query('.sizer').style("width", "100%");

          // keep content and contentPane changing size with esriPopupWrapper when on fire
          $(document).ready(function() {
            heightPopup = $('.esriPopupWrapper').height();
            document.getElementsByClassName("sizer content")[0].style.height = heightPopup - 20 + "px";
            query('.contentPane').style('max-height', ( heightPopup - 36 ) + "px");
            query(".contentPane").style("height", "100%");
          })
   
          // put popup in the middle
          query(".esriPopupWrapper").style({
            left : ( width - (width * 0.6) )/ 2 - 25 + "px",
            top : ( height - (height * 0.6) )/ 7 + 25 + "px",
          });

          // document.getElementsByClassName("esriPopupWrapper")[0].style.minWidth = width * 0.6 + "px";
          // document.getElementsByClassName("esriPopupWrapper")[0].style.minHeight = height * 0.6 + "px";

          // successfully delete the third sizer div
          document.getElementsByClassName("sizer")[2].style.display = "none"; 


          $(document).ready(function() {
            $(".esriPopupWrapper").resizable({
              start: function(e, ui) {

                query('.contentPane').style('max-height', 'none');
              },
              resize: function(e,ui){
                var height_temp = $('.esriPopupWrapper').height();
                var width_temp = $('.esriPopupWrapper').width()
                document.getElementsByClassName("sizer content")[0].style.height = height_temp - 20 +"px";
                document.getElementsByClassName("contentPane")[0].style.height = height_temp - 36 +"px";
              },
              stop: function(e,ui){
                var height_temp = $('.esriPopupWrapper').height();
                var width_temp = $('.esriPopupWrapper').width()
                if (chart != null) {
                  chart.setSize(width_temp - 22, height_temp - 170, doAnimation = true);
                }
              }
            });
          })
          delete gl_attr.infoTemplate;
          delete glAttrFdacswx.infoTemplate;
        });

        connect.connect(popup,"onHide",function(){
			console.log("!!!!!!!!!!!!!");
            gl_attr.infoTemplate = templateFawn;
            glAttrFdacswx.infoTemplate = templateFdacswx;
        })


        function draggableUsingDojo(){
            var handle = query(".titlePane", map.infoWindow.domNode)[0];
            var dnd = new Moveable(map.infoWindow.domNode, {
                handle: handle
            });
            on(dnd, 'FirstMove', function() {
            }.bind(this));
        }

        draggableUsingDojo();

        function ZoomInOutScale(layer, zoomScale){
            for(var k = 0; k < layer.graphics.length; k++){
              layer.graphics[k].visible = true;
              // glAttrFdacswx.graphics[k].visible = true;
            }

            // calculating relative visible and invisible
            for(var i = 0; i < layer.graphics.length; i++){
              var p1 = new Point();
              p1 = layer.graphics[i].geometry;

              for( var j = 0; j < layer.graphics.length; j++){ 
                  var p2 = new Point();
                  p2 = layer.graphics[j].geometry;  

                  if (zoomScale == 8) {
                    if(Math.sqrt((p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y)) < 0.15 && (p2.y - p1.y) > 0){
                      layer.graphics[j].visible = false;
                      // glAttrFdacswx.graphics[j].visible = false;
                    }
                  }
                  
                  if (zoomScale == 9) {
                    if(Math.sqrt((p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y)) < 0.075 && (p2.y - p1.y) > 0){
                      layer.graphics[j].visible = false;
                      // glAttrFdacswx.graphics[j].visible = false;
                    }
                  }

                  if (zoomScale == 10) {
                    if(Math.sqrt((p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y)) < 0.045 && (p2.y - p1.y) > 0){
                      layer.graphics[j].visible = false;
                      // glAttrFdacswx.graphics[j].visible = false;
                    }
                  }

                  if (zoomScale == 11) {
                    if(Math.sqrt((p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y)) < 0.025 && (p2.y - p1.y) > 0){
                      layer.graphics[j].visible = false;
                      // glAttrFdacswx.graphics[j].visible = false;
                    }
                  }

                  if (zoomScale == 12) {
                    if(Math.sqrt((p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y)) < 0.0001 && (p2.y - p1.y) > 0){
                      layer.graphics[j].visible = false;
                      // glAttrFdacswx.graphics[j].visible = false;
                    }
                  }
              }
            }
        }
  });








/*



*/







function onLocationClickHandler(loc) {
			addGeometrySegmentFromResult(loc.result, loc.marker);
			$('#menu').fadeOut();
}

function addGeometrySegmentFromResult(result, marker) {
	addSegment(new google.maps.LatLng(result.geometry.location.lat, result.geometry.location.lng), result.geometry.location_type == "APPROXIMATE", marker);
}

var providers = [];

var provider1 = {
	commerciallink: "",
	uid: "openflights",
	name: "openflights",
	category: "transport",
	rel: "flights",
	icon: "assets/img/airport.png?",
	radar: {
		coefficient: 2.5,
		ray: 1000, 
		tolerance: 5
	},
	API: {
		waypoints: "flights/airports",
		prices: "flights/prices/",
		routesFrom: 'flights/routes/from/',
		routesTo: 'flights/routes/to/'
	}
};

var provider2 = {
	commerciallink: "",
	uid: "data.gouv:sncf",
	name: "data.gouv:sncf",
	category: "transport",
	rel: "rails",
	icon: 'assets/img/railstation.png?',
	radar: {
		coefficient: 3.5,
		ray: 250, 
		tolerance: 1
	},
	API: {
		waypoints: "rails/stops",
		prices: null,
		routesFrom: 'rails/routes/from/',
		routesTo: 'rails/routes/to/'
	}
};

providers.push(provider1);
providers.push(provider2);

var userParam = {
	providers: [provider1.uid]
}

var directionsService;
var vm = {
	locations: ko.observableArray()
};
var waypoints = [];
var map;
var segments = [];
var mapLabels = [];
var cursorMarker;
var TxtOverlay;
function addSegment(position, approximated, marker) {
	console.log(position, approximated, marker);
	
	window.cursorMarker = null;
	
	if(window.segments.length > 0) {
		var last = window.segments[window.segments.length - 1];
		if(last.position.lat() == position.lat() && last.position.lng() == position.lng()) {
			return;
		}
	}
	
	if(marker) {
		setMarkerAttributes(marker, position, approximated == true);
	} else {
		marker = createMarkerObject(position, approximated == true);
	}
	marker.setMap(map);
	
	var segment = {
		position			: position,
		marker				: marker
	};
	
	window.segments.push(segment);

	if(window.segments.length >= 2) {
		getBestPath(window.segments[window.segments.length - 2], segment);
	}
	
}

function addLabelToMap(position, text) {
	var mapLabel = new GMapLabel(position, text, 'mapLabel', map);	
	mapLabels.push(mapLabel);
}

function initMap() {

	window.directionsService = new google.maps.DirectionsService();
	var transitLayer = new google.maps.TransitLayer();
	transitLayer.setMap(map);
	
	var trafficLayer = new google.maps.TrafficLayer();
	trafficLayer.setMap(map);
	
	var bikeLayer = new google.maps.BicyclingLayer();
	bikeLayer.setMap(map);
	
	  if(navigator && navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition, geoPosError);
	  } else {
		showPosition();
	  }
	
	window.GMapLabel = (function() {
// adapded from this example
// http://code.google.com/apis/maps/documentation/javascript/overlays.html#CustomOverlays
    // text overlays
    var TxtOverlay = function(pos, txt, cls, map){

        // Now initialize all properties.
        this.pos = pos;
        this.txt_ = txt;
        this.cls_ = cls;
        this.map_ = map;

        // We define a property to hold the image's
        // div. We'll actually create this div
        // upon receipt of the add() method so we'll
        // leave it null for now.
        this.div_ = null;

        // Explicitly call setMap() on this overlay
        this.setMap(map);
    }

    TxtOverlay.prototype = new google.maps.OverlayView();



    TxtOverlay.prototype.onAdd = function(){

        // Note: an overlay's receipt of onAdd() indicates that
        // the map's panes are now available for attaching
        // the overlay to the map via the DOM.

        // Create the DIV and set some basic attributes.
        var div = document.createElement('DIV');
        div.className = this.cls_;

        div.innerHTML = this.txt_;

        // Set the overlay's div_ property to this DIV
        this.div_ = div;
        var overlayProjection = this.getProjection();
        var position = overlayProjection.fromLatLngToDivPixel(this.pos);
        div.style.left = position.x + 'px';
        div.style.top = position.y + 'px';
        // We add an overlay to a map via one of the map's panes.

        var panes = this.getPanes();
        panes.floatPane.appendChild(div);
    }
    TxtOverlay.prototype.draw = function(){


        var overlayProjection = this.getProjection();

        // Retrieve the southwest and northeast coordinates of this
		// overlay
        // in latlngs and convert them to pixels coordinates.
        // We'll use these coordinates to resize the DIV.
        var position = overlayProjection.fromLatLngToDivPixel(this.pos);


        var div = this.div_;
        div.style.left = position.x + 'px';
        div.style.top = position.y + 'px';



    }
   // Optional: helper methods for removing and toggling the text
	// overlay.
    TxtOverlay.prototype.onRemove = function(){
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
    }
    TxtOverlay.prototype.hide = function(){
        if (this.div_) {
            this.div_.style.visibility = "hidden";
        }
    }

    TxtOverlay.prototype.show = function(){
        if (this.div_) {
            this.div_.style.visibility = "visible";
        }
    }

    TxtOverlay.prototype.toggle = function(){
        if (this.div_) {
            if (this.div_.style.visibility == "hidden") {
                this.show();
            }
            else {
                this.hide();
            }
        }
    }

    TxtOverlay.prototype.toggleDOM = function(){
        if (this.getMap()) {
            this.setMap(null);
        }
        else {
            this.setMap(this.map_);
        }
    }
	
	return TxtOverlay;
	
})();
	
	
	getWaypointsFromProviders();
	
}

function distance(lat_a, lon_a, lat_b, lon_b)  { a = Math.PI / 180; lat1 = lat_a * a; lat2 = lat_b * a; lon1 = lon_a * a; lon2 = lon_b * a;  t1 = Math.sin(lat1) * Math.sin(lat2); t2 = Math.cos(lat1) * Math.cos(lat2); t3 = Math.cos(lon1 - lon2); t4 = t2 * t3; t5 = t1 + t4; rad_dist = Math.atan(-t5/Math.sqrt(-t5 * t5 +1)) + 2 * Math.atan(1);  return (rad_dist * 3437.74677 * 1.1508) * 1.6093470878864446; }

function getClosestWaypoints(lat, lng, visible, maxdist, limit) {
	if(!visible && visible !== false) {
		visible = true
	}
	if(!maxdist && maxdist !== 0) {
		maxdist = 500;
	}
	
	var wpList = [];
	var prev_d = -1;
	for(var i = 0; i < waypoints.length; i++) {
		var waypoint = waypoints[i];
		if(!visible || waypoint.marker.getMap() != null) {
			var d = distance(lat, lng, waypoint.data.lat, waypoint.data.lng);
			if((maxdist == 0 && (prev_d == -1 || d < prev_d)) || (maxdist !== 0 && d <= maxdist && d <= waypoint.provider.radar.ray)) {
				prev_d = d;
				waypoint._calcDistance = d;
				wpList.push(waypoint);
			}
		}
	}

	wpList.sort(function(a, b) {
		return a._calcDistance - b._calcDistance;
	});
	
	if(limit) {
		return wpList.slice(0, limit);
	}

	return wpList;
	
}

function cleanWaypointMarkers() {

	for(var i = 0; i < waypoints.length; i++) {
		var marker = waypoints[i].marker;
		marker.setMap(null);
	}
}

function clearMarkers() {
	for(var i = 0; i < markers.length; i++) {
		var marker = markers[i];
		marker.setMap(null);
	}
}

function clearMapLabels() {
	for(var i = 0; i < mapLabels.length; i++) {
		var mapLabel = mapLabels[i];
		mapLabel.setMap(null);
	}
	mapLabels.length = 0;
}

function geoPosError(err) {
	showPosition();	
}

function cleanTrip() {
	clearMapLabels();
	cleanWaypointMarkers();
	clearMarkers();
	cleanRoutes();
	window.segments = [];
}

function cleanRoutes() {
	for(var i = 0; i < polylines.length; i++) {
		var route = polylines[i];
		route.setMap(null);
	}	
	for(var i = 0; i < roads.length; i++) {
		var route = roads[i];
		route.setMap(null);
	}
}

var polylines = [], roads = [], markers = [];

function setMarkerAttributes(marker, position, approximated) {
	marker.approximated = approximated == true;
	marker.setPosition(position);
	marker.setIcon(approximated?'assets/img/marker_approximate.png?':'assets/img/marker.png?');	
}

function createMarkerObject(position, approximated) {
	var marker;
	for(var i = 0; i < markers.length; i++) {
		marker = markers[i];
		if(marker.getMap() == null) {
			break;	
		}
		marker = null;
	}
	if(!marker) {
		marker = new google.maps.Marker({});	
	}
	google.maps.event.clearListeners(marker);
	setMarkerAttributes(marker, position, approximated);
	markers.push(marker);
	return marker;
}

function createPolylineObject(path) {
	
	var polyline;
	for(var i = 0; i < polylines.length; i++) {
		polyline = polylines[i];
		if(polyline.getMap() == null) {
			break;	
		}
		polyline = null;
	}
	if(!polyline) {
		polyline = new google.maps.Polyline({
			path: [],
			geodesic: true,
			strokeColor: '#5ea9de',
			strokeOpacity: 0.5,
			strokeWeight: 5
		});
	}
	
	polyline.setPath(path);
	polylines.push(polyline);
	
	return polyline;
}
			
function createRoadObject(directions) {
	var road;
	for(var i = 0; i < roads.length; i++) {
		road = roads[i];
		if(road.getMap() == null) {
			break;
		}
		road = null;
	}
	if(!road) {
		road = new google.maps.DirectionsRenderer({preserveViewport: true, draggable: true, suppressMarkers: true });
	}
	road.setDirections(directions);
	roads.push(road);
	
	return road;
}

function drawWaypointRoute(from, waypointFrom, to, waypointTo) {
	
	if(!from.marker.approximated) {
		drawRouteToPosition(from.position, waypointFrom.marker.position);	
	}
	
	waypointFrom.marker.setMap(map);
	waypointFrom.marker.setAnimation(google.maps.Animation.BOUNCE);
	
	var polyline = createPolylineObject([waypointFrom.marker.position, waypointTo.marker.position]);
	polyline.setMap(map);
	
	waypointTo.marker.setMap(map);
	waypointTo.marker.setAnimation(google.maps.Animation.BOUNCE);
	
	if(!to.marker.approximated) {
		drawRouteToPosition(waypointTo.marker.position, to.position);
	}
	
	getPrices(waypointFrom, waypointTo, function(data) {
		if(data) {
			addLabelToMap(waypointFrom.marker.position, data.trips && data.trips.tripOption?data.trips.tripOption[0].saleTotal:"Aucune information sur le vol");
		}
	});
	
}

function showPosition(position) {
	
	if(!position) {
		position = { coords: {
					latitude: 0, 
					longitude: 0 
				   }};
	}
	
  	window.map = new google.maps.Map(document.getElementById('map'), {
    	center: {
      		lat: position.coords.latitude, 
      		lng: position.coords.longitude
    	},
    	zoom: 8
  	});
	
	google.maps.event.addListener(map, "rightclick", function(event) {

		cleanTrip();
		
	});
	
	google.maps.event.addListener(map, "center_changed", function(event) {
		$('#menu').hide();
	});
	
	google.maps.event.addListener(map, "zoom_changed", function(event) {
		$('#menu').hide();
	});
	
	google.maps.event.addListener(map, "click", function(event) {
		console.log(event);
		showMenuAt(event.latLng);
		
	});

}

function showMenuAt(latLng) {

	var projection = map.getProjection();
	var point = projection.fromLatLngToPoint(latLng);
	console.log(latLng, point);
	var menu = $("#menu").hide();
	menu.css('left', point.x);
	menu.css('top', point.y);

	if(window.cursorMarker) {
		window.cursorMarker.setMap(null);
	}
	window.cursorMarker = createMarkerObject(latLng, true);
	window.cursorMarker.setMap(map);
	window.cursorMarker.addListener("click", function(event) {
		showMenuAt(latLng);	
	});
	
	vm.locations.removeAll();

	getGeoCod(latLng, function(data, approximated) {
		if(data.results.length > 0) {
			if(data.results.length > 1) {
				for(var i = 0; i < data.results.length; i++) {
					vm.locations.push({
						text: data.results[i].formatted_address,
						latLng: latLng,
						marker: window.cursorMarker,
						result: data.results[i]
					});
				}
				menu.fadeIn();
			} else {
				addGeometrySegmentFromResult(data.results[0], window.cursorMarker);
			}
		}
		
	});
}
		
function drawRouteToPosition(from, to) {

	if(!from || !to) {
		return;
	}
	
	var request = {
		origin: from,
		destination: to,
		travelMode: google.maps.TravelMode.DRIVING
	};

	// populate yor box/field with lat, lng
	window.directionsService.route(request, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			var directionsDisplay = createRoadObject(response);
			directionsDisplay.setMap(map);
		}
	});	
}



function addWaypointMarker(waypoint) {
	
	waypoints.push(waypoint);

	if(waypoint.marker) {
		return waypoint.marker;
	}
	
	var marker = new google.maps.Marker({
		position: { lat: parseFloat(waypoint.data.lat), lng: parseFloat(waypoint.data.lng) },
		map: null,
		icon: waypoint.provider.icon,
		title: waypoint.data.name + " (" + waypoint.data.code + ")",
		customData: {
			waypoint: waypoint
		}
	});
	
	waypoint.marker = marker;
	
	var infowindow = new google.maps.InfoWindow({
		content: '<strong>' + waypoint.data.name + ", " + waypoint.data.city + '</strong> ' + waypoint.data.code
	});
	
	waypoint.infowindow = infowindow;
	
	marker.addListener('click', function() {
		
		if(window.infowindow) {
			window.infowindow.close();
		}

		infowindow.open(map, this);
	
		window.infowindow = infowindow;

	});
	
	marker.addListener('rightclick', function() {

	});
	
	return marker;
}

function findWaypointFromAPID(apid) {
	for(var i = 0; i < waypoints.length; i++) {
		if(waypoints[i].data.id == apid) {
			return waypoints[i];
		}
	}
	return null;
}

function getGeoCod(position, fn) {
	
	var precision;
	
	if(map.getZoom() <= 7) {
		precision = "country|administrative_area_level_1";
	} else {
		if(map.getZoom() <= 11) {
			precision = "administrative_area_level_1|administrative_area_level_2";
		} else {
			if(map.getZoom() < 15) {
				precision = "political|locality";
			} else {
				precision = "sublocality|street_address";
			}
		}
	}

	$.ajax('gmap/geoloc/' + position.lat() + '/' + position.lng() + '?precision=' + precision, { type: 'get', dataType:'json' }).done(function(data) {
		fn(data);
	});	
}

function getWaypointsFromProviders(position) {
	
	var loadProvider = function(provider) {
		console.debug("Provider", "'" + provider.name + "'", "init");
		
		$.ajax(provider.API.waypoints, { type: 'get', dataType:'json' }).done(function(data) {
			for(var i = 0; i < data.length; i++) {
				var waypoint = data[i];

				var waypointData = {
					data: waypoint,
					provider: provider,
					marker: null,
					routesTo: waypoint.routesTo,
					routesFrom: waypoint.routesFrom
				};
				addWaypointMarker(waypointData);
			}
			
			console.info("Provider", "'" + provider.name + "'", "ready", provider);
			
		});	
	};
	
	for(var i = 0; i < providers.length; i++) {
		var provider = providers[i];
		loadProvider(provider);
	}
	
// $.ajax('https://maps.googleapis.com/maps/api/place/details/json?reference=CmReAAAAORMCabrZRhDc6CpS7Fk43_tkHWgM3stsNKEEzy5i496fHJtuEmhq99BgIrt0XfmQXFxCL6ffhmqHsnMOnkWTNosFUnD39GVEYohq1Fm-WYT6hgYFRRrqCkhEc5puD5DwEhAa2MfASLLwn1Qpi3_LNmIyGhTKd3cINtfX8UvCXWtJ90Hs-2i-CQ&key=AIzaSyDCvyb00K7ERlTz2BEF3lv9hujedNGxgb4',
// { type:'get', dataType: 'jsonp', contentType:'application/json', crossDomain:
// true, converters: { "json jsonp": window.String }});
	
	/*
	 * $.ajax('https://maps.googleapis.com/maps/api/place/textsearch/json?key=AIzaSyDCvyb00K7ERlTz2BEF3lv9hujedNGxgb4' +
	 * '&query=airport', { type:'get', dataType: 'jsonp',
	 * contentType:'application/json', crossDomain: true, converters: { "json
	 * jsonp": window.String }}).done(function(data) { console.log(data); });
	 */

	
}

function getRoutesTo(waypoint, fn) {
	if(waypoint.routesTo) {
		fn(waypoint.routesTo);
		return;
	}
	if(!waypoint.provider.API.routesTo) {
		fn(null);
		return;
	}
	$.ajax(waypoint.provider.API.routesTo + waypoint.data.id, { method : 'get', dataType:'json' }).done(function(data) {
		waypoint.routesTo = data;
		fn(data);
	});
}

function getRoutesFrom(waypoint, fn) {
	if(waypoint.routesFrom) {
		fn(waypoint.routesFrom);
		return;
	}		
	if(!waypoint.provider.API.routesFrom) {
		fn(null);
		return;
	}
	$.ajax(waypoint.provider.API.routesFrom + waypoint.data.id, { method : 'get', dataType:'json' }).done(function(data) {
		waypoint.routesFrom = data;
		fn(data);
	});
}

function getPrices(from, to, fn) {
	if(!from.provider.API.prices) {
		fn(null);
		return;
	}
	$.ajax(from.provider.API.prices + from.data.code + "/" + to.data.code, { method : 'get', dataType:'json' }).done(function(data) {
		console.log(data);
		fn(data);
	});
	
}

function getBestPath(segFrom, segTo, fn) {

	if(!segFrom || !segFrom) { return; }
	
	var from, to;
	from = segFrom.position;
	to = segTo.position;
	
	var bounds = new google.maps.LatLngBounds();
	bounds.extend(from);
	bounds.extend(to);
	
	setTimeout(function() { map.fitBounds(bounds) }, 200);
	
	var wpFrom, wpTo;

	var process = function(from, to, inv, fn) {
		
		inv = inv || false;
		
		var waypointsFrom = getClosestWaypoints(from.lat(), from.lng(), false, 500);
		var waypointsTo = getClosestWaypoints(to.lat(), to.lng(), false, 500);

		if(waypointsFrom.length == 0 || waypointsTo.length == 0) {
			fn(null, null);
		}
		
		var waypointFrom, waypointTo, distanceTo = -1;

		var searchAPIDFrom = function(apid, routes) {
			if(routes.indexOf(apid) != -1) {
				return findWaypointFromAPID(apid);
			}
			return null;
		}

		var iFrom = -1, iChecked = -1;

		var next = function() {
			iFrom++;

			var aiFrom = waypointsFrom[iFrom];
			
			var found = false;
			if(aiFrom) {
				
				if(userParam.providers.indexOf(aiFrom.provider.uid) == -1) {
					next();
					return;	
				}
				
				for(var i = 0; i < waypointsTo.length; i++) {
					if(waypointsTo[i].provider == aiFrom.provider) {
						found = true;
						break;
					}
				}
			
				if(!found) {
					next();
					return;
				}
			}
			
			iChecked++;
			
			if(aiFrom && ((iChecked < aiFrom.provider.radar.tolerance) || !(waypointFrom && waypointTo))) {
				var dfrom = distance(from.lat(), from.lng(), aiFrom.data.lat, aiFrom.data.lng);
				var dto = -1;
				var drel = distance(from.lat(), from.lng(), to.lat(), to.lng()) / aiFrom.provider.radar.coefficient;
				var distanceAbs = Math.min(distance(from.lat(), from.lng(), to.lat(), to.lng()) / aiFrom.provider.radar.coefficient, aiFrom.provider.radar.ray);
				if(dfrom <= distanceAbs) {
					var aiMarker = null;
					if(aiFrom.marker.getMap() == null) {
						aiMarker = aiFrom.marker;
						aiMarker.setMap(map);
					}
					
					getRoutesFrom(aiFrom, function(routes) {
						if(routes) {
							var aiTo;
							for(var i = 0; i < waypointsTo.length; i++) {

								if(waypointsTo[i].provider == aiFrom.provider) {
									aiTo = searchAPIDFrom(waypointsTo[i].data.id, routes);
									if(aiTo) {
										dto = distance(to.lat(), to.lng(), aiTo.data.lat, aiTo.data.lng);
										if(dto <= distanceAbs) {
											break;	
										}
										aiTo = null;
									}
								}
							}
							if(aiTo) {
								if((distanceTo == -1 || dfrom < distanceTo) && (dfrom + dto) < drel) {
									distanceTo = dfrom;
									waypointFrom = aiFrom;
									waypointTo = aiTo;
								}
							}
						}
						if(aiMarker) {
							aiMarker.setMap(null);
						}
						next();
					});
					
				} else {
					next();
				} 
			} else {
				fn(waypointFrom, waypointTo);	
			}
		}

		next();
	}
				
	process(from, to, false, function(waypointFrom, waypointTo) {
		
		wpFrom = waypointFrom;
		wpTo = waypointTo;

		process(to, from, true, function(waypointFrom, waypointTo) {

			if(wpFrom && wpTo) {
				if(waypointFrom && waypointTo) {
					var d1 = distance(from.lat(), from.lng(), waypointTo.data.lat, waypointTo.data.lng) + distance(to.lat(), to.lng(), waypointFrom.data.lat, waypointFrom.data.lng) ;
					var d2 = distance(from.lat(), from.lng(), wpFrom.data.lat, wpFrom.data.lng) + distance(to.lat(), to.lng(), wpTo.data.lat, wpTo.data.lng) ;
					if(d2 < d1) {
						drawWaypointRoute(segFrom, wpFrom, segTo, wpTo);
					} else {
						drawWaypointRoute(segFrom, waypointTo, segTo, waypointFrom);
					}
				} else {
					drawWaypointRoute(segFrom, wpFrom, segTo, wpTo);
				}
			} else if(waypointFrom && waypointTo) {
				drawWaypointRoute(segFrom, waypointTo, segTo, waypointFrom);
			} else {
				drawRouteToPosition(segFrom.position, segTo.position);	
			}
		})
	});

}

ko.applyBindings(vm);
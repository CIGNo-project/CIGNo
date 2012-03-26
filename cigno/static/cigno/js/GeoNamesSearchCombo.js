var mapPanel;

var app;
var layer;
var vectorLayer;
var appendFeature;
var loadGeonamesPanel = function() {
    OpenLayers.ImgPath = '/static/geonode/externals/openlayers/img/';
    

    vectorLayer = new OpenLayers.Layer.Vector("Search");
    // app = new gxp.Viewer(config);
    mapPanel = new GeoExt.MapPanel({
	id: 'mappanel',
	width: 270,
	height: 270,
	renderTo: 'preview_map',
	border: true,
	map: {//theme: null,
	    "units": "m", 
	    "maxResolution": 156543.03390625, 
	    //"maxExtent": [-20037508.34, -20037508.34, 20037508.34, 20037508.34], 
	    "projection": "EPSG:900913",
	    controls: [new OpenLayers.Control.Navigation()
		      ],
	    layers: [
		new OpenLayers.Layer.OSM(),
		vectorLayer
	    ]
	}
    });
    mapPanel.map.setCenter(new OpenLayers.LonLat(1372198, 5690838));
    mapPanel.map.zoomTo(8);

    var selectControl;
    var selectedFeature;
    new GeoExt.ux.GeoNamesSearchCombo({
        //map: app.mapPanel.map,
	map: mapPanel.map,
        layerName: 'Search',
	zoom: 12,
	renderTo: 'geonames_search',
	width: 270
    });

    function onPopupClose(evt) {
        selectControl.unselect(selectedFeature);
    }
    function onFeatureSelect(feature) {
        selectedFeature = feature;
	//console.log(feature);
	var appendFeature = "<br><a src='javascript:void(0)' onClick=\"appendFeature('" + feature.id + "\')\">Add relation</a>";
	if(feature.appended){
	    appendFeature = '';
	}
        popup = new OpenLayers.Popup.FramedCloud("chicken", 
						 feature.geometry.getBounds().getCenterLonLat(),
						 null,
						 //"<div style='font-size:.8em'>" + feature.data.name +"<br>" + feature.data.fcodeName+"</div>",
						 "<div class='text-align: left'>"
						 + "<b>" + feature.data.name + "</b>" 
						 + "<small>"
						 + "<br/>" + feature.data.fcodeName + "-" + feature.data.countryName
						 + appendFeature
						 + "</div>",
						 null, true, onPopupClose);
        feature.popup = popup;
        //app.mapPanel.map.addPopup(popup);
	mapPanel.map.addPopup(popup);
    }
    
    appendFeature = function(id){
	var baseUrl = 'http://sws.geonames.org/';
	//var searchLayer = app.mapPanel.map.getLayersByName('Search')[0];
	var searchLayer = mapPanel.map.getLayersByName('Search')[0];
	var feature = searchLayer.getFeatureById(id);
	feature.style.externalGraphic = "/static/geonode/externals/openlayers/img/marker-blue.png";
	searchLayer.redraw();
	rstore = related_resources_panel.store;
	var s = related_resources_panel.rdf_s;
	var p = 'http://purl.org/dc/terms/coverage';
	var o = baseUrl + feature.data.geonameId +'/';
	var pl = 'Coverage';
	var ol = feature.data.name;

	record = new rstore.recordType({
	    'id': s + '|' + p + '|' + o,
	    's': s,
	    'p': p,
	    'o': o,
	    'pl': pl,
	    'ol': ol
	});
	rstore.insert(0, record);
	selectControl.unselect(feature);
	feature.appended=true;
    };

    function onFeatureUnselect(feature) {
        //app.mapPanel.map.removePopup(feature.popup);
	mapPanel.map.removePopup(feature.popup);
        feature.popup.destroy();
        feature.popup = null;
    } 
    
    // create popup on "featureselected"
    //app.on("ready", 
    //function(e){
    vectorLayer = mapPanel.map.getLayersByName('Search')[0];
    selectControl = new OpenLayers.Control.SelectFeature(vectorLayer,
							 {onSelect: onFeatureSelect, onUnselect: onFeatureUnselect});
    vectorLayer.onFeatureInsert = onFeatureSelect;
    mapPanel.map.addControl(selectControl);
    selectControl.activate();
    //       }, mapPanel
    // );
};

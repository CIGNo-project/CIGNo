GeoExt.BboxGeoNamesMapPanel = Ext.extend(GeoExt.MapPanel, {
    //width: 530,
    border: true,
    zoom: 8,
    center: new OpenLayers.LonLat(1372198, 5690838),
    bbox: null,
    geonames: [],
    editable: true,
    initComponent:function() {
	// hidden name to hold geonamesids
	this.id_geonamesids = Ext.id();
	if("editable" in this.initialConfig){
	    Ext.apply(this.editable, this.initialConfig['editable']);
	}
	
	OpenLayers.ImgPath = '/static/geonode/externals/openlayers/img/';
	OpenLayers.CSSPath = '/static/geonode/externals/openlayers/img/';
	var map = new OpenLayers.Map({"projection": "EPSG:900913"});
	// reverse reference
	map.geonames = this;
	var osmLayer = new OpenLayers.Layer.OSM();
	this.boxLayer = new OpenLayers.Layer.Vector("Box layer", {"projection": "EPSG:900913"});
	this.boxLayer.events.on(
	    {
		'featureremoved': function(evt){
		    Ext.getCmp('bboxgrid').store.removeAll();
		},
		'featureadded': function(evt){
		    if(this.boxLayer.features.length > 1){
			this.boxLayer.destroyFeatures(this.boxLayer.features.shift());
			this.bbox = evt.feature.geometry.getBounds();
		    };
		    //add geometry to form field
		    var bboxgrid = Ext.getCmp('bboxgrid');
		    var geometry = evt.feature.geometry.clone();
		    var outProjection = new OpenLayers.Projection('EPSG:4326');
		    var inProjection = map.getProjectionObject();
 		    geometry.transform(inProjection, outProjection);
		    Ext.getCmp('geographic_bounding_box_id').setValue(this.geometryToEWKT(geometry));

		    //add feature on store
		    var bounds = geometry.getBounds();
		    bboxgrid.store.removeAll();
		    bboxgrid.store.add(new bboxgrid.store.recordType({
			east: bounds.left,
			south: bounds.bottom,
			west: bounds.right,
			north: bounds.top
		    }));

		},
		scope: this
	    }
	);		   

	var style = new OpenLayers.Style(
	    {
		graphicWidth: 21,
		graphicHeight: 25
	    },
	    {
		rules: [
		    new OpenLayers.Rule({
			// a rule contains an optional filter
			filter: new OpenLayers.Filter.Comparison({
			    type: OpenLayers.Filter.Comparison.EQUAL_TO,
			    property: "type", 
			    value: 'search'
			}),
			// if a feature matches the above filter, use this symbolizer
			symbolizer: {
			    externalGraphic: "/static/geonode/externals/openlayers/img/marker.png"
			}
		    }),
		    new OpenLayers.Rule({
			// a rule contains an optional filter
			filter: new OpenLayers.Filter.Comparison({
			    type: OpenLayers.Filter.Comparison.EQUAL_TO,
			    property: "type", 
			    value: 'link'
			}),
			// if a feature matches the above filter, use this symbolizer
			symbolizer: {
			    externalGraphic: "/static/geonode/externals/openlayers/img/marker-blue.png"
			}
		    })
		]
	    }
	);
	var searchLayer = new OpenLayers.Layer.Vector("Search",{"projection": "EPSG:900913",
								styleMap: new OpenLayers.StyleMap(style)
							       });
	this.searchLayer = searchLayer;
	// 	    searchLayer.events.on({ 
	// 	     	'featureadded': this.setGeonamesids,
	// 		'featureremoved': this.setGeonamesids,
	// 		scope: this
	// 	    });
	
	map.addLayers([osmLayer, this.boxLayer, searchLayer]);
	map.addControl(new OpenLayers.Control.MousePosition());


	this.selectControl = new OpenLayers.Control.SelectFeature(searchLayer,
								  {onSelect: this.onFeatureSelect, 
								   onUnselect: this.onFeatureUnselect,
								   scope: this
								  });
	//searchLayer.onFeatureInsert = this.onFeatureSelect;
	map.addControl(this.selectControl);
	this.selectControl.activate();

        var config = {
	    layout: 'fit',
	    map: map,
	    tbar: [
		new GeoExt.Action({
		    text: "draw bounding box",
		    iconCls: 'icon-adduser',
		    control: new OpenLayers.Control.DrawFeature(this.boxLayer,
								OpenLayers.Handler.RegularPolygon, 
								{
								    handlerOptions: {
									sides: 4,
									irregular: true,
									multi: false
								    }
								}
							       ),
		    map: map,
		    // button options
		    toggleGroup: "draw",
		    allowDepress: true,
		    tooltip: "draw bounding box",
		    // check item options
		    group: "draw"
		}),
		"-",
		{
		    text: 'remove bounding box',
		    iconCls: 'icon-removeuser',
		    handler:function(b){
			this.boxLayer.removeAllFeatures();
		    },
		    scope: this
		}
	    ]
        }; 

	if(this.editable == false){
	    config['tbar'] = [];
	}
        // apply config
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        GeoExt.BboxGeoNamesMapPanel.superclass.initComponent.apply(this, arguments);
    },
    geometryToEWKT: function(geometry, srs){
	if(!srs){
	    srs = 'EPSG:4326';
	}
	var formatWkt =  new OpenLayers.Format.WKT();
	var EWKT = "SRID=" + srs + ";" + formatWkt.extractGeometry(geometry);
	return EWKT;
    },
    EWKTToFeature: function(EWKT, srs){
	if(!srs){
	    srs = 'EPSG:4326';
	}
	var formatWkt =  new OpenLayers.Format.WKT();
	var re = /^SRID=(\w+:\d+);(.+)$/;
	var m = re.exec(EWKT);
	if (m == null) {
	    return false;
	}
	var inProjection = new OpenLayers.Projection(m[1]);
	var outProjection = new OpenLayers.Projection(srs);
	var feature = formatWkt.read(m[2]);

 	feature.geometry.transform(inProjection, outProjection);
	return feature;
    },
    loadBBOX: function(ewkt){
	if(ewkt!=''){
	    var feature = this.EWKTToFeature(ewkt, this.boxLayer.projection.projCode );
	    if(feature){
		this.boxLayer.addFeatures(feature);
	    }
	}
    },
    loadGeoNames: function(geoJSON){
	var geojson_format = new OpenLayers.Format.GeoJSON({internalProjection: this.searchLayer.projection,  
							    externalProjection: new OpenLayers.Projection('EPSG:4326')});
	var feature = geojson_format.read(geoJSON);
	this.searchLayer.addFeatures(feature);
    },
    setGeonamesids: function(evt){
	features = this.searchLayer.features;
	var ids = [];
        for (var i=0; i<features.length; i++) {
	    var feature = features[i];
	    if(feature.attributes.type == 'link'){
		ids.push(feature.attributes.geonameId);
	    }
        }
	var geonamesids = Ext.getCmp(this.id_geonamesids);
	geonamesids.setValue(ids.join(','));	    
    },
    onFeatureSelect: function(feature) {
	var buttonid = Ext.id();
        popup = new OpenLayers.Popup.FramedCloud("chicken", 
						 feature.geometry.getBounds().getCenterLonLat(),
						 null,
						 //"<div style='font-size:.8em'>" + feature.attributes.name +"<br>" + feature.attributes.fcodeName+"</div>",
						 "<div class='text-align: left'>"
						 + "<b>" + feature.attributes.name + "</b>" 
						 + "<small>"
						 + "<br/>" + feature.attributes.fcodeName + "-" + feature.attributes.countryName
						 + "<br/>"
						 + "<br/>"
						 + "<div style='height: 20px;' id='" + buttonid + "'>"
						 + "</div>",
						 null, true
						 , function(evt) {console.log(evt); feature.layer.map.geonames.selectControl.unselect(feature);}
						);
	
	popup.feature = feature;
        feature.popup = popup;
	this.map.addPopup(popup);

	if(this.editable) {
	    if(feature.attributes.type == 'search'){
		btn1 = new Ext.Button({
                    renderTo: buttonid,
                    text: 'Add',
		    scope: feature,
                    handler: function(){
			var baseUrl = 'http://sws.geonames.org/';
			feature.layer.redraw();
			feature.attributes.type = 'link';
			feature.layer.map.geonames.selectControl.unselect(feature);
			feature.layer.map.geonames.setGeonamesids();
		    }
		});
	    }else{
		btn1 = new Ext.Button({
                    renderTo: buttonid,
                    text: 'Remove',
		    scope: feature,
                    handler: function(){
			var baseUrl = 'http://sws.geonames.org/';
			feature.layer.redraw();
			feature.attributes.type = 'search';
			feature.layer.map.geonames.selectControl.unselect(feature);
			feature.layer.map.geonames.setGeonamesids();
		    }
		});
	    }
	}
    },
    onFeatureUnselect: function(feature) {
        //app.mapPanel.map.removePopup(feature.popup);
	this.map.removePopup(feature.popup);
        feature.popup.destroy();
        feature.popup = null;
    } 
});





GeoExt.BboxGeoNamesPanel = Ext.extend(GeoExt.MapPanel, {
    map: {},
    mapPanel: null,
    editable: true,
    mapHeight: 400,
    initComponent:function() {
	if("map" in this.initialConfig){
	    Ext.apply(this.map, this.initialConfig['map']);
	}
	if("editable" in this.initialConfig){
	    Ext.apply(this.editable, this.initialConfig['editable']);
	}
	mapPanel = new GeoExt.BboxGeoNamesMapPanel({map: this.map, height: this.mapHeight, editable: this.editable});
	this.mapPanel = mapPanel;

	var combogeonames = {
	    title: 'Search GeoNames',
	    xtype: 'panel',
	    autoHeight: true,
	    layout: 'fit',
	    items: [
		{
		    xtype: 'gxux_geonamessearchcombo',
		    layerName: 'Search',
		    zoom: 12,
		    map: mapPanel.map
		}]
	};
	var geonamesids = {
	    id: mapPanel.id_geonamesids,
	    xtype: 'hidden',
	    name: 'geonamesids'
	};
	var bbox = {
	    id: 'geographic_bounding_box_id',
	    xtype: 'hidden',
	    name: 'geographic_bounding_box'
	};
	var bboxgrid = new Ext.grid.GridPanel({
	    title: 'Bounding box',
	    id: 'bboxgrid',
	    viewConfig: {forceFit: true},
	    store: new Ext.data.ArrayStore({
		fields: [
		    {name: 'east'},
		    {name: 'south'},
		    {name: 'west'},
		    {name: 'north'}
		]
	    }),
	    columns: [
		{
		    id       :'east',
		    header   : 'East', 
		    //width    : 160, 
		    dataIndex: 'east'
		},
		{
		    header   : 'South', 
		    //width    : 160, 
		    dataIndex: 'south'
		},
		{
		    header   : 'West', 
		    //width    : 160, 
		    dataIndex: 'west'
		},
		{
		    header   : 'North', 
		    //width    : 160, 
		    dataIndex: 'north'
		}
	    ],
	    stripeRows: true,
	    autoHeight: true,
	    //width: 550,
	    //title: 'Boundig box',
	    // config options for stateful behavior
	    stateful: true,
	    stateId: 'grid'
	});
	var items;
	if(this.editable){
	    items = [combogeonames, geonamesids, bbox, bboxgrid, mapPanel];
	} else {
	    items = [bbox, mapPanel];
	}
	config = {
	    layout: 'fit',
	    items: items
	};

        // apply config
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        GeoExt.BboxGeoNamesPanel.superclass.initComponent.apply(this, arguments);
    }
});




Ext.reg('bboxgeonamespanel', GeoExt.BboxGeoNamesPanel);

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
	 timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
	 timezoneClip = /[^-+\dA-Z]/g,
	 pad = function (val, len) {
		 val = String(val);
		 len = len || 2;
		 while (val.length < len) val = "0" + val;
		 return val;
	 };

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
	  d = date[_ + "Date"](),
	  D = date[_ + "Day"](),
	  m = date[_ + "Month"](),
	  y = date[_ + "FullYear"](),
	  H = date[_ + "Hours"](),
	  M = date[_ + "Minutes"](),
	  s = date[_ + "Seconds"](),
	  L = date[_ + "Milliseconds"](),
	  o = utc ? 0 : date.getTimezoneOffset(),
	  flags = {
		  d:    d,
		  dd:   pad(d),
		  ddd:  dF.i18n.dayNames[D],
		  dddd: dF.i18n.dayNames[D + 7],
		  m:    m + 1,
		  mm:   pad(m + 1),
		  mmm:  dF.i18n.monthNames[m],
		  mmmm: dF.i18n.monthNames[m + 12],
		  yy:   String(y).slice(2),
		  yyyy: y,
		  h:    H % 12 || 12,
		  hh:   pad(H % 12 || 12),
		  H:    H,
		  HH:   pad(H),
		  M:    M,
		  MM:   pad(M),
		  s:    s,
		  ss:   pad(s),
		  l:    pad(L, 3),
		  L:    pad(L > 99 ? Math.round(L / 10) : L),
		  t:    H < 12 ? "a"  : "p",
		  tt:   H < 12 ? "am" : "pm",
		  T:    H < 12 ? "A"  : "P",
		  TT:   H < 12 ? "AM" : "PM",
		  Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
		  o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
		  S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
	  };

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};

// override read function adding X-CSRFToken header
OpenLayers.Protocol.SOS.v1_0_0.prototype.read = function(options) {    
    options = OpenLayers.Util.extend({}, options);
    OpenLayers.Util.applyDefaults(options, this.options || {});
    var response = new OpenLayers.Protocol.Response({requestType: "read"});
    var format = this.format;
    var data = OpenLayers.Format.XML.prototype.write.apply(format,
                                                           [format.writeNode("sos:GetFeatureOfInterest", {fois: this.fois})]
                                                          );
    response.priv = OpenLayers.Request.POST({
        url: options.url,
        callback: this.createCallback(this.handleRead, response, options),
        data: data,
        headers: {'X-CSRFToken': Ext.util.Cookies.get('csrftoken')}
    });
    return response;
};


/**
 * Example class on how to put all the OpenLayers SOS pieces together
 */
OpenLayers.SOSClient = OpenLayers.Class({
    url: null,
    map: null,
    capsformat: new OpenLayers.Format.SOSCapabilities(),
    obsformat: new OpenLayers.Format.SOSGetObservation(),
    timeRange: 5,
    dateRange: [],

    /**
     * 
     */
    initialize: function (options) {
        OpenLayers.Util.extend(this, options);
        var params = {'service': 'SOS', 'request': 'GetCapabilities'};
        var paramString = OpenLayers.Util.getParameterString(params);
        url = OpenLayers.Util.urlAppend(this.url, paramString);
        OpenLayers.Request.GET({url: url,
                                success: this.parseSOSCaps, scope: this});

        var today = new Date(),
            begin = new Date(),
            end = new Date();    
        
        begin.setDate(today.getDate() - this.timeRange);
        this.dateRange = [begin, end];

    },

    /**
     * 
     */
    parseSOSCaps: function(response) {
        // cache capabilities for future use
        this.SOSCapabilities = this.capsformat.read(response.responseXML || response.responseText);
        this.layer = new OpenLayers.Layer.Vector(this.SOSCapabilities.serviceIdentification.title, {
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol: new OpenLayers.Protocol.SOS({
                formatOptions: {internalProjection: new OpenLayers.Projection('EPSG:4326')},
                url: this.url,
                fois: this.getFois()
            }),
            projection: new OpenLayers.Projection("EPSG:4326"),
            displayInLayerSwitcher: false
        });
        this.map.addLayer(this.layer);
        this.ctrl = new OpenLayers.Control.SelectFeature(this.layer,
                                                         {scope: this, onSelect: this.onFeatureSelect});
        this.map.addControl(this.ctrl);
        this.ctrl.activate();
    },
    
    destroyLayer: function(){
        this.ctrl.deactivate();
        this.map.removeControl(this.ctrl);
        this.layer.map.removeLayer(this.layer);
        this.layer.destroy();
        this.destroy();
    },
    
    /**
     * 
     */
    getFois: function() {
        var result = [];
        this.offeringCount = 0; 
        for (var name in this.SOSCapabilities.contents.offeringList) {
            var offering = this.SOSCapabilities.contents.offeringList[name];
            this.offeringCount++;
            for (var i=0, len=offering.featureOfInterestIds.length; i<len; i++) {
                var foi = offering.featureOfInterestIds[i]
                if (OpenLayers.Util.indexOf(result, foi) === -1) {
                    result.push(foi);
                }
            }
        }
        return result;
    },
    
    /**
     * 
     */
    getTitleForObservedProperty: function(property) {
        for (var name in this.SOSCapabilities.contents.offeringList) {
            var offering = this.SOSCapabilities.contents.offeringList[name];
            if (offering.observedProperties[0] === property) {
                return offering.name;
            }
        }
    },

    getNameForObservedProperty: function(property) {
        for (var name in this.SOSCapabilities.contents.offeringList) {
            var offering = this.SOSCapabilities.contents.offeringList[name];
            if (offering.observedProperties[0] === property) {
                return name;
            }
        }
    },
    
    /**
     * 2012-02-23 11:49:00
     */
    getFormattedDateFromTimePos: function(timePos) {
        var date = new Date(Date.parse(timePos));
        var formattedString = date.format("isoDate") + " " + date.format("isoTime");
        
        return formattedString;
    },
    
    /**
     * 2012-02-22T19:00:00+00:00
     */
    getGmlTimeperiod: function() {
        var begin = this.dateRange[0];
        var end = this.dateRange[1];
        var timeperiod = "<eventTime>" + 
                "<ogc:TM_During>" + 
                "<ogc:PropertyName>om:samplingTime</ogc:PropertyName>" + 
                "<gml:TimePeriod>" + 
                "<gml:beginPosition>" + begin.format("isoDateTime") + "</gml:beginPosition>" + 
                "<gml:endPosition>" + end.format("isoDateTime") + "</gml:endPosition>" + 
                "</gml:TimePeriod>" + 
                "</ogc:TM_During>" + 
                "</eventTime>";
        
        return timeperiod;
    },

    sensorsStore: null,


    legends: null,
    
    initLegends: function(){
        this.legends = $("#placeholder .legendLabel");
        this.legends.each(function () {
            // fix the widths so they don't jump around
            $(this).css('width', $(this).width());
        });

        $("#placeholder").bind("plothover",  function (event, pos, item) {
            sos.latestPosition = pos;
            if (!sos.updateLegendTimeout){
                sos.updateLegendTimeout = setTimeout(function(){sos.updateLegend();}, 50);
            }
        });
    },

    initPanZoom: function(){
        $("#placeholder").bind('plotpan', function (event, plot) {
            sos.initLegends();
        });
        
        $("#placeholder").bind('plotzoom', function (event, plot) {
            sos.initLegends();
        });
        
    },

    updateLegendTimeout: null,
    latestPosition: null,
    
    updateLegend: function(){
        this.updateLegendTimeout = null;
        
        var pos = this.latestPosition;
        
        var axes = this.plot.getAxes();
        if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max ||
            pos.y < axes.yaxis.min || pos.y > axes.yaxis.max)
            return;

        var i, j, dataset = this.plot.getData();
        for (i = 0; i < dataset.length; ++i) {
            var series = dataset[i];

            // find the nearest points, x-wise
            for (j = 0; j < series.data.length; ++j)
                if (series.data[j][0] > pos.x)
                    break;
            
            // now interpolate
            var y, p1 = series.data[j - 1], p2 = series.data[j];
            if (p1 == null)
                y = p2[1];
            else if (p2 == null)
                y = p1[1];
            else
                y = p1[1] + (p2[1] - p1[1]) * (pos.x - p1[0]) / (p2[0] - p1[0]);
            
            this.legends.eq(i).text(series.label.replace(/=.*/, "= " + y.toFixed(3)));
        }
    },
    
    /**
     * 
     */
    showPopup: function(response) {
        SensorRecord = Ext.data.Record.create([
            {name: "type", type: "string"},
            {name: "name", type: "string"},
            {name: "time", type: "string"},
            {name: "lastvalue", type: "string"}
        ]);
        
        this.count++;
        var output = this.obsformat.read(response.responseXML || response.responseText);
        if (output.measurements.length > 0) {
            var timePos = output.measurements[0].samplingTime.timeInstant.timePosition;
            var formattedString = this.getFormattedDateFromTimePos(timePos);

            var record = new SensorRecord({
                type: this.getTitleForObservedProperty(output.measurements[0].observedProperty),
                name: this.getNameForObservedProperty(output.measurements[0].observedProperty),
                time: formattedString,
                lastvalue: output.measurements[0].result.value + ' ' + output.measurements[0].result.uom
            });
            
            this.sensorsStore.add(record);
        }
    },
    
    addSerie: function(response) {
        var output = this.sosClient.obsformat.read(response.responseXML || response.responseText);

        if (output.measurements.length > 0) {
            var rows = [];
            // a look-up object for different time formats
            var timeMap = {};
            for(var i=0; i<output.measurements.length; i++) {
                
                var timePos = output.measurements[i].samplingTime.timeInstant.timePosition;
                var timePosObj = new Date(timePos);
                var timestamp = timePosObj.getTime();
                
                rows.push([timestamp, parseFloat(output.measurements[i].result.value)]);
                
            }
            
        }

        function sortfunction(a, b){
            if(a[0] > b[0]) {
                return 1;
            }
            else {
                return -1;
            }
            
        }
        rows.sort(sortfunction);
        var label = this.data.type + " = -0.00";
        this.sosClient.seriesData.push({data: rows, label: label, sensorName: this.data.name });
        this.sosClient.drawChart();
        this.chartMask.hide();
    },
    seriesData: [], //[{ 

    chartReload: function(){
        alert('TODO');
    },
    
    plot: null,
    chartOptions: {
        series: { 
            lines: { show: true },
            points: { show: true, radius: 2 } ,
            stack: false
        },
        crosshair: { mode: "x" },
        xaxis: {
            mode: "time",
            timeformat: "%d/%m/%y %H:%M",
            labelAngle: 45
        },
        grid: { hoverable: true, autoHighlight: false},
        zoom: {
            interactive: true
        },
        pan: {
            interactive: true
        }
        //yaxis: { min: 0.00, max: 360.00 }
    },
    drawChart: function() {
        var options = this.chartOptions;
        this.plot = $.plot($("#placeholder"), this.seriesData, options );
        this.initLegends();
        this.initPanZoom();
    },
    chartMask: null,
    onDeselect: function(sm, rowIndex, record ){
        for(var i=0; i< this.seriesData.length; i++) {
            var serie = this.seriesData[i];
            if(serie['sensorName'] == record.data.name){
                this.seriesData.splice(i,1);
            }
        }
    },

    onOfferingSelect: function(sm, rowIndex, record ){
        var name = record.data.name;

        var feature = this.feature;
        var offering = this.SOSCapabilities.contents.offeringList[name];
        var foi = {objectId: feature.attributes.id};

        //c'è un problema con array e extjs: vedi commento più avanti
        var observedProperties = {};
        offering.observedProperties.forEach(function(val, i) {
            observedProperties[i]=val;
        });

        // get a time range for chart
        var xml2 = this.obsformat.write({
            eventTime: 'first',
            resultModel: 'om:Measurement',
            responseMode: 'inline',
            procedure: feature.attributes.id,
            foi: foi,
            offering: name,
            observedProperties: observedProperties,
            responseFormat: this.responseFormat
        });
        
        var timeperiodXml = this.getGmlTimeperiod();
        
        // a little rework due to missing timeperiod in OL-Format
        xml2 = xml2.replace("xmlns:ogc=\"http://www.opengis.net/ogc\"", "xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:gml=\"http://www.opengis.net/gml\"");
        xml2 = xml2.replace("<eventTime/>", timeperiodXml);

        //autoreference
        record.sosClient = this;
        if(! this.chartMask) this.chartMask = new Ext.LoadMask(Ext.get('placeholder'));
        this.chartMask.show();
        OpenLayers.Request.POST({
            url: this.url,
            scope: record,
            success: this.addSerie,
            failure: function() {
                ("No data for charts...");
            },
            data: xml2,
            headers: {'X-CSRFToken': Ext.util.Cookies.get('csrftoken')}
        });
    },
    
    
    /**
     * 
     */
    onFeatureSelect: function(feature) {

        this.feature = feature;
        this.count = 0;
        this.html = '';
        this.numRequests = this.offeringCount;
        if (!this.responseFormat) {
            for (format in this.SOSCapabilities.operationsMetadata.GetObservation.parameters.responseFormat.allowedValues) {
                // look for a text/xml type of format
                if (format.indexOf('text/xml') >= 0) {
                    this.responseFormat = format;
                }
            }
        }
        
        //reinit
        this.seriesData = [];
        this.sensorsStore = new Ext.data.ArrayStore({
            // store configs
            autoDestroy: true,
            storeId: 'sensorsStoreId',
            // reader configs
            idIndex: 0,  
            fields: [
                {name: 'type'},
                {name: 'name'},
                {name: 'time'},
                {name: 'lastvalue'}
            ]
        });

        var details = new Ext.Window({
            title: "SOS details",
            maximizable: true,
            width: 800,
            height: 300,
            layout: 'border',
            items: [
                {
                    xtype: 'grid',
                    region: 'west',
                    width: 480,
                    split: true,
                    store: this.sensorsStore,
                    colModel: new Ext.grid.ColumnModel({
                        defaults: {
                            width: 150,
                            sortable: true
                        },
                        columns: [
                            {id: 'type', header: 'Type', dataIndex: 'type'},
                            {header: 'Time', dataIndex: 'time'},
                            {header: 'Last Value', dataIndex: 'lastvalue'}
                        ]
                    }),
                    sm: new Ext.grid.RowSelectionModel({
                        singleSelect:false,
                        listeners: {
                            'rowselect': this.onOfferingSelect,
                            'rowdeselect': this.onDeselect,
                            scope: this
                        }
                    }),
                    iconCls: 'icon-grid',
                    autoScroll: true
                },{
                    xtype: 'panel',
                    id: 'chart-panel',
                    html: "<div id='placeholder' class='chart'></div>",
                    region: "center",
                    padding: '3 3 3 3',
                    tbar:[{
                        xtype: 'label',
			            html:'Start date'
                    },' ',{
                        id: 'chart-start-date',
                        xtype: 'datefield',
                        value: this.dateRange[0],
                        listeners: {
		                    "valid": function(field){
                                this.dateRange[0] =  field.getValue();
                                if(this.dateRange[0]){
                                    this.dateRange[0].setHours(0,0,0,0);
                                }
		                    },
                            scope: this
	                    }
                    },' ','-',' ',{
                        xtype: 'label',
			            html:'End date'
                    },' ',{
                        id: 'chart-end-date',
                        xtype: 'datefield',
                        value: this.dateRange[1],
                        listeners: {
		                    "valid": function(field){
                                this.dateRange[1] = field.getValue();
                                if(this.dateRange[1]){
                                    this.dateRange[1].setHours(23,59,59,99);
                                }
		                    },
                            scope: this
	                    }
                    },' ',{
                        text: 'Reload',
                        listeners: {
		                    "click": this.chartReload,
                            scope: this
	                    }
                    },' ','-',{
                        text: 'Line',
                        listeners: {
		                    "click": function(){
                                this.chartOptions['series']['lines']['show'] = true;
                                this.chartOptions['series']['points']['show'] = false;
                                this.drawChart();
                            },
                            scope: this
	                    }
                    },'-',{
                        text: 'Points',
                        listeners: {
		                    "click": function(){
                                this.chartOptions['series']['lines']['show'] = false;
                                this.chartOptions['series']['points']['show'] = true;
                                this.drawChart();
                            },
                            scope: this
	                    }
                    },'-',{
                        text: 'Line & points',
                        listeners: {
		                    "click": function(){
                                this.chartOptions['series']['lines']['show'] = true;
                                this.chartOptions['series']['points']['show'] = true;
                                this.drawChart();
                            },
                            scope: this
	                    }
                    }]
                }
            ],
            // items: {
            //     xtype: "container",
            //     cls: "error-details",
            //     html: html
            // },
            autoScroll: true,
            buttons: [{
                text: "OK",
                handler: function() { details.close(); }
            }]
        });
        details.show();



        // do a GetObservation request to get the latest values
        for (var name in this.SOSCapabilities.contents.offeringList) {
            var offering = this.SOSCapabilities.contents.offeringList[name];
            var foi = {objectId: feature.attributes.id};

            
            //problema nel loop degli array all'interno del writers perché Ext modifica l'array base dj js ( Ext Array.prototype.indexOf)
            //trasformo l'array in un dictionary
            var observedProperties = {};
            offering.observedProperties.forEach(function(val, i) {
                observedProperties[i]=val;
            });

            var xml = this.obsformat.write({
                eventTime: 'latest',
                resultModel: 'om:Measurement',
                responseMode: 'inline',
                procedure: feature.attributes.id,
                foi: foi,
                offering: name,
                observedProperties: observedProperties,
                responseFormat: this.responseFormat
            });
            OpenLayers.Request.POST({
                url: this.url,
                scope: this,
                failure: this.showPopup,
                success: this.showPopup,
                data: xml,
                headers: {'X-CSRFToken': Ext.util.Cookies.get('csrftoken')}
            });
            
            // // get a time range for chart
            // var xml2 = this.obsformat.write({
            //     eventTime: 'first',
            //     resultModel: 'om:Measurement',
            //     responseMode: 'inline',
            //     procedure: feature.attributes.id,
            //     foi: foi,
            //     offering: name,
            //     observedProperties: offering.observedProperties,
            //     responseFormat: this.responseFormat
            // });
            
            // var timeperiodXml = this.getGmlTimeperiod();
            
            // // a little rework due to missing timeperiod in OL-Format
            // xml2 = xml2.replace("xmlns:ogc=\"http://www.opengis.net/ogc\"", "xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:gml=\"http://www.opengis.net/gml\"")
            // xml2 = xml2.replace("<eventTime/>", timeperiodXml);
            // OpenLayers.Request.POST({
            //     url: this.url,
            //     scope: this,
            //     success: this.drawChart,
            //     failure: function() {
            //         alert("No data for charts...");
            //     },
            //     data: xml2
            // });
        }
    },
    
    /**
     * 
     */
    destroy: function () {
    },

    /**
     * 
     */
    CLASS_NAME: "OpenLayers.SOSClient"
});

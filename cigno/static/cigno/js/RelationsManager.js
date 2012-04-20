Ext.namespace("Cigno");

//this.store.storeToTree = function(dump){
var storeToTree = function(store, dump){
    data = {};
    store.each(function( item ) {
	//data
	if(!data[item.data.p]){
            data[item.data.p] = {text: item.data.pl, children: [], expanded: true};
	}
	//data[item.data.pl].push(item.data);
	data[item.data.p]['children'].push({text: item.data.ol, 
                                            id: item.data.id,
                                            href: item.data.o,
                                            hrefTarget: '_blank',
                                            leaf:true, 
                                            iconCls: 'icon-removeuser',
                                            cls: 'icon-removeuser',
                                            checked: false
                                           });
    });
    var children = [];
    for(child in data){
	children.push(data[child]);
	//console.log(data[child]);
    }
    //return children;
    if(dump){
	return children;
    }
    return new Ext.tree.AsyncTreeNode({
	expanded: true,
	leaf: false,
	text: 'Tree Root',
        children: children
    });
};

var labelType, useGradients, nativeTextSupport, animate;
(function() {
    var ua = navigator.userAgent,
	iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
	typeOfCanvas = typeof HTMLCanvasElement,
	nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
	textSupport = nativeCanvasSupport 
	    && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
    //I'm setting this based on the fact that ExCanvas provides text support for IE
    //and that as of today iPhone/iPad current text support is lame
    labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
    nativeTextSupport = labelType == 'Native';
    useGradients = nativeCanvasSupport;
    animate = !(iStuff || !nativeCanvasSupport);
})();

var ggg =null;

var Log = {
    elem: false,
    write: function(text){
	if (!this.elem) 
	    this.elem = document.getElementById('inner-details');
	this.elem.innerHTML = text;
	//this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
    }
};

function initgraph(json){
    //init data
    //By defining properties with the dollar sign ($)
    //in nodes and edges we can override the global configuration
    //properties for nodes and edges.
    //In this case we use "$type" and "$dim" properties to override
    //the type of the node to be plotted and its dimension.
    //end
    //init Hypertree
    var ht = new $jit.Hypertree({
	//id of the visualization container
	injectInto: 'infovis',
	//By setting overridable=true,
	//Node and Edge global properties can be
	//overriden for each node/edge.
	offset: 0.1,
	Node: {
	    dim: 9,  
	    //color: "#003c4c"  
	    color: "#008CB3"
	},
	Label: {
	    //color: "#088"  
            //color: "white"  
	},
	Edge: {
	    lineWidth: 2,  
	    overridable: true,
	    //color: "#088"
	    color: "#637F6E"
	},
	onBeforeCompute: function(node){
	    Log.write("centering");
	},
	//Attach event handlers on label creation.
	onCreateLabel: function(domElement, node){  
	    domElement.innerHTML = node.name;  
	    $jit.util.addEvent(domElement, 'click', function () {  
		ht.controller.loadNode(node);
// 		Ext.Ajax.request({
//                     url: '/mdtools/rdf/graph/',
//                     params: {
// 			s: node.data.url
//                     },
//                     success: function(response, options){
// 			var trueGraph = Ext.util.JSON.decode(response.responseText);
// 			//perform sum animation.  
// 			ht.op.sum(trueGraph, {  
// 			    type: 'fade:seq',  
// 			    fps: 30,  
// 			    duration: 1000,
// 			    onComplete: function() {
// 				ht.onClick(node.id, {  
// 				    onComplete: function() {  
// 					ht.controller.onComplete();  
// 				    }  
// 				});  
// 			    }
// 			});  
//                     }
// 		});
	    });  
	},  
	loadNode: function(node){
	    if(!ht.loadedNode){
		    ht.loadedNode = {} ;
	    }
	    if(!(node.data.url in ht.loadedNode)){
		Ext.Ajax.request({
		    url: '/mdtools/rdf/graph/',
                    params: {
			s: node.data.url
                    },
		    success: function(response, options){
                        var trueGraph = Ext.util.JSON.decode(response.responseText);
                        //perform sum animation.
			ht.op.sum(trueGraph, {
                            type: 'fade:seq',
                            fps: 30,
                            duration: 1000,
                            onComplete: function() {				
                                ht.onClick(node.id, {
                                    onComplete: function() {
                                        ht.controller.onComplete();
                                    }
                                });
				ht.loadedNode[node.data.url] = true;
                            }
                        });
                    }
		});
	    } else {
                ht.onClick(node.id, {
                    onComplete: function() {
                        ht.controller.onComplete();
                    }
                });
	    }
	},
	onPlaceLabel: function(domElement, node){
	    var style = domElement.style;  
	    style.display = '';  
	    style.cursor = 'pointer';  
            //console.log(node);
	    if (node._depth == 0) {  
		style.fontSize = "1.0em";  
                //console.log(style.zIndex);
                style.zIndex= 100;
                domElement.innerHTML = node.name;
	    } else if(node._depth == 1){
		style.fontSize = "0.9em";  
                //console.log(style.zIndex);
                style.zIndex= 90;
                domElement.innerHTML = node.name.substring(0,30) + '...';
	    }else if(node._depth == 2){  
		style.fontSize = "0.8em";  
                //console.log(style.zIndex);
                style.zIndex= 80;
                domElement.innerHTML = node.name.substring(0,30) + '...';
	    } else {  
		style.display = 'none';  
                //console.log(style.zIndex);
                style.zIndex= 70;
	    }  
            
	    var left = parseInt(style.left);  
	    var w = domElement.offsetWidth;  
	    style.left = (left - w / 2) + 'px';  
	},
	onComplete: function(){
	    Log.write("done");  
	    var node = ht.graph.getClosestNodeToOrigin("current");
	    $jit.id('inner-title').innerHTML = "<a href='" + node.data.url + "'>" + node.name + "</a>";
	    $jit.id('inner-details').innerHTML = 'Loading...';
	    Ext.Ajax.request({
		url: '/data/search/detail?uuid=' + node.data.uuid,
		success: function(response, options){
		    $jit.id('inner-details').innerHTML = response.responseText;
		}
	    });
	}	  
    });
    // find index of root node
    var rootid=0;
    for(var nid in json){
        //console.log(nid);
        if('root' in json[nid] && json[nid]['root']){
            rootid = nid;
        } 
    }
    ht.loadJSON(json, rootid);
    ht.refresh();
    ht.controller.onComplete();
    Ext.getCmp('infovis-container').on(
	'resize',
	function() {
	    newsize = Ext.get('infovis').getSize();
	    ht.canvas.resize(newsize.width, newsize.height);
	}
    );
}


var graphWindow = new Ext.Window({
    title:'Connections graph'
    ,closeAction : 'hide'
    ,width       : 700
    ,height      : 600
    ,plain       : true
    ,maximizable : true
    //,html        : '<div id="infovis"></div><div id="inner-details"></div>'
    ,layout: 'border'
    ,defaults: {
	//collapsible: true,
	split: true
    }
    ,items       : [{
	//xtype : 'box',
	region: 'center',
	name  : 'infovis-container',
	id    : 'infovis-container',
	layout: 'fit',
	html  : '<div id="infovis" style="width: 100%; height: 100%"></div>'
    },{
	//xtype : 'box',
	region: 'south',
	name  : 'inner-details-container',
	id    : 'inner-details-container',
	html  : '<h4 id="inner-title"></h4><div id="inner-details"></div>',
	height: 200,
	//cmargins: '5 0 0 0',
	autoScroll: true
	//bodyStyle: 'padding:15px'
    }
		   ]
});



Cigno.RelationsManager = Ext.extend(Ext.util.Observable, {
    rdf_url: null,
    rdf_s: null,
    constructor: function(config) {
	Ext.apply(this, config);
	//this.addEvents({ 'updated': true });
	Cigno.RelationsManager.superclass.constructor.call(this, config);
	this.initStores();
	this.buildObjs();
	this.doLayout();
    },
    initStores: function(config) {
	this.objectstore = new Ext.data.Store({
            proxy: new Ext.data.HttpProxy({ url: '/data/search/api', method: 'POST' }),
            reader: new Ext.data.JsonReader({
		root: 'rows',
		totalProperty: 'count',
		fields: [
		    {name: 'name', type: 'string'},
		    {name: 'title', type: 'string'},
		    {name: 'uuid', type: 'string'},
		    {name: 'abstract', type: 'string'},
		    {name: 'keywords'},
		    {name: 'detail', type: 'string'},
		    {name: 'attribution'},
		    {name: 'download_links'},
		    {name: 'metadata_links'},
		    {name: 'bbox'},
		    {name: '_local'},
		    {name: '_permissions'}
		]
            })
	});
	this.relationstore = new Ext.data.Store({
            proxy: new Ext.data.HttpProxy({ url: '/mdtools/rdf/relations/', method: 'POST' }),
            reader: new Ext.data.JsonReader({
		root: 'rows',
		totalProperty: 'count',
		fields: [
		    {name: 'label', type: 'string'},
		    {name: 'uri', type: 'string'}
		]
            })
	});
	this.store = new Ext.data.Store({
            proxy: new Ext.data.HttpProxy(
		{ //url: '/mdtools/rdf/api/', 
		    method: 'POST',
		    api: {
			read    : '/mdtools/rdf/api/read/',
			create  : '/mdtools/rdf/api/create/',
			update  : '/mdtools/rdf/api/update/',
			destroy : '/mdtools/rdf/api/destroy/'
		    }
		}
            ),
            baseParams: {
		s: this.rdf_s
            },
            autoLoad: true,
            autoSave: true,
            autoDestroy: true,
            reader: new Ext.data.JsonReader({
		root: 'rows',
		totalProperty: 'count',
		fields: ['id', 's','p','o','pl','ol','d'],
		idProperty: 'id'
            }),
            writer: new Ext.data.JsonWriter(
		{
		    encode: true,
		    encodeDelete: true,
		    writeAllFields: true
		}
            ),
            listeners: {         
		save: {scope:this, fn:function(store) {
		    //console.log('save');
		    //this.treePanel.setRootNode(this.store.storeToTree());
		    this.treePanel.setRootNode(storeToTree(this.store));
		}},
		load: {scope:this, fn:function(store) {
		    this.treePanel.setRootNode(storeToTree(this.store));
		}}
            }
	});
    },
    buildTreePanel: function() {
	return new Ext.tree.TreePanel({                        
            id: 'tree-related',
            loader: new Ext.tree.TreeLoader(),
            autoHeight:true,
            root: storeToTree(this.store),
            rootVisible: false,
            border: false,
            useArrows: true,
            animate: true,
            buttonAlign: 'left', // anything but 'center' or 'right' and you can use '-', and '->'
            tbar: [
		{text: 'View graph',
		 handler: function(){
                     graphWindow.show();
		     Ext.Ajax.request({
			 url: this.rdf_url,
			 params: {
			     s: this.rdf_s
			 },
			 success: function(response, options){
			     graphWindow.show();	  
			     initgraph(Ext.util.JSON.decode(response.responseText));
			 }
		     });
		 },
		 scope: this
		},
		'->',
		{text: 'Delete selected',
		 handler: function(){
                     var msg = '', selNodes = this.treePanel.getChecked();
                     Ext.each(selNodes, function(node){
			 if(msg.length > 0){
			     msg += ', ';
			 }
			 msg += node.text;
			 //console.log(node);
                     });
                     Ext.Msg.show({
			 title:'Delete relations?',
			 msg: msg.length > 0 ? 'Are you sure you want to remove the relations: ' + msg +  ' ?' : 'No row selected!!',
			 buttons: msg.length > 0 ? Ext.Msg.YESNOCANCEL : Ext.Msg.OK,
			 fn: function(buttonId, text, opt){
			     if(buttonId=='yes'){
				 //console.log(selNodes);
				 if(!selNodes){
				     return false;
				 }
				 rec = [];
				 for(selNode in selNodes){
				     //console.log(selNode);
				     //console.log(selNodes[selNode]);
				     rec.push(this.store.getById(selNodes[selNode].id));
				 }
				 //console.log(rec);
				 this.store.remove(rec);
			     }
			 },
			 scope: this,
			 animEl: 'elId',
			 icon: Ext.MessageBox.QUESTION
                     });
		 },
		 scope: this
		}]                     
	});
    },
    buildGridPanel: function(){
	return new Ext.grid.GridPanel({
            store: this.store,
            colModel: new Ext.grid.ColumnModel({
		defaults: {
		    sortable: true
		},
		columns: [
		    {header: 'Type', dataIndex: 'pl', width: 60 },
		    {header: 'Resource', dataIndex: 'ol', width: 190}
		]
            }),
            sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
            //width: 260,
            height: 200,
            frame: false,
            //title: 'Related resources',
            //iconCls: 'icon-grid',
            tbar: [{
		text: 'Delete',
		iconCls: 'icon-removeuser',
		handler: function(){
		    var rec = this.grid.getSelectionModel().getSelected();
		    if (!rec) {
			return false;
		    }
		    this.grid.store.remove(rec);
		},
		scope: this
            }]
	});
    },
    buildObjs: function(){
	this.treePanel = this.buildTreePanel();  
	this.grid = this.buildGridPanel();  
	this.availableObjects = new Ext.form.ComboBox({
            id: "available-objects",
            name: "object",
            fieldLabel: "resource",
            allowBlank: false,
            width: 270,
            store: this.objectstore,
            queryParam: 'q',
            typeAhead: true,
            minChars: 0,
            align: 'right',
            border: 'false',
            displayField: 'title',
            valueField: 'detail',
            emptyText: gettext("Select resource...")//,
	});

	this.availableRelations = new Ext.form.ComboBox({
            name: "relation",
            fieldLabel: "relation",
            allowBlank: false,
            width: 270,
            store: this.relationstore,
            queryParam: 'q',
            typeAhead: true,
            minChars: 0,
            align: 'right',
            border: 'false',
            displayField: 'label',
            valueField: 'uri',
            emptyText: gettext("Select relation type...")//,
	});
    },
    doLayout: function(){
	//console.log(this.renderTo);

	this.container = new Ext.Panel({
            renderTo: this.renderTo,
            width:  270,
	    //height: 300,
            autoHeight: true,
            layout: 'form',
            items: [
		{  
		    border: false,
		    items: [
			this.treePanel,
			this.availableRelations, 
			this.availableObjects
		    ]            
		}
            ],
            bbar: new Ext.Toolbar({
		items: [{
		    text: 'Add relation',
		    handler: function(){
			var s = this.rdf_s;
			var p = this.availableRelations.getValue();
			var o = this.availableObjects.getValue();      
			var pl = this.availableRelations.findRecord(this.availableRelations.valueField, p).get(this.availableRelations.displayField);
			var ol = this.availableObjects.findRecord(this.availableObjects.valueField, o).get(this.availableObjects.displayField);
			
			record = new this.store.recordType({
			    'id': s + '|' + p + '|' + o,
			    's': s,
			    'p': p,
			    'o': o,
			    'pl': pl,
			    'ol': ol
			});
			this.store.insert(0, record);
		    },
		    scope: this
		}]
            }),
            buttonAlign: 'left'
	});
    }
});

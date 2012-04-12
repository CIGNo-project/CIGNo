Ext.namespace("Cigno");
Ext.QuickTips.init();

Cigno.KeywordsGrid2 = Ext.extend(Ext.grid.GridPanel, {
   lang: 'en',
   outputLangs: ['it','en'],
   constructor: function(config) {
	  //
	  var thisGrid = this;
	  var thesaurusReader = new ThesaurusReader({
	     id: 'thesaurusReader',
	     lang: config.lang,
	     outputLangs: config.outputLangs,
         INSPIRE: "http://inspire-registry.jrc.ec.europa.eu/registers/FCD/items/",
         //region : 'center',
         //title: 'GEMET Thesaurus',
         appPath: '/static/cigno/externals/gemetclient/src/',
         separator: ' > ',
         returnPath: true,
         returnInspire: true,
         layout: 'fit',
         proxy: "/proxy/?url=",
	     //height: 400,
         handler: function(result){
		    thisGrid.insertTerms(result.terms, result.version, result.uri);
         }
	  });
	  
	  config = Ext.apply({
	     viewConfig: {forceFit: true},
         store: new Ext.data.SimpleStore({
		    fields: [
		       {name: 'terms'},
		       {name: 'uri'},
		       {name: 'thesaurus'}
	        ]
         }),
         columns: [
		    {
		       id       :'terms',
		       header   : 'Terms', 
		       sortable : true, 
		       dataIndex: 'terms',
		       renderer:    function(terms){
			      output = '<div style="white-space:normal !important;">';
			      for (term in terms){
	                 output += '<span><b>[' + term + ']</b> ' + terms[term] + '</span><br/>';
			      }
			      output += '</div>';
			      return output;
		       }
		    },
		    {
		       header   : 'uri', 
		       sortable : true, 
		       dataIndex: 'uri',
		       hidden   : true
		    },
		    {
		       header   : 'thesaurus', 
		       sortable : true, 
		       dataIndex: 'thesaurus'
		    }
         ],
         fbar: [{
		    text: 'Add keywords',
		    handler: function(button, evt){
		       if (!button.win) {
			      button.win = new Ext.Window({
			         title: 'GEMET Thesaurus',
			         closable: true,
			         width: 600,
			         height: 450,
			         //border:false,
			         plain: true,
			         layout: 'fit',
			         items: [thesaurusReader]
			      });
		       }
		       if (button.win.isVisible()) {
			      button.win.hide();
		       } else {
			      button.win.show();
		       }
		    }
	     },'-',{
		    text: 'Delete selected',
		    iconCls: 'silk-delete',
		    handler: function() {
		       var rec = this.getSelectionModel().getSelected();
		       if (!rec) {
			      return false;
		       }
		       this.store.remove(rec);
		       return true;
		    },
		    scope: this
	     }],
         stripeRows: true
         //autoExpandColumn: 'terms',
         //height: 350,
         //width: 600,
         //title: 'Keywords',
         // config options for stateful behavior
         //stateful: true,
         //stateId: 'keywordsGrid'
	  }, config);
	  //    this.addEvents('load'); 
	  //    Ext.apply(this, config);
	  Cigno.KeywordsGrid.superclass.constructor.apply(this, [config]);
   },      
   readData: function(json){
	  //var keydata = Ext.getCmp('id-gemetkeywords');
	  if(json != ''){
	     this.store.loadData(Ext.util.JSON.decode(json));
	  }
   },
   writeData: function(){
	  var keydata = [];
	  for ( var i = 0; i < this.store.getCount(); i++ ) {
	     rec = this.store.getAt(i);
	     keydata.push([rec.data.terms, rec.data.uri, rec.data.thesaurus]);
	  }
	  return Ext.util.JSON.encode(keydata);
   },
   insertTerms: function(terms, version, uri){
	  var s = '';
	  var u = new this.store.recordType({
	     terms: terms,
	     thesaurus : version,
    	 uri : uri
	  });
	  this.store.insert(0, u);
   }
});

Ext.reg('keywordsgrid', Cigno.KeywordsGrid2);

Cigno.KeywordsGrid = Ext.extend(Ext.grid.GridPanel, {
   constructor: function(config) {
	  config = Ext.apply({
	     viewConfig: {forceFit: true},
         store: new Ext.data.SimpleStore({
		    fields: [
		       {name: 'terms'},
		       {name: 'uri'},
		       {name: 'thesaurus'}
	        ]
         }),
         region : 'center',
         columns: [
		    {
		       id       :'terms',
		       header   : 'Terms', 
		       width    : 250, 
		       sortable : true, 
		       dataIndex: 'terms',
		       renderer:    function(terms){
			      output = '<div style="white-space:normal !important;">';
			      for (term in terms){
	                 output += '<span><b>[' + term + ']</b> ' + terms[term] + '</span><br/>';
			      }
			      output += '</div>';
			      return output;
		       }
		    },
		    {
		       header   : 'uri', 
		       //width    : 50, 
		       sortable : true, 
		       dataIndex: 'uri',
		       hidden   : true
		    },
		    {
		       header   : 'thesaurus', 
		       //width    : 150, 
		       sortable : true, 
		       dataIndex: 'thesaurus'
		       //hidden   : true
		    }
         ],
         tbar: [
		    {
		       text: 'Delete',
		       iconCls: 'silk-delete',
		       handler: function() {
			      var rec = this.getSelectionModel().getSelected();
			      if (!rec) {
			         return false;
			      }
			      this.store.remove(rec);
		       },
		       scope: this
	        }, '-'],
         stripeRows: true,
         //autoExpandColumn: 'terms',
         //height: 350,
         //width: 600,
         title: 'Keywords',
         // config options for stateful behavior
         stateful: true,
         stateId: 'keywordsGrid'
	  }, config);
	  //    this.addEvents('load'); 
	  //    Ext.apply(this, config);
	  Cigno.KeywordsGrid.superclass.constructor.apply(this, [config]);
	  this.store.addListener('add', this.writeData, this);
	  this.store.addListener('remove', this.writeData, this);
	  this.loadData();
   },      
   loadData: function() {
   },
   writeData: function() {		
   },
   insertTerms: function(terms, version, uri){
	  var s = '';
	  var u = new this.store.recordType({
	     terms: terms,
	     thesaurus : version,
    	 uri : uri
	  });
	  this.store.insert(0, u);
   }
   
});


Cigno.ThesaurusReader = Ext.extend(ThesaurusReader, {
   constructor: function(config) {
	  config = Ext.apply({
         INSPIRE: "http://inspire-registry.jrc.ec.europa.eu/registers/FCD/items/",
         region : 'west',
         title  : 'west',
         width: 300, height:370,
         lang: 'en',
         outputLangs: ['it','en'],
         title: 'GEMET Thesaurus',
         appPath: '/static/cigno/externals/gemetclient/src/',
         separator: ' > ',
         returnPath: true,
         returnInspire: true,
         //width: 300, 
         //height:300,
         layout: 'fit',
         proxy: "/proxy/?url=",
         handler: function(result){
		    if(this.keywordsGrid){
		       this.keywordsGrid.insertTerms(result.terms, result.version, result.uri);
		    }
         }
	  }, config);
	  Cigno.ThesaurusReader.superclass.constructor.apply(this, [config]);
   },
   keywordsGrid: false
});

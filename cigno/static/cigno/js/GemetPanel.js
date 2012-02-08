Ext.namespace("Cigno");
Ext.QuickTips.init();

Cigno.KeywordsGrid = Ext.extend(Ext.grid.GridPanel, {
   constructor: function(config) {
      config = Ext.apply({
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
               width    : 100, 
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
               width    : 50, 
               sortable : true, 
               dataIndex: 'uri',
		       hidden   : true
            },
            {
               header   : 'thesaurus', 
               width    : 50, 
               sortable : true, 
               dataIndex: 'thesaurus',
		       hidden   : true
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
         autoExpandColumn: 'terms',
         height: 350,
         //width: 600,
         title: 'Keywords',
         // config options for stateful behavior
         stateful: true,
         stateId: 'keywordsGrid'
      }, config);
      //    this.addEvents('load'); 
      //    Ext.apply(this, config);
      Cigno.KeywordsGrid.superclass.constructor.apply(this, [config])
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
      Cigno.ThesaurusReader.superclass.constructor.apply(this, [config])
   },
   keywordsGrid: false
});

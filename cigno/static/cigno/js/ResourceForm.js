Ext.form.AutoItemSelector = Ext.extend(Ext.ux.form.ItemSelector, {
   drawUpIcon: false,
   drawDownIcon: false,
   drawTopIcon: false,
   drawBotIcon: false,      
   initComponent:function() {
	  var thisComponent = this; //reference to use in handler
      this.permissionsField = this.initialConfig['permissionsField'];
      var config = {
		 imagePath: '/static/cigno/externals/ext/examples/ux/images/',
		 bodyStyle: 'padding-bottom: 40px; padding-top: 10px;',
		 multiselects: [{
		    width: 240,
		    height: 200,	
		    store: new Ext.data.Store({
			   proxy: new Ext.data.HttpProxy({ url: this.initialConfig['url'], method: 'POST' }),
			   reader: new Ext.data.JsonReader({}),
			   autoLoad: true
		    }),
		    displayField: 'label',
		    valueField: 'id'
		 },{
		    width: 240,
		    height: 200,
		    store: new Ext.data.JsonStore({data: {"rows": [], "success": true, "metaData": {"fields": [{"name": "id"}, {"name": "label"}], "root": "rows"}}}),
		    displayField: 'label',
		    valueField: 'id',
		    tbar:[{
			   text: 'clear',
			   boxMaxHeight: '5',
			   handler:function(b){
			      //console.log(b);
			      thisComponent.reset();
			      //Ext.getCmp(.id).reset();
			      //fp.getForm().findField('topic_category_ext_str').reset();
			   }
		    }]
		 }]
      }; 
      // apply config
      Ext.apply(this, Ext.apply(this.initialConfig, config));
      Ext.form.AutoItemSelector.superclass.initComponent.apply(this, arguments);
   },
   setValue: function(val) {
      if(!val) {
		 return;
      }
      
	  if(!this.fromMultiselect.view.store.isLoaded) {
		 this.fromMultiselect.view.store.addListener('load', function() {
            this.fromMultiselect.view.store.isLoaded = true;
            this.setValue(val);
		 }, this);
		 this.fromMultiselect.view.store.load();
      }
      
      val = val instanceof Array ? val : val.split(',');
      var rec, i, id;
      for(i = 0; i < val.length; i++) {
		 id = val[i];
		 if(this.toMultiselect.view.store.getById(id)) {
            continue;
		 }
		 rec = this.fromMultiselect.view.store.getById(id);
		 if(rec) {
            this.toMultiselect.view.store.add(rec);
            this.fromMultiselect.view.store.remove(rec);
		 }
      }
	  this.fromMultiselect.view.refresh();
	  this.toMultiselect.view.refresh();
   }
});
Ext.reg('autoitemselector', Ext.form.AutoItemSelector);

//////////////////////////////////////////
Ext.form.AutoComboBox = Ext.extend(Ext.form.ComboBox, {
   initComponent:function() {
      var config = {
		 store: new Ext.data.Store({
		    proxy: new Ext.data.HttpProxy({ url: this.initialConfig['url'], method: 'POST' }),
		    reader: new Ext.data.JsonReader({}),
		    autoLoad: true,	
		    listeners: {                 
			   load: function() {
			      this.store.isLoaded = true;
			   }, scope: this
		    }
		 }),
		 displayField: 'label',
		 valueField: 'id',
		 typeAhead: true,
		 //mode: 'local',
		 triggerAction: 'all'
      }; 
      // apply config
      Ext.apply(this, Ext.apply(this.initialConfig, config));
      Ext.form.AutoComboBox.superclass.initComponent.apply(this, arguments);
   },
   setValue: function(v) {
      if(!this.store.isLoaded && this.mode == 'remote') {
		 this.store.addListener('load', function() {
            // this.store.isLoaded = true; // move on config listener
            this.setValue(v);
		 }, this);
		 this.store.load();
      } else {
		 Ext.form.AutoComboBox.superclass.setValue.apply(this, arguments);
      }
   }
});

Ext.reg('autocombo', Ext.form.AutoComboBox);

//////////////////////////////////////////
// validators
//////////////////////////////////////////
Ext.apply(Ext.form.VTypes, {
   temporalextent: function(val, field){
	  var container = field.ownerCt;
	  var start;
	  var end;
	  var fUom;
	  var fVal;
	  Ext.each(container.items.items,function(f){
		 if(f.vname == 'extent_begin'){
		    start = f;
		 }else if(f.vname == 'extent_end'){
		    end = f;
		 }else if(f.vname == 'frequency_uom'){
		    fUom = f;
		 }else if(f.vname == 'frequency_value'){
		    fValue = f;
		 }
	  });
	  if(end.id == field.id){
		 date = field.parseDate(val);
		 if (!start.maxValue || (date.getTime() != start.maxValue.getTime())) {
            start.setMaxValue(date);
            start.validate();
		 }
      } else if (start.id == field.id) {
		 date = field.parseDate(val);
		 if (!end.minValue || (date.getTime() != end.minValue.getTime())) {
            end.setMinValue(date);
            end.validate();
		 }
      }
	  return true;
   },
   responsibleparty: function(val, field){
	  var allFields = field.ownerCt.items.items;
	  var allowBlank = true;
	  Ext.each(allFields,function(f){
		 if(f.getValue() != ''){
		    allowBlank = false;
		 }
	  });
	  Ext.each(allFields,function(f){
		 if( f.allowBlank != allowBlank){
		    f.allowBlank = allowBlank;
		    if(f.id != field.id){
			   f.validate();
		    }
		 }
	  });
	  return true;
   },
   daterange : function(val, field) {
      var date = field.parseDate(val);	    
      if(!date){
		 return false;
      }
      if (field.startDateField) {
		 var start = Ext.getCmp(field.startDateField);
		 if (!start.maxValue || (date.getTime() != start.maxValue.getTime())) {
            start.setMaxValue(date);
            start.validate();
		 }
      }
      else if (field.endDateField) {
		 var end = Ext.getCmp(field.endDateField);
		 if (!end.minValue || (date.getTime() != end.minValue.getTime())) {
            end.setMinValue(date);
            end.validate();
		 }
      }
	  
      /*
	   *          * Always return true since we're only using this vtype to set the
	   *          * min/max allowed values (these are tested for after the vtype test)
	   *          */
	  return true;
   },
   password : function(val, field) {
      if (field.initialPassField) {
		 var pwd = Ext.getCmp(field.initialPassField);
		 return (val == pwd.getValue());
      }
      return true;
   },
   passwordText : 'Passwords do not match'
});



//////////////////////////////////
Ext.ResourceForm = Ext.extend(Ext.FormPanel, {
   geospatial: false,
   gemetLanguage: 'en',
   initComponent:function() {
	  var thisComponent = this; //reference to use in handler
      this.base_file = new Ext.ux.form.FileUploadField({
	     anchor: '95%',
         id: 'base_file',
         emptyText: gettext('Select a file'),
         fieldLabel: gettext('Resource'),
         name: 'base_file',
         allowBlank: false,
         listeners:  {
            "fileselected": function(cmp, value) {
               // remove the path from the filename - avoids C:/fakepath etc.
               cmp.setValue(value.split(/[/\\]/).pop());
            }
         }
      });
      this.url_field = new Ext.form.TextField({
         id: 'url_field',
	     anchor: '95%',
	     // emptyText: gettext('Insert a valid resource URL'), // non posso usarlo altrimenti passa il valore via post
	     fieldLabel: gettext('URL'),
	     name: 'url_field'
      });

      var resourceTypeConfig = {
		 xtype:'fieldset',
		 title: 'Select a resource type',
		 //collapsible: true,
		 autoHeight:true,
		 //defaults: {width: 530},
		 defaultType: 'textfield',
		 defaults: {
			msgTarget : 'side',
			anchor    : '-35'
		 },
         items:[
            {
               id: 'type_id',
	           anchor: '95%',
	           xtype: 'radiogroup',
	           //fieldLabel: 'Select a resource type',
	           cls: 'x-check-group-alt',
	           name: 'type',
	           items: [
		          {boxLabel: 'File', name: 'type', inputValue: 'local', checked: true},
		          {boxLabel: 'External link', name: 'type', inputValue: 'remote'},
		          {boxLabel: 'Metadata only', name: 'type', inputValue: 'metadata'}
		          //{boxLabel: 'Import web resource', inputValue: 'import', name: 'upload_mode'},
	           ],
	           listeners: {
		          "change": function(radiogroup, radio){
                     this.switchType(radio);
		          },
                  scope: this
	           }
	        },
	        //upload_mode, 
		    this.base_file, 
		    this.url_field
         ]
      };

      var metadataPanelConfig = {
		 xtype:'tabpanel',
		 plain:true,
		 activeTab: 0,
		 autoHeight:true,
		 deferredRender : false,
		 listeners: {
			tabchange: function(tp,newTab){
			   newTab.doLayout();
			}
		 },
		 defaults:   {autoScroll:true, autoHeight:true, bodyStyle:'padding:10px', width: 600, 
				      defaults: {
				         anchor: '97%',
				         msgTarget: 'side',
				         labelStyle: 'font-weight:bold;',
				         defaults: {
					        anchor: '97%',
					        msgTarget: 'side',
					        labelStyle: 'font-weight:bold;',
					        defaults: {
					           anchor: '97%',
					           msgTarget: 'side',
					           labelStyle: 'font-weight:bold;'
					        }
				         }
				      }
				     },
		 items:[{
			title:'Identifications',
			layout:'form',
			items:[{
			   xtype: 'tabpanel',
			   plain: true,
			   activeTab: 0,
			   autoHeight:true,
			   deferredRender : false,
			   defaults:   {autoScroll:true, autoHeight:true, bodyStyle:'padding:10px', width: 600, 
					        defaults: {
					           anchor: '97%',
					           msgTarget: 'side'
					        }
					       },			    
			   items: [{
				  title:'IT',
				  layout:'form',
				  items:[{
				     xtype: 'textfield',
				     id: 'titleml_it',
				     fieldLabel: gettext('Title') + ' (IT)',
				     name: 'titleml_it',
				     allowBlank: false
				  },{
				     xtype: 'textarea',
				     id: 'abstractml_it', 
				     fieldLabel: gettext('Abstract') + ' (IT)',
				     name: 'abstractml_it',
				     allowBlank: true
				  }]
			   },{
				  title:'EN',
				  layout:'form',
				  items:[{
				     xtype: 'textfield',
				     id: 'titleml_en',
				     fieldLabel: gettext('Title')  + ' (EN)',
				     name: 'titleml_en'
				  },{
				     xtype: 'textarea',
				     id: 'abstractml_en', 
				     fieldLabel: gettext('Abstract') + ' (EN)',
				     name: 'abstractml_en',
				     allowBlank: true
				  }]
			   }]
			},{
			   xtype: 'compositefield',
			   prefix: 'referencedate_set',
			   fieldLabel: 'Reference date',
			   msgTarget : 'side',
			   anchor    : '-20',
			   defaults: {
				  flex: 1
			   },
			   items: [{
				  xtype: 'datefield',
				  name : 'referencedate_set-0-date',
				  emptyText:'Select a date...',
				  vtype: 'responsibleparty'
			   },{
				  xtype: "autocombo",
				  hiddenName: "referencedate_set-0-date_type",
				  url: '/api/datetype/',
				  emptyText:'Select a date type...',
				  vtype: 'responsibleparty'
			   }]
			},{
			   xtype: 'label',
			   html:'<hr/>'
			},{
			   xtype: 'radiogroup',
			   fieldLabel: 'Use limitation',
			   name: 'use_limitation',
			   columns: 2,
               items: [
                  {boxLabel: 'ISMAR Data license', name: 'use_limitation', inputValue: 'ISMAR Data license'} ,
                  {boxLabel: 'CC Attribution (by)', name: 'use_limitation', inputValue: 'CC Attribution (by)'} ,
                  {boxLabel: 'CC Attribution + NoDerivatives (by-nd)', name: 'use_limitation', inputValue: 'CC Attribution + NoDerivatives (by-nd)'} ,
                  {boxLabel: 'CC Attribution + ShareAlike (by-sa)', name: 'use_limitation', inputValue: 'CC Attribution + ShareAlike (by-sa)'} ,
                  {boxLabel: 'CC Attribution + Noncommercial (by-nc)', name: 'use_limitation', inputValue: 'CC Attribution + Noncommercial (by-nc)'} ,
                  {boxLabel: 'CC Attribution + Noncommercial + NoDerivatives (by-nc-nd)', name: 'use_limitation', inputValue: 'CC Attribution + Noncommercial + NoDerivatives (by-nc-nd)'} ,
                  {boxLabel: 'CC Attribution + Noncommercial + ShareAlike (by-nc-sa)', name: 'use_limitation', inputValue: 'CC Attribution + Noncommercial + ShareAlike (by-nc-sa)'} 
               ]
			},{
			   xtype: 'label',
			   html:'<hr/>'
			},{
			   xtype:'fieldset',
			   title: 'Temporal extent / Sample frequency',
			   //collapsible: true,
			   autoHeight:true,
			   //defaults: {width: 530},
			   defaultType: 'textfield',
			   defaults: {
				  msgTarget : 'side',
				  anchor    : '-35'
			   },
			   items: [{
				  dynamic:true,
				  maxOccurs:5,
				  nclones: 0,
				  prefix: 'temporalextent_set',
				  xtype: 'compositefield',
				  id: 'temporalextent_set',
				  fieldLabel: '',
				  msgTarget : 'side',
				  defaults: {
				     flex: 2
				  },
				  items: [
				     {
					    xtype: 'datefield',
					    name : 'temporalextent_set-0-temporal_extent_begin',
					    emptyText:'Start date...',
					    vname: 'extent_begin',
					    vtype: 'temporalextent'
				     },{
					    xtype: 'datefield',
					    name : 'temporalextent_set-0-temporal_extent_end',
					    emptyText:'End date...',
					    vname: 'extent_end',
					    vtype: 'temporalextent'
				     },{
					    xtype: "autocombo",
					    hiddenName: "temporalextent_set-0-sample_frequency_uom",
					    url: '/api/samplefrequency/',
					    emptyText:'Type of frequency...',
					    vname: 'frequency_uom',
					    vtype: 'temporalextent',
					    flex: 3
				     },{
					    xtype: 'spinnerfield',
					    allowDecimals: false,
					    name : 'temporalextent_set-0-sample_frequency_value',
					    vname: 'frequency_value',
					    vtype: 'temporalextent'
					    //emptyText:'Frequancy value...'
				     }
				  ]
			   }]
			},{
			   xtype:'fieldset',
			   title: 'Responsible party - resource',
			   //collapsible: true,
			   autoHeight:true,
			   //defaults: {width: 530},
			   defaultType: 'textfield',
			   defaults: {
				  msgTarget : 'side',
				  anchor    : '-35'
			   },
			   items: [{
				  dynamic:true,
				  prefix: "responsiblepartyrole_set",
				  id: "responsiblepartyrole_set",
				  maxOccurs:5,
				  xtype: 'compositefield',
				  fieldLabel: '',
				  defaults: {
				     flex: 1
				  },
				  items: [{
				     xtype: 'autocombo',
				     url: '/api/responsibleparty/',		    
				     hiddenName: "responsiblepartyrole_set-0-responsible_party",
				     allowBlank: false,
				     vtype: 'responsibleparty',
				     emptyText:'Responsible party...'
				  },{
				     xtype: "autocombo",
				     hiddenName: "responsiblepartyrole_set-0-role",
				     url: '/api/role/',
				     allowBlank: false,
				     vtype: 'responsibleparty',
				     emptyText:'Role...'
				  }]
			   }]
			}]
		 },{ // start tab
			title:'Classification',
			layout:'form',
			items: [
               // 			    {
               // 			    xtype: 'fieldset',
               // 			    title: 'Topic category',
               // 			    autoHeight:true,
               // 			    items: [
			   {
				  anchor: '97%',
				  xtype: 'autoitemselector',
				  url: '/api/topiccategory/',
				  name: 'topic_category_ext_str',
				  fieldLabel: 'Topic category'
                  //				}]
			   },{
			      xtype: 'label',
			      fieldLabel:'Keywords'
			   },{
			      xtype: 'keywordsgrid',
			      id: 'keywords_grid_id',
			      //title: 'Keywords',
			      autoHeight: true,
			      border: true,
			      bodyBorder: true,
			      lang: this.gemetLanguage,
			      outputLangs: ['it','en']
			   },{
			      xtype: "hidden",
			      name: "gemetkeywords",
			      id: "gemetkeywords",
			      setValue: function(v){
				     Ext.getCmp('keywords_grid_id').readData(v);
                     this.value = v;
                     this.el.dom.value = (v === null || v === undefined ? '' : v);
                     this.validate();
			      },
                  getRawValue: function(){
                     var v = Ext.getCmp('keywords_grid_id').writeData();
                     this.el.dom.value = (v === null || v === undefined ? '' : v);
				     return v;
			      }
			   }
			]
		 },{
			title:'Spatial information',
			items: [{
			   id: 'id-bboxgeonamespanel',
			   xtype: 'bboxgeonamespanel'
			},{
			   xtype:'fieldset',
			   title: 'Quality',
			   collapsible: true,
			   //checkboxToggle:true,
			   collapsed: true,
			   autoHeight:true,
			   width: 550,
			   defaultType: 'textfield',
			   layout: 'form',

               items:[{
                  xtype: 'tabpanel',
                  plain: true,
                  activeTab: 0,
                  autoHeight:true,
                  deferredRender : false,
                  defaults:   {autoScroll:true, autoHeight:true, bodyStyle:'padding:10px', width: 600,
                               defaults: {
                                  anchor: '97%',
                                  msgTarget: 'side'
                               }
                              },
			      items: [{
				     title:'IT',
				     layout:'form',
				     items:[{
				        xtype: 'textarea',
				        fieldLabel: 'Lineage (IT)',
				        name: 'lineage_it'
				     }]
			      },{
				     title:'EN',
				     layout:'form',
				     items:[{
				        xtype: 'textarea',
				        fieldLabel: 'Lineage (EN)',
				        name: 'lineage_en'
				     }]
                  }]
               },{
				  xtype: 'numberfield',
				  allowDecimals: false,
				  fieldLabel: 'Spatail resolution - equivalent scale',
				  name: 'equivalent_scale'
			   },{
				  xtype: 'numberfield',
				  allowDecimals: false,
				  fieldLabel: 'Distance',
				  name: 'distance'
			   },{
				  fieldLabel: 'Distance - unit of measure',
				  name: 'uom_distance'
			   }]
			},{
			   xtype:'fieldset',
			   title: 'Vertical information',
			   collapsible: true,
			   //checkboxToggle:true,
			   collapsed: true,
			   autoHeight:true,
			   //defaults: {width: 530},
			   defaultType: 'textfield',
			   items: [{
				  anchor: '95%',
				  xtype: "autocombo",
				  hiddenName: "vertical_datum",
				  url: '/api/verticaldatum/',
				  emptyText:'select datum...',
				  fieldLabel: 'Vertical datum'
			   },{
				  xtype: 'numberfield',
				  fieldLabel: 'Vertical extent - minimum value',
				  name: 'vertical_extent_min'
			   },{
				  xtype: 'numberfield',
				  fieldLabel: 'Vertical extent - maximum value',
				  name: 'vertical_extent_max'
			   },{
				  fieldLabel: 'Vertical extent - unit of measure',
				  name: 'uom_vertical_extent'
			   }]
			}]
		 },{
			title:'Additional information',
			layout:'form',
			items: [{
			   xtype: 'tabpanel',
			   plain: true,
			   activeTab: 0,
			   autoHeight:true,
			   deferredRender : false,
			   defaults:   {autoScroll:true, autoHeight:true, bodyStyle:'padding:10px', width: 600, 
					        defaults: {
					           anchor: '97%',
					           msgTarget: 'side'
					        }
					       },			    
			   items: [{
				  title:'IT',
				  layout:'form',
				  items:[{
				     xtype: 'textarea',
				     id: 'other_citation_details_it', 
				     fieldLabel: gettext('Other citation details') + ' (IT)',
				     name: 'other_citation_details_it',
				     allowBlank: true
				  },{
				     xtype: 'textarea',
				     id: 'supplemental_information_ml_it', 
				     fieldLabel: gettext('Supplemental information') + ' (IT)',
				     name: 'supplemental_information_ml_it',
				     allowBlank: true
				  }]
			   },{
				  title:'EN',
				  layout:'form',
				  items:[{
				     xtype: 'textarea',
				     id: 'other_citation_details_en', 
				     fieldLabel: gettext('Other citation details') + ' (EN)',
				     name: 'other_citation_details_en',
				     allowBlank: true
				  },{
				     xtype: 'textarea',
				     id: 'supplemental_information_ml_en', 
				     fieldLabel: gettext('Supplemental information') + ' (EN)',
				     name: 'supplemental_information_ml_en',
				     allowBlank: true
				  }]
			   }]
			},{
			   xtype: 'label',
			   html: '<hr/>'
			},{
			   xtype: 'autoitemselector',
			   url: '/api/presentationform/',
			   name: 'presentation_form_str',
			   fieldLabel: 'Presentation form'
			},{
			   xtype: 'autoitemselector',
			   url: '/api/distributionformat/',
			   name: 'distribution_format_str',
			   fieldLabel: 'Distribution format'
			},{
			   xtype: "autocombo",
			   hiddenName: "resource_type",
			   url: '/api/resourcetype/',
			   emptyText:'Resource type',
			   fieldLabel: 'Hierarchy level'
			},{
			   xtype: "autocombo",
			   hiddenName: "language",
			   url: '/api/language/',
			   emptyText:'select...',
			   fieldLabel: 'Language'
			},{
			   xtype: "autocombo",
			   hiddenName: "character_set",
			   url: '/api/characterset/',
			   emptyText:'select...',
			   fieldLabel: 'Character set'
			},{
			   xtype: "autocombo",
			   hiddenName: "update_frequency",
			   url: '/api/updatefrequency/',
			   emptyText:'select...',
			   fieldLabel: 'Maintenance frequency'
			},{
			   xtype: 'autoitemselector',
			   url: '/api/spatialrepresentationtype/',
			   name: 'spatial_representation_type_ext_str',
			   fieldLabel: 'Spatial representation type'
			},{
			   xtype:'fieldset',
			   title: 'Responsible party - metadata',
			   //collapsible: true,
			   autoHeight:true,
			   //defaults: {width: 530},
			   defaultType: 'textfield',
			   defaults: {
				  msgTarget : 'side',
				  anchor    : '-35'
			   },
			   items: [{
				  dynamic:true,
				  id: "mdresponsiblepartyrole_set",
				  prefix: "mdresponsiblepartyrole_set",
				  maxOccurs:5,
				  xtype: 'compositefield',
				  fieldLabel: '',
				  defaults: {
					 flex: 1
				  },
				  items: [{
					 xtype: 'autocombo',
					 url: '/api/responsibleparty/',		    
					 hiddenName: "mdresponsiblepartyrole_set-0-responsible_party",
					 emptyText:'Responsible party...',
					 vtype: 'responsibleparty'
				  },{
					 xtype: "hidden",
					 name: "mdresponsiblepartyrole_set-0-role",
					 value: "11"
				  }
					      // ,{
					      // xtype: "autocombo",
					      // hiddenName: "mdresponsiblepartyrole_set-0-role",
					      // url: '/api/role/',
					      // emptyText:'Role...',
					      // vtype: 'responsibleparty'
					      // }
					     ]
			   }]
			}
			       ]
		 }]
	  };
      
      if(this.initialConfig['geospatial']){
         resourceTypeConfig = {xtype: 'label', html:''};
      }

      var config = {
	     labelAlign: 'top',
         fileUpload: true,
         frame: true,
         autoHeight: true,
         //unstyled: true,
         //labelWidth: 125,
         defaults: {            
            msgTarget: 'side',
	        labelStyle: 'font-weight:bold;'
         },
         items: [resourceTypeConfig,
		         metadataPanelConfig,
		         this.permissionsField, {
		            xtype: "hidden",
		            name: "csrfmiddlewaretoken",
		            value: "{{ csrf_token }}"
		         }],
         buttons: [{
            text: gettext('Upload'),
            handler: function(){
               if (thisComponent.getForm().isValid()) {
                  thisComponent.getForm().submit({
                     url: thisComponent.form_target,
                     waitMsg: gettext('Uploading your data...'),
                     success: function(fp, o) {
                        document.location = o.result.redirect_to;
                     },
                     failure: function(fp, o) {
                        error_message = '<ul>';
                        for (var i = 0; i < o.result.errors.length; i++) {
                           error_message += '<li>' + o.result.errors[i] + '</li>';
                        }
                        error_message += '</ul>';

                        Ext.Msg.show({
                           title: gettext("Error"),
                           msg: error_message,
                           minWidth: 200,
                           modal: true,
                           icon: Ext.Msg.ERROR,
                           buttons: Ext.Msg.OK
                        });
                     }
                  });
               }
            }
         }]
      };
      // apply config
      Ext.apply(this, Ext.apply(this.initialConfig, config));
      Ext.ResourceForm.superclass.initComponent.apply(this, arguments);
   },
   loadData: function(initial) {
      //apply default
      Ext.apply({}, initial, {type: 'local'});
	  if(initial['temporalextent_set'] > 0){
	     Ext.getCmp('temporalextent_set').clones(initial['temporalextent_set'] -1 );
	     Ext.getCmp('temporalextent_set').ownerCt.doLayout();
	  }
	  if(initial['responsiblepartyrole_set'] > 0){
	     Ext.getCmp('responsiblepartyrole_set').clones(initial['responsiblepartyrole_set'] -1 );
	     Ext.getCmp('responsiblepartyrole_set').ownerCt.doLayout();
	  }
	  if(initial['mdresponsiblepartyrole_set'] > 0){
	     Ext.getCmp('mdresponsiblepartyrole_set').clones(initial['mdresponsiblepartyrole_set'] -1 );
	     Ext.getCmp('mdresponsiblepartyrole_set').ownerCt.doLayout();
	  }
	  var ResourceRecord = Ext.data.Record.create([]);
	  var record = new ResourceRecord(initial);
	  
	  this.getForm().loadRecord(record);
      
	  // non dovrebbe servire
	  //Ext.getCmp('gemetkeywords').setValue(initial['gemetkeywords']);
	  if('geographic_bounding_box' in initial){
	     Ext.getCmp('id-bboxgeonamespanel').mapPanel.loadBBOX(initial['geographic_bounding_box']);
	  };
	  if('geonames' in initial){
	     Ext.getCmp('id-bboxgeonamespanel').mapPanel.loadGeoNames(initial['geonames']);
	  }
   },
   switchType: function(radio) {
      var base_file = this.base_file;
      var url_field = this.url_field;
      if(!radio){
         radio = Ext.getCmp('type_id').getValue();
      }
	  if(radio){
		 if(radio.inputValue == 'remote' || radio.inputValue == 'import' ){
            base_file.allowBlank = true;
	        url_field.allowBlank = false;
	        base_file.hide();
	        url_field.show();
		 } else if(radio.inputValue == 'metadata'){
	        base_file.allowBlank= true;
	        url_field.allowBlank= true;
	        base_file.hide();
	        url_field.hide();
		 } else {
	        base_file.allowBlank= false;
	        url_field.allowBlank= true;
	        base_file.show();
	        url_field.hide();
		 }
	  }
   }
});

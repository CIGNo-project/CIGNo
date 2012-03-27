Ext.override(Ext.form.TriggerField, {
    alignErrorIcon : function() {
        this.errorIcon.alignTo(this.wrap, 'tl-tr', [2 + this.dicon? this.dicon.getWidth() + 4 : 0, 0]);
    }
});	

Ext.form.InlineCompositeField = Ext.extend(Ext.form.CompositeField, {
    initComponent:function() {
	var thisComponent = this; //reference to use in handler
        var config = {
	    // reference
	    parentComposite: f
	};
    }
});

Ext.override(Ext.form.Field, {
    dynamic : false,		
    addHiddens: function(total) {
	var panel = this.ownerCt;			
	
	var iforms = panel.find('name', this.prefix + "-INITIAL_FORMS");
	if(iforms.length == 0){
	    panel.insert(0, new Ext.form.Hidden( {name: this.prefix + "-INITIAL_FORMS", value: "0" } ));
	}
	
	var tforms = panel.find('name', this.prefix + "-TOTAL_FORMS");
	if(tforms.length == 0){		
	    panel.insert(0, new Ext.form.Hidden( {name: this.prefix + "-TOTAL_FORMS", value: total } ));
	} else {
	    tforms[0].setValue(total);
	}
	
	mforms = panel.find('name', this.prefix + "-MAX_NUM_FORMS");
	if(mforms.length == 0){
	    panel.insert(0, new Ext.form.Hidden( {name: this.prefix + "-MAX_NUM_FORMS", value: "" } ));
	}
	
    },
    sanitizeFieldName: function() {
	if(!this.prefix){
	    return;
	}
	//var fields = [this].concat(this.clones());
	var fields = this.clones();
	Ext.each(fields,function(f,index){
	    var newindex = index + 1;
	    if(f.xtype=='compositefield' ||  f.xtype=='fieldset'){
		Ext.each(f.items.items, function(fd){
		    if( f.prefix ) {
			if(fd.isXType('combo')){
			    if(fd.hiddenName){
				var newname = fd.hiddenName.replace(/-\d+-/, '-' + newindex + '-');
				fd.hiddenName = newname;
				if(fd.hiddenField){
				    fd.hiddenField.name = newname; //set html element
				}
			    }
			} else {
			    var newname = fd.name.replace(/-\d+-/, '-' + newindex + '-');
			    fd.name = newname;
			    if(fd.el){
				fd.el.set({name: newname}); //set html element
			    }
			}
		    }
		});
	    }
	}
		);
	this.addHiddens(fields.length + 1);
    },
    /**
     * Clones a field untill the required amount specified is reached
     * @param {Number} card  Number of clones required. When no card is specified, the current clones will be returned
     * @return {Array}  required clones of type {Ext.form.Field}  
     */		
    clones : function(card) {
	var panel = this.ownerCt;			
	var master = this;
	if ( this.template ) {
	    master = this.template;
	} 
	var cmps  = panel.findBy(function(cmp) {
	    if ( cmp.template ) {
		return cmp.template == this.template;
	    }
	},{template:master});	
	
	if ( Ext.isEmpty(card)) {
	    return cmps;
	}			
	//
	// sanitize amount of clones untill cardinality is reached							
	if ( !Ext.isEmpty(card) ) {
	    //
	    // add clones untill card is reached
	    for ( var i = cmps.length ; i < card ; i ++ ) {
		var clone = master.cloneConfig({
		    clone : true,
		    template : master,
		    iconCfg : {cls:'x-tool x-tool-minus',clsOnOver:'x-tool-minus-over'},
		    // when clone a compositefield add a reference from child
		    listeners : { 'onIcon' : {fn: function(field) {
			// It's Not Necessary
			// var item = Ext.get(field.el.findParent('.x-form-item'));
			// item.remove();
			if(field.template){
			    var master = field.template;
			}
			panel.remove(field);
			master.sanitizeFieldName();
			panel.doLayout();																				
		    }}											 
				}																	   
		});

		this.fireEvent('cloned', this, clone);
		var idx = panel.items.indexOf(master);
		panel.insert(idx+1+i,clone);
	    }			
	    //
	    // remove clones untill cardinality is reached
	    for ( var i = cmps.length ; i > card ; i -- ) {
						var field = cmps[i-1];
		var item = Ext.get(field.el.findParent('.x-form-item'));
		item.remove();
		panel.remove(field);			
	    }
	    cmps  = panel.findBy(function(cmp) {
		if ( cmp.template ) {
		    return cmp.template == this.template;
		}
	    },{template:master});					
	}
	return cmps;								
    },		
    onIcon : function(e,icon) {
	this.fireEvent('onIcon',this);
    },		
    getIconCt : function(el){
	return  el.findParent('.x-form-element', 5, true) || // use form element wrap if available
	el.findParent('.x-form-field-wrap', 5, true);   // else direct field wrap
    },
    alignIcon : function(){
	if ( this.isXType('combo') ||  this.isXType('datefield') ) {
	    this.dicon.alignTo(this.el, 'tl-tr', [17, 3]);
	} else {
	    this.dicon.alignTo(this.el, 'tl-tr', [2, 3]);                    
	}		
    },
    alignErrorIcon : function() {
	this.errorIcon.alignTo(this.el, 'tl-tr', [2 + this.dicon? this.dicon.getWidth() + 4 : 0, 0]);
    },		
    afterRender : Ext.form.Field.prototype.afterRender.createSequence(function() { 			
	if ( this.dynamic && Ext.isEmpty(this.clone)) {
	    this.addIcon({cls:'x-tool x-tool-plus',clsOnOver:'x-tool-plus-over'});
	    this.addListener('onIcon',function(field) {
		var cnt = this.clones().length;
		if ( !Ext.isEmpty(this.maxOccurs) ) {
		    if ( this.maxOccurs  <= cnt + 1) {
			field.fireEvent('maxoccurs',this);
			return;
		    }
		}			
		var panel = this.ownerCt;	
		this.clones(cnt+1);
		this.sanitizeFieldName();
		panel.doLayout();
	    }
			    );												
	} else {
	    // problem with itemselector
	    if(!this.isXType('itemselector')){
		this.addIcon(this.iconCfg);
	    }
	}
	if ( this.prefix ){
	    this.sanitizeFieldName();
	    this.ownerCt.doLayout();
	}
    }),
    /**
     * Add icon on rightside of field to create the ability to implement dynamic behaviour in the context of the specified field.
     * Example of its usage : see implementation of clones method of {Ext.form.Field}
     * @param {Object}  
     */		
    addIcon : function(iconCfg){
	if(!this.rendered || this.preventMark || Ext.isEmpty(iconCfg)){ // not rendered
	    return;
	}
	if(!this.dicon){
	    var elp = this.getIconCt(this.el);
	    if(!elp){ // field has no container el
		return;
	    }
	    this.dicon = elp.createChild({cls:iconCfg.cls});
	    this.dicon.setStyle( {position:'absolute'}) 
	    this.dicon.addClassOnOver(iconCfg.clsOnOver);				
	    this.dicon.addListener('click',this.onIcon,this);				
            this.alignIcon();				
            this.on('resize', this.alignIcon, this);
	}
    }
});Ext.override(Ext.form.FieldSet, {
		dynamic : false,		
		
		/**
		 * Clones a fieldset untill the required amount specified is reached
		 * @param {Number} card  Number of clones required. When no card is specified, the current clones will be returned
		 * @return {Array}  required clones of type {Ext.form.FieldSet}  
		 */				
		clones : function(card) {
			var panel = this.ownerCt;		
			var master = this;
			if ( this.template ) {
				master = this.template;
			} 

			var cmps  = panel.findBy(function(cmp) {
							 if ( cmp.template ) {
								return cmp.template == this.template;
							 }
							},{template:master});	
			if ( Ext.isEmpty(card)) {
				return cmps;
			}										
			//
			// sanitize amount of clones untill cardinality is reached
			if ( !Ext.isEmpty(card) ) {
				//
				// add clones untill card is reached			
				for ( var i = cmps.length ; i < card ; i ++ ) {
					var idx = panel.items.indexOf(master);
					var clone = master.cloneConfig({
						clone : true,
						template : master									
					});
					panel.insert(idx+1+i,clone);
				}			
				//
				// remove clones untill cardinality is reached
				for ( var i = cmps.length ; i > card ; i -- ) {
						var fieldset = cmps[i-1];
						panel.remove(fieldset,true);
				}				
				cmps  = panel.findBy(function(cmp) {
							 if ( cmp.template ) {
								return cmp.template == this.template;
							 }
							},{template:master});					
			}
			return cmps;								
		},				
		onRender : Ext.form.FieldSet.prototype.onRender.createInterceptor(function(ct, position) { 			
			if ( this.dynamic) {
				if ( this.clone ) {
					this.tools = [ {id:'minus', handler: function(event, toolEl, fieldset){	
										var panel = fieldset.ownerCt;																
										panel.remove(fieldset,true);
										panel.doLayout();
									}}				
								];					
				} else {
					this.tools = [ {id:'plus', handler: function(event, toolEl, fieldset){	
										var cnt = fieldset.clones().length;
 									    if ( !Ext.isEmpty(fieldset.maxOccurs) ) {
										   if ( fieldset.maxOccurs  <= cnt + 1) {
											   fieldset.fireEvent('maxoccurs',fieldset);
											   return;													   
										   }
									    }	
										var panel = fieldset.ownerCt;	
										fieldset.clones(cnt+1);
										panel.doLayout();																								   
									}}				
								 ];		
				}						 
			}
		})
});Ext.override(Ext.form.FormPanel, {
    /**
	 * Returns array of component under this panel
	 * @param {String} ns  Required namespace to which the component should be bound
	 * @param {String} xtype Required type of component
	* @param {String} master Optional  identifier whether the component shouldn't be a clone If master is not empty, the component can't be a clone
	 * @return {Array} 
	 */
	findFormComponents : function (ns,xtype,master) {
		if ( Ext.isEmpty(master) ) {
			return this.findBy(function(cmp) {
				return cmp.isXType(xtype) && cmp.nameSpace == ns;
			});	
		} else {
			return this.findBy(function(cmp) {
				return cmp.isXType(xtype) && cmp.nameSpace == ns && Ext.isEmpty(cmp.template);
			});	
		}
	},	
    /**
	 * Adds value to collection In case of single value collection a single value is returned Otherwise an array of values will be returned
	 * @param {Mixed}  coll  Required collection to which the value should be added
	 * @param {String}  v Required value that should be added to the collection
	 * @return Returns mixed elements of collection
	 */
	aggregate : function(coll,v) {
			if ( coll === undefined || coll === null ) {
				return v;
			} else if ( Ext.isArray(coll) ) {
				coll.push(v);
				return coll;
			} else {
				coll = [coll];
				coll.push(v);
				return coll;
			}
	},
    /**
	 * Extract value(s) of all component under this panel that are bound to a named collection.
	 * If xtype is field an object of field names and aggregated values is returned
	 * If xtype is fieldset an array of objects of field names and aggregated values, each object representing a fieldset, is returned
	 * @param {String} ns  Required namespace to which the component should be bound
	 * @param {String} xtype Required type of component
	 * @return Returns object in case xtype is field and returns array in case xtype is fieldset

	 Example of it's usage :
	 
	  var location = Ext.getCmp('panel').extract('location','field');
	  var fsperson = Ext.getCmp('panel').extract('person','fieldset');
	  var fperson = Ext.getCmp('panel').extract('person','field');

	 */
    extract : function(ns,xtype){
		if ( xtype === 'fieldset' ) {
			var obja = [];
			Ext.each(this.findFormComponents(ns,xtype),function(fst) {
				var obj = {};
				var fs = fst.findBy(function(cmp) {
					return cmp.isFormField;
				});
				Ext.each(fs,function(f) {
					obj[f.name]=this.aggregate(obj[f.name],f.getValue());
				},this);
				obja.push(obj);
			},this);
			return obja;			
		} else if ( xtype === 'field' ) {
			var obj = {};
			Ext.each(this.findFormComponents(ns,xtype),function(f) {
				obj[f.name]=this.aggregate(obj[f.name],f.getValue());			
			},this);
			return obj;
		}
    },
    /**
	 * Populate components under this panel that are bound to a named collection.
	 * If xtype is field Populating is based on an object of field names and aggregated values that is used to set the values of the components under this panel
	 * If xtype is fieldset Populating is based on an array of objects of field names and aggregated values, each object representing a fieldset, that is used to set the values of the components under this panel
	 * @param {Mixed} o  Required values used for populating the fields
	 * @param {String} ns  Required namespace to which the component should be bound
	 * @param {String} xtype Required type of component
	 
	 Example of it's usage :
	 
	 person.populate(Ext.decode('{"state":["Netherlands","Delaware"]}'),'location','field');
	 person.populate(Ext.decode('[{"first":["Adriaan","Cornelis"],"last":"Zaanen"},{"first":["Bill"],"last":"Joy"}]'),'person','fieldset');
	 person.populate(Ext.decode('{"birthDate":"03/12/2009"}'),'person','field');	 	 
	 
	 Known restrictions :
		1.   Only one type of dynamic fieldset per namespace allowed Therefore populating fieldsets of different types is not allowed.	 
	 */
	populate : function(o,ns,xtype) {
		var findField = function(multi,name) {
			var fields = [];
			if ( Ext.isArray(multi) ) {				
				// determine field in array of fields based on it's name
				var fs = multi;
				Ext.each(fs,function(field) {
						if(Ext.isEmpty(field.template) && field.isFormField && (field.dataIndex == name || field.id == name || field.name == name)){
							fields.push(field);
						}
				},this);			
			} else {
				// determine field under this component based on it's name
				var cntr = multi;
				fields = cntr.findBy(function(cmp) {			
					if(Ext.isEmpty(cmp.template) && cmp.isFormField && (cmp.dataIndex == name || cmp.id == name || cmp.name == name)){
						return true;					
					}
				});
			}
			if ( fields.length > 0 ) return fields[0];
		};	
		var setValues = function(field,values) {
			if (Ext.isEmpty(values)) values = '';
			if (!Ext.isArray(values)) values = [values];
			var fields = [];
			// acquire required amount of fields			
			if (Ext.isArray(field)) {
				fields = field;
			} else {
				fields = [field];
				if ( field.clones ) {
					fields = fields.concat(field.clones(values.length-1));
				} 			
			}
			// populate fields			
			for ( var i = 0 ; i < values.length ; i ++ ) {
				fields[i].setValue(values[i]);
			}
		};
		if ( xtype === 'fieldset' ) {
			// restrictions :
			//	* Only one dynamic fieldset per namespace allowed
			if ( !Ext.isArray(o) ) return;
			var array = o;
			// acquire required amount of fieldsets
			var fieldsets = this.findFormComponents(ns,xtype,'master');
			if ( fieldsets[0].clones ) {
				if ( array.length == 0 ) {
					fieldsets[0].clones(0)
				} else {
					fieldsets = fieldsets.concat(fieldsets[0].clones(array.length-1));				
				}
			} 
			// acquire fieldset
			for ( var i = 0 ; i < array.length ; i ++ ) {
				// populate fields
				for ( name in array[i]) {
					var field = findField(fieldsets[i],name);
					var values = array[i][name];				
					if (!Ext.isEmpty(field)) {
						setValues(field,values);
					}
				}				
			}
		} else if ( xtype == 'field' ) {
			if ( Ext.isArray(o) ) return;
			var object = o;			
			var fields = this.findFormComponents(ns,xtype,'master');
			if ( fields.length == 0 ) return;						
			// populate fields			
			for ( name in object) {
				var field = findField(fields,name);
				var values = object[name];											
				if (!Ext.isEmpty(field)) {
					setValues(field,values);
				}
			}
		}
	}
});	/*!
 * Ext JS Library 3.4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
/**
 * @class Ext.ux.Spinner
 * @extends Ext.util.Observable
 * Creates a Spinner control utilized by Ext.ux.form.SpinnerField
 */
Ext.ux.Spinner = Ext.extend(Ext.util.Observable, {
    incrementValue: 1,
    alternateIncrementValue: 5,
    triggerClass: 'x-form-spinner-trigger',
    splitterClass: 'x-form-spinner-splitter',
    alternateKey: Ext.EventObject.shiftKey,
    defaultValue: 0,
    accelerate: false,

    constructor: function(config){
        Ext.ux.Spinner.superclass.constructor.call(this, config);
        Ext.apply(this, config);
        this.mimicing = false;
    },

    init: function(field){
        this.field = field;

        field.afterMethod('onRender', this.doRender, this);
        field.afterMethod('onEnable', this.doEnable, this);
        field.afterMethod('onDisable', this.doDisable, this);
        field.afterMethod('afterRender', this.doAfterRender, this);
        field.afterMethod('onResize', this.doResize, this);
        field.afterMethod('onFocus', this.doFocus, this);
        field.beforeMethod('onDestroy', this.doDestroy, this);
    },

    doRender: function(ct, position){
        var el = this.el = this.field.getEl();
        var f = this.field;

        if (!f.wrap) {
            f.wrap = this.wrap = el.wrap({
                cls: "x-form-field-wrap"
            });
        }
        else {
            this.wrap = f.wrap.addClass('x-form-field-wrap');
        }

        this.trigger = this.wrap.createChild({
            tag: "img",
            src: Ext.BLANK_IMAGE_URL,
            cls: "x-form-trigger " + this.triggerClass
        });

        if (!f.width) {
            this.wrap.setWidth(el.getWidth() + this.trigger.getWidth());
        }

        this.splitter = this.wrap.createChild({
            tag: 'div',
            cls: this.splitterClass,
            style: 'width:13px; height:2px;'
        });
        this.splitter.setRight((Ext.isIE) ? 1 : 2).setTop(10).show();

        this.proxy = this.trigger.createProxy('', this.splitter, true);
        this.proxy.addClass("x-form-spinner-proxy");
        this.proxy.setStyle('left', '0px');
        this.proxy.setSize(14, 1);
        this.proxy.hide();
        this.dd = new Ext.dd.DDProxy(this.splitter.dom.id, "SpinnerDrag", {
            dragElId: this.proxy.id
        });

        this.initTrigger();
        this.initSpinner();
    },

    doAfterRender: function(){
        var y;
        if (Ext.isIE && this.el.getY() != (y = this.trigger.getY())) {
            this.el.position();
            this.el.setY(y);
        }
    },

    doEnable: function(){
        if (this.wrap) {
            this.disabled = false;
            this.wrap.removeClass(this.field.disabledClass);
        }
    },

    doDisable: function(){
        if (this.wrap) {
	        this.disabled = true;
            this.wrap.addClass(this.field.disabledClass);
            this.el.removeClass(this.field.disabledClass);
        }
    },

    doResize: function(w, h){
        if (typeof w == 'number') {
            this.el.setWidth(w - this.trigger.getWidth());
        }
        this.wrap.setWidth(this.el.getWidth() + this.trigger.getWidth());
    },

    doFocus: function(){
        if (!this.mimicing) {
            this.wrap.addClass('x-trigger-wrap-focus');
            this.mimicing = true;
            Ext.get(Ext.isIE ? document.body : document).on("mousedown", this.mimicBlur, this, {
                delay: 10
            });
            this.el.on('keydown', this.checkTab, this);
        }
    },

    // private
    checkTab: function(e){
        if (e.getKey() == e.TAB) {
            this.triggerBlur();
        }
    },

    // private
    mimicBlur: function(e){
        if (!this.wrap.contains(e.target) && this.field.validateBlur(e)) {
            this.triggerBlur();
        }
    },

    // private
    triggerBlur: function(){
        this.mimicing = false;
        Ext.get(Ext.isIE ? document.body : document).un("mousedown", this.mimicBlur, this);
        this.el.un("keydown", this.checkTab, this);
        this.field.beforeBlur();
        this.wrap.removeClass('x-trigger-wrap-focus');
        this.field.onBlur.call(this.field);
    },

    initTrigger: function(){
        this.trigger.addClassOnOver('x-form-trigger-over');
        this.trigger.addClassOnClick('x-form-trigger-click');
    },

    initSpinner: function(){
        this.field.addEvents({
            'spin': true,
            'spinup': true,
            'spindown': true
        });

        this.keyNav = new Ext.KeyNav(this.el, {
            "up": function(e){
                e.preventDefault();
                this.onSpinUp();
            },

            "down": function(e){
                e.preventDefault();
                this.onSpinDown();
            },

            "pageUp": function(e){
                e.preventDefault();
                this.onSpinUpAlternate();
            },

            "pageDown": function(e){
                e.preventDefault();
                this.onSpinDownAlternate();
            },

            scope: this
        });

        this.repeater = new Ext.util.ClickRepeater(this.trigger, {
            accelerate: this.accelerate
        });
        this.field.mon(this.repeater, "click", this.onTriggerClick, this, {
            preventDefault: true
        });

        this.field.mon(this.trigger, {
            mouseover: this.onMouseOver,
            mouseout: this.onMouseOut,
            mousemove: this.onMouseMove,
            mousedown: this.onMouseDown,
            mouseup: this.onMouseUp,
            scope: this,
            preventDefault: true
        });

        this.field.mon(this.wrap, "mousewheel", this.handleMouseWheel, this);

        this.dd.setXConstraint(0, 0, 10)
        this.dd.setYConstraint(1500, 1500, 10);
        this.dd.endDrag = this.endDrag.createDelegate(this);
        this.dd.startDrag = this.startDrag.createDelegate(this);
        this.dd.onDrag = this.onDrag.createDelegate(this);
    },

    onMouseOver: function(){
        if (this.disabled) {
            return;
        }
        var middle = this.getMiddle();
        this.tmpHoverClass = (Ext.EventObject.getPageY() < middle) ? 'x-form-spinner-overup' : 'x-form-spinner-overdown';
        this.trigger.addClass(this.tmpHoverClass);
    },

    //private
    onMouseOut: function(){
        this.trigger.removeClass(this.tmpHoverClass);
    },

    //private
    onMouseMove: function(){
        if (this.disabled) {
            return;
        }
        var middle = this.getMiddle();
        if (((Ext.EventObject.getPageY() > middle) && this.tmpHoverClass == "x-form-spinner-overup") ||
        ((Ext.EventObject.getPageY() < middle) && this.tmpHoverClass == "x-form-spinner-overdown")) {
        }
    },

    //private
    onMouseDown: function(){
        if (this.disabled) {
            return;
        }
        var middle = this.getMiddle();
        this.tmpClickClass = (Ext.EventObject.getPageY() < middle) ? 'x-form-spinner-clickup' : 'x-form-spinner-clickdown';
        this.trigger.addClass(this.tmpClickClass);
    },

    //private
    onMouseUp: function(){
        this.trigger.removeClass(this.tmpClickClass);
    },

    //private
    onTriggerClick: function(){
        if (this.disabled || this.el.dom.readOnly) {
            return;
        }
        var middle = this.getMiddle();
        var ud = (Ext.EventObject.getPageY() < middle) ? 'Up' : 'Down';
        this['onSpin' + ud]();
    },

    //private
    getMiddle: function(){
        var t = this.trigger.getTop();
        var h = this.trigger.getHeight();
        var middle = t + (h / 2);
        return middle;
    },

    //private
    //checks if control is allowed to spin
    isSpinnable: function(){
        if (this.disabled || this.el.dom.readOnly) {
            Ext.EventObject.preventDefault(); //prevent scrolling when disabled/readonly
            return false;
        }
        return true;
    },

    handleMouseWheel: function(e){
        //disable scrolling when not focused
        if (this.wrap.hasClass('x-trigger-wrap-focus') == false) {
            return;
        }

        var delta = e.getWheelDelta();
        if (delta > 0) {
            this.onSpinUp();
            e.stopEvent();
        }
        else
            if (delta < 0) {
                this.onSpinDown();
                e.stopEvent();
            }
    },

    //private
    startDrag: function(){
        this.proxy.show();
        this._previousY = Ext.fly(this.dd.getDragEl()).getTop();
    },

    //private
    endDrag: function(){
        this.proxy.hide();
    },

    //private
    onDrag: function(){
        if (this.disabled) {
            return;
        }
        var y = Ext.fly(this.dd.getDragEl()).getTop();
        var ud = '';

        if (this._previousY > y) {
            ud = 'Up';
        } //up
        if (this._previousY < y) {
            ud = 'Down';
        } //down
        if (ud != '') {
            this['onSpin' + ud]();
        }

        this._previousY = y;
    },

    //private
    onSpinUp: function(){
        if (this.isSpinnable() == false) {
            return;
        }
        if (Ext.EventObject.shiftKey == true) {
            this.onSpinUpAlternate();
            return;
        }
        else {
            this.spin(false, false);
        }
        this.field.fireEvent("spin", this);
        this.field.fireEvent("spinup", this);
    },

    //private
    onSpinDown: function(){
        if (this.isSpinnable() == false) {
            return;
        }
        if (Ext.EventObject.shiftKey == true) {
            this.onSpinDownAlternate();
            return;
        }
        else {
            this.spin(true, false);
        }
        this.field.fireEvent("spin", this);
        this.field.fireEvent("spindown", this);
    },

    //private
    onSpinUpAlternate: function(){
        if (this.isSpinnable() == false) {
            return;
        }
        this.spin(false, true);
        this.field.fireEvent("spin", this);
        this.field.fireEvent("spinup", this);
    },

    //private
    onSpinDownAlternate: function(){
        if (this.isSpinnable() == false) {
            return;
        }
        this.spin(true, true);
        this.field.fireEvent("spin", this);
        this.field.fireEvent("spindown", this);
    },

    spin: function(down, alternate){
        var v = parseFloat(this.field.getValue());
        var incr = (alternate == true) ? this.alternateIncrementValue : this.incrementValue;
        (down == true) ? v -= incr : v += incr;

        v = (isNaN(v)) ? this.defaultValue : v;
        v = this.fixBoundries(v);
        this.field.setRawValue(v);
    },

    fixBoundries: function(value){
        var v = value;

        if (this.field.minValue != undefined && v < this.field.minValue) {
            v = this.field.minValue;
        }
        if (this.field.maxValue != undefined && v > this.field.maxValue) {
            v = this.field.maxValue;
        }

        return this.fixPrecision(v);
    },

    // private
    fixPrecision: function(value){
        var nan = isNaN(value);
        if (!this.field.allowDecimals || this.field.decimalPrecision == -1 || nan || !value) {
            return nan ? '' : value;
        }
        return parseFloat(parseFloat(value).toFixed(this.field.decimalPrecision));
    },

    doDestroy: function(){
        if (this.trigger) {
            this.trigger.remove();
        }
        if (this.wrap) {
            this.wrap.remove();
            delete this.field.wrap;
        }

        if (this.splitter) {
            this.splitter.remove();
        }

        if (this.dd) {
            this.dd.unreg();
            this.dd = null;
        }

        if (this.proxy) {
            this.proxy.remove();
        }

        if (this.repeater) {
            this.repeater.purgeListeners();
        }
        if (this.mimicing){
            Ext.get(Ext.isIE ? document.body : document).un("mousedown", this.mimicBlur, this);
        }
    }
});

//backwards compat
Ext.form.Spinner = Ext.ux.Spinner;/*!
 * Ext JS Library 3.4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.ns('Ext.ux.form');

/**
 * @class Ext.ux.form.SpinnerField
 * @extends Ext.form.NumberField
 * Creates a field utilizing Ext.ux.Spinner
 * @xtype spinnerfield
 */
Ext.ux.form.SpinnerField = Ext.extend(Ext.form.NumberField, {
    actionMode: 'wrap',
    deferHeight: true,
    autoSize: Ext.emptyFn,
    onBlur: Ext.emptyFn,
    adjustSize: Ext.BoxComponent.prototype.adjustSize,

	constructor: function(config) {
		var spinnerConfig = Ext.copyTo({}, config, 'incrementValue,alternateIncrementValue,accelerate,defaultValue,triggerClass,splitterClass');

		var spl = this.spinner = new Ext.ux.Spinner(spinnerConfig);

		var plugins = config.plugins
			? (Ext.isArray(config.plugins)
				? config.plugins.push(spl)
				: [config.plugins, spl])
			: spl;

		Ext.ux.form.SpinnerField.superclass.constructor.call(this, Ext.apply(config, {plugins: plugins}));
	},

    // private
    getResizeEl: function(){
        return this.wrap;
    },

    // private
    getPositionEl: function(){
        return this.wrap;
    },

    // private
    alignErrorIcon: function(){
        if (this.wrap) {
            this.errorIcon.alignTo(this.wrap, 'tl-tr', [2, 0]);
        }
    },

    validateBlur: function(){
        return true;
    }
});

Ext.reg('spinnerfield', Ext.ux.form.SpinnerField);

//backwards compat
Ext.form.SpinnerField = Ext.ux.form.SpinnerField;
/*!
 * Ext JS Library 3.4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.ns('Ext.ux.form');

/**
 * @class Ext.ux.form.MultiSelect
 * @extends Ext.form.Field
 * A control that allows selection and form submission of multiple list items.
 *
 *  @history
 *    2008-06-19 bpm Original code contributed by Toby Stuart (with contributions from Robert Williams)
 *    2008-06-19 bpm Docs and demo code clean up
 *
 * @constructor
 * Create a new MultiSelect
 * @param {Object} config Configuration options
 * @xtype multiselect
 */
Ext.ux.form.MultiSelect = Ext.extend(Ext.form.Field,  {
    /**
     * @cfg {String} legend Wraps the object with a fieldset and specified legend.
     */
    /**
     * @cfg {Ext.ListView} view The {@link Ext.ListView} used to render the multiselect list.
     */
    /**
     * @cfg {String/Array} dragGroup The ddgroup name(s) for the MultiSelect DragZone (defaults to undefined).
     */
    /**
     * @cfg {String/Array} dropGroup The ddgroup name(s) for the MultiSelect DropZone (defaults to undefined).
     */
    /**
     * @cfg {Boolean} ddReorder Whether the items in the MultiSelect list are drag/drop reorderable (defaults to false).
     */
    ddReorder:false,
    /**
     * @cfg {Object/Array} tbar The top toolbar of the control. This can be a {@link Ext.Toolbar} object, a
     * toolbar config, or an array of buttons/button configs to be added to the toolbar.
     */
    /**
     * @cfg {String} appendOnly True if the list should only allow append drops when drag/drop is enabled
     * (use for lists which are sorted, defaults to false).
     */
    appendOnly:false,
    /**
     * @cfg {Number} width Width in pixels of the control (defaults to 100).
     */
    width:100,
    /**
     * @cfg {Number} height Height in pixels of the control (defaults to 100).
     */
    height:100,
    /**
     * @cfg {String/Number} displayField Name/Index of the desired display field in the dataset (defaults to 0).
     */
    displayField:0,
    /**
     * @cfg {String/Number} valueField Name/Index of the desired value field in the dataset (defaults to 1).
     */
    valueField:1,
    /**
     * @cfg {Boolean} allowBlank False to require at least one item in the list to be selected, true to allow no
     * selection (defaults to true).
     */
    allowBlank:true,
    /**
     * @cfg {Number} minSelections Minimum number of selections allowed (defaults to 0).
     */
    minSelections:0,
    /**
     * @cfg {Number} maxSelections Maximum number of selections allowed (defaults to Number.MAX_VALUE).
     */
    maxSelections:Number.MAX_VALUE,
    /**
     * @cfg {String} blankText Default text displayed when the control contains no items (defaults to the same value as
     * {@link Ext.form.TextField#blankText}.
     */
    blankText:Ext.form.TextField.prototype.blankText,
    /**
     * @cfg {String} minSelectionsText Validation message displayed when {@link #minSelections} is not met (defaults to 'Minimum {0}
     * item(s) required').  The {0} token will be replaced by the value of {@link #minSelections}.
     */
    minSelectionsText:'Minimum {0} item(s) required',
    /**
     * @cfg {String} maxSelectionsText Validation message displayed when {@link #maxSelections} is not met (defaults to 'Maximum {0}
     * item(s) allowed').  The {0} token will be replaced by the value of {@link #maxSelections}.
     */
    maxSelectionsText:'Maximum {0} item(s) allowed',
    /**
     * @cfg {String} delimiter The string used to delimit between items when set or returned as a string of values
     * (defaults to ',').
     */
    delimiter:',',
    /**
     * @cfg {Ext.data.Store/Array} store The data source to which this MultiSelect is bound (defaults to <tt>undefined</tt>).
     * Acceptable values for this property are:
     * <div class="mdetail-params"><ul>
     * <li><b>any {@link Ext.data.Store Store} subclass</b></li>
     * <li><b>an Array</b> : Arrays will be converted to a {@link Ext.data.ArrayStore} internally.
     * <div class="mdetail-params"><ul>
     * <li><b>1-dimensional array</b> : (e.g., <tt>['Foo','Bar']</tt>)<div class="sub-desc">
     * A 1-dimensional array will automatically be expanded (each array item will be the combo
     * {@link #valueField value} and {@link #displayField text})</div></li>
     * <li><b>2-dimensional array</b> : (e.g., <tt>[['f','Foo'],['b','Bar']]</tt>)<div class="sub-desc">
     * For a multi-dimensional array, the value in index 0 of each item will be assumed to be the combo
     * {@link #valueField value}, while the value at index 1 is assumed to be the combo {@link #displayField text}.
     * </div></li></ul></div></li></ul></div>
     */
    
    cls: 'ux-form-multiselect',

    // private
    defaultAutoCreate : {tag: "div"},

    // private
    initComponent: function(){
        Ext.ux.form.MultiSelect.superclass.initComponent.call(this);

        if(Ext.isArray(this.store)){
            if (Ext.isArray(this.store[0])){
                this.store = new Ext.data.ArrayStore({
                    fields: ['value','text'],
                    data: this.store
                });
                this.valueField = 'value';
            }else{
                this.store = new Ext.data.ArrayStore({
                    fields: ['text'],
                    data: this.store,
                    expandData: true
                });
                this.valueField = 'text';
            }
            this.displayField = 'text';
        } else {
            this.store = Ext.StoreMgr.lookup(this.store);
        }

        this.addEvents({
            'dblclick' : true,
            'click' : true,
            'change' : true,
            'drop' : true
        });
    },

    // private
    onRender: function(ct, position){
        Ext.ux.form.MultiSelect.superclass.onRender.call(this, ct, position);

        var fs = this.fs = new Ext.form.FieldSet({
            renderTo: this.el,
            title: this.legend,
            height: this.height,
            width: this.width,
            style: "padding:0;",
            tbar: this.tbar
        });
        fs.body.addClass('ux-mselect');

        this.view = new Ext.ListView({
            selectedClass: 'ux-mselect-selected',
            multiSelect: true,
            store: this.store,
            columns: [{ header: 'Value', width: 1, dataIndex: this.displayField }],
            hideHeaders: true
        });

        fs.add(this.view);

        this.view.on('click', this.onViewClick, this);
        this.view.on('beforeclick', this.onViewBeforeClick, this);
        this.view.on('dblclick', this.onViewDblClick, this);

        this.hiddenName = this.name || Ext.id();
        var hiddenTag = { tag: "input", type: "hidden", value: "", name: this.hiddenName };
        this.hiddenField = this.el.createChild(hiddenTag);
        this.hiddenField.dom.disabled = this.hiddenName != this.name;
        fs.doLayout();
    },

    // private
    afterRender: function(){
        Ext.ux.form.MultiSelect.superclass.afterRender.call(this);

        if (this.ddReorder && !this.dragGroup && !this.dropGroup){
            this.dragGroup = this.dropGroup = 'MultiselectDD-' + Ext.id();
        }

        if (this.draggable || this.dragGroup){
            this.dragZone = new Ext.ux.form.MultiSelect.DragZone(this, {
                ddGroup: this.dragGroup
            });
        }
        if (this.droppable || this.dropGroup){
            this.dropZone = new Ext.ux.form.MultiSelect.DropZone(this, {
                ddGroup: this.dropGroup
            });
        }
    },

    // private
    onViewClick: function(vw, index, node, e) {
        this.fireEvent('change', this, this.getValue(), this.hiddenField.dom.value);
        this.hiddenField.dom.value = this.getValue();
        this.fireEvent('click', this, e);
        this.validate();
    },

    // private
    onViewBeforeClick: function(vw, index, node, e) {
        if (this.disabled || this.readOnly) {
            return false;
        }
    },

    // private
    onViewDblClick : function(vw, index, node, e) {
        return this.fireEvent('dblclick', vw, index, node, e);
    },

    /**
     * Returns an array of data values for the selected items in the list. The values will be separated
     * by {@link #delimiter}.
     * @return {Array} value An array of string data values
     */
    getValue: function(valueField){
        var returnArray = [];
        var selectionsArray = this.view.getSelectedIndexes();
        if (selectionsArray.length == 0) {return '';}
        for (var i=0; i<selectionsArray.length; i++) {
            returnArray.push(this.store.getAt(selectionsArray[i]).get((valueField != null) ? valueField : this.valueField));
        }
        return returnArray.join(this.delimiter);
    },

    /**
     * Sets a delimited string (using {@link #delimiter}) or array of data values into the list.
     * @param {String/Array} values The values to set
     */
    setValue: function(values) {
        var index;
        var selections = [];
        this.view.clearSelections();
        this.hiddenField.dom.value = '';

        if (!values || (values == '')) { return; }

        if (!Ext.isArray(values)) { values = values.split(this.delimiter); }
        for (var i=0; i<values.length; i++) {
            index = this.view.store.indexOf(this.view.store.query(this.valueField,
                new RegExp('^' + values[i] + '$', "i")).itemAt(0));
            selections.push(index);
        }
        this.view.select(selections);
        this.hiddenField.dom.value = this.getValue();
        this.validate();
    },

    // inherit docs
    reset : function() {
        this.setValue('');
    },

    // inherit docs
    getRawValue: function(valueField) {
        var tmp = this.getValue(valueField);
        if (tmp.length) {
            tmp = tmp.split(this.delimiter);
        }
        else {
            tmp = [];
        }
        return tmp;
    },

    // inherit docs
    setRawValue: function(values){
        setValue(values);
    },

    // inherit docs
    validateValue : function(value){
        if (value.length < 1) { // if it has no value
             if (this.allowBlank) {
                 this.clearInvalid();
                 return true;
             } else {
                 this.markInvalid(this.blankText);
                 return false;
             }
        }
        if (value.length < this.minSelections) {
            this.markInvalid(String.format(this.minSelectionsText, this.minSelections));
            return false;
        }
        if (value.length > this.maxSelections) {
            this.markInvalid(String.format(this.maxSelectionsText, this.maxSelections));
            return false;
        }
        return true;
    },

    // inherit docs
    disable: function(){
        this.disabled = true;
        this.hiddenField.dom.disabled = true;
        this.fs.disable();
    },

    // inherit docs
    enable: function(){
        this.disabled = false;
        this.hiddenField.dom.disabled = false;
        this.fs.enable();
    },

    // inherit docs
    destroy: function(){
        Ext.destroy(this.fs, this.dragZone, this.dropZone);
        Ext.ux.form.MultiSelect.superclass.destroy.call(this);
    }
});


Ext.reg('multiselect', Ext.ux.form.MultiSelect);

//backwards compat
Ext.ux.Multiselect = Ext.ux.form.MultiSelect;


Ext.ux.form.MultiSelect.DragZone = function(ms, config){
    this.ms = ms;
    this.view = ms.view;
    var ddGroup = config.ddGroup || 'MultiselectDD';
    var dd;
    if (Ext.isArray(ddGroup)){
        dd = ddGroup.shift();
    } else {
        dd = ddGroup;
        ddGroup = null;
    }
    Ext.ux.form.MultiSelect.DragZone.superclass.constructor.call(this, this.ms.fs.body, { containerScroll: true, ddGroup: dd });
    this.setDraggable(ddGroup);
};

Ext.extend(Ext.ux.form.MultiSelect.DragZone, Ext.dd.DragZone, {
    onInitDrag : function(x, y){
        var el = Ext.get(this.dragData.ddel.cloneNode(true));
        this.proxy.update(el.dom);
        el.setWidth(el.child('em').getWidth());
        this.onStartDrag(x, y);
        return true;
    },

    // private
    collectSelection: function(data) {
        data.repairXY = Ext.fly(this.view.getSelectedNodes()[0]).getXY();
        var i = 0;
        this.view.store.each(function(rec){
            if (this.view.isSelected(i)) {
                var n = this.view.getNode(i);
                var dragNode = n.cloneNode(true);
                dragNode.id = Ext.id();
                data.ddel.appendChild(dragNode);
                data.records.push(this.view.store.getAt(i));
                data.viewNodes.push(n);
            }
            i++;
        }, this);
    },

    // override
    onEndDrag: function(data, e) {
        var d = Ext.get(this.dragData.ddel);
        if (d && d.hasClass("multi-proxy")) {
            d.remove();
        }
    },

    // override
    getDragData: function(e){
        var target = this.view.findItemFromChild(e.getTarget());
        if(target) {
            if (!this.view.isSelected(target) && !e.ctrlKey && !e.shiftKey) {
                this.view.select(target);
                this.ms.setValue(this.ms.getValue());
            }
            if (this.view.getSelectionCount() == 0 || e.ctrlKey || e.shiftKey) return false;
            var dragData = {
                sourceView: this.view,
                viewNodes: [],
                records: []
            };
            if (this.view.getSelectionCount() == 1) {
                var i = this.view.getSelectedIndexes()[0];
                var n = this.view.getNode(i);
                dragData.viewNodes.push(dragData.ddel = n);
                dragData.records.push(this.view.store.getAt(i));
                dragData.repairXY = Ext.fly(n).getXY();
            } else {
                dragData.ddel = document.createElement('div');
                dragData.ddel.className = 'multi-proxy';
                this.collectSelection(dragData);
            }
            return dragData;
        }
        return false;
    },

    // override the default repairXY.
    getRepairXY : function(e){
        return this.dragData.repairXY;
    },

    // private
    setDraggable: function(ddGroup){
        if (!ddGroup) return;
        if (Ext.isArray(ddGroup)) {
            Ext.each(ddGroup, this.setDraggable, this);
            return;
        }
        this.addToGroup(ddGroup);
    }
});

Ext.ux.form.MultiSelect.DropZone = function(ms, config){
    this.ms = ms;
    this.view = ms.view;
    var ddGroup = config.ddGroup || 'MultiselectDD';
    var dd;
    if (Ext.isArray(ddGroup)){
        dd = ddGroup.shift();
    } else {
        dd = ddGroup;
        ddGroup = null;
    }
    Ext.ux.form.MultiSelect.DropZone.superclass.constructor.call(this, this.ms.fs.body, { containerScroll: true, ddGroup: dd });
    this.setDroppable(ddGroup);
};

Ext.extend(Ext.ux.form.MultiSelect.DropZone, Ext.dd.DropZone, {
    /**
     * Part of the Ext.dd.DropZone interface. If no target node is found, the
     * whole Element becomes the target, and this causes the drop gesture to append.
     */
    getTargetFromEvent : function(e) {
        var target = e.getTarget();
        return target;
    },

    // private
    getDropPoint : function(e, n, dd){
        if (n == this.ms.fs.body.dom) { return "below"; }
        var t = Ext.lib.Dom.getY(n), b = t + n.offsetHeight;
        var c = t + (b - t) / 2;
        var y = Ext.lib.Event.getPageY(e);
        if(y <= c) {
            return "above";
        }else{
            return "below";
        }
    },

    // private
    isValidDropPoint: function(pt, n, data) {
        if (!data.viewNodes || (data.viewNodes.length != 1)) {
            return true;
        }
        var d = data.viewNodes[0];
        if (d == n) {
            return false;
        }
        if ((pt == "below") && (n.nextSibling == d)) {
            return false;
        }
        if ((pt == "above") && (n.previousSibling == d)) {
            return false;
        }
        return true;
    },

    // override
    onNodeEnter : function(n, dd, e, data){
        return false;
    },

    // override
    onNodeOver : function(n, dd, e, data){
        var dragElClass = this.dropNotAllowed;
        var pt = this.getDropPoint(e, n, dd);
        if (this.isValidDropPoint(pt, n, data)) {
            if (this.ms.appendOnly) {
                return "x-tree-drop-ok-below";
            }

            // set the insert point style on the target node
            if (pt) {
                var targetElClass;
                if (pt == "above"){
                    dragElClass = n.previousSibling ? "x-tree-drop-ok-between" : "x-tree-drop-ok-above";
                    targetElClass = "x-view-drag-insert-above";
                } else {
                    dragElClass = n.nextSibling ? "x-tree-drop-ok-between" : "x-tree-drop-ok-below";
                    targetElClass = "x-view-drag-insert-below";
                }
                if (this.lastInsertClass != targetElClass){
                    Ext.fly(n).replaceClass(this.lastInsertClass, targetElClass);
                    this.lastInsertClass = targetElClass;
                }
            }
        }
        return dragElClass;
    },

    // private
    onNodeOut : function(n, dd, e, data){
        this.removeDropIndicators(n);
    },

    // private
    onNodeDrop : function(n, dd, e, data){
        if (this.ms.fireEvent("drop", this, n, dd, e, data) === false) {
            return false;
        }
        var pt = this.getDropPoint(e, n, dd);
        if (n != this.ms.fs.body.dom)
            n = this.view.findItemFromChild(n);

        if(this.ms.appendOnly) {
            insertAt = this.view.store.getCount();
        } else {
            insertAt = n == this.ms.fs.body.dom ? this.view.store.getCount() - 1 : this.view.indexOf(n);
            if (pt == "below") {
                insertAt++;
            }
        }

        var dir = false;

        // Validate if dragging within the same MultiSelect
        if (data.sourceView == this.view) {
            // If the first element to be inserted below is the target node, remove it
            if (pt == "below") {
                if (data.viewNodes[0] == n) {
                    data.viewNodes.shift();
                }
            } else {  // If the last element to be inserted above is the target node, remove it
                if (data.viewNodes[data.viewNodes.length - 1] == n) {
                    data.viewNodes.pop();
                }
            }

            // Nothing to drop...
            if (!data.viewNodes.length) {
                return false;
            }

            // If we are moving DOWN, then because a store.remove() takes place first,
            // the insertAt must be decremented.
            if (insertAt > this.view.store.indexOf(data.records[0])) {
                dir = 'down';
                insertAt--;
            }
        }

        for (var i = 0; i < data.records.length; i++) {
            var r = data.records[i];
            if (data.sourceView) {
                data.sourceView.store.remove(r);
            }
            this.view.store.insert(dir == 'down' ? insertAt : insertAt++, r);
            var si = this.view.store.sortInfo;
            if(si){
                this.view.store.sort(si.field, si.direction);
            }
        }
        return true;
    },

    // private
    removeDropIndicators : function(n){
        if(n){
            Ext.fly(n).removeClass([
                "x-view-drag-insert-above",
                "x-view-drag-insert-left",
                "x-view-drag-insert-right",
                "x-view-drag-insert-below"]);
            this.lastInsertClass = "_noclass";
        }
    },

    // private
    setDroppable: function(ddGroup){
        if (!ddGroup) return;
        if (Ext.isArray(ddGroup)) {
            Ext.each(ddGroup, this.setDroppable, this);
            return;
        }
        this.addToGroup(ddGroup);
    }
});
/*!
 * Ext JS Library 3.4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
/*
 * Note that this control will most likely remain as an example, and not as a core Ext form
 * control.  However, the API will be changing in a future release and so should not yet be
 * treated as a final, stable API at this time.
 */

/**
 * @class Ext.ux.form.ItemSelector
 * @extends Ext.form.Field
 * A control that allows selection of between two Ext.ux.form.MultiSelect controls.
 *
 *  @history
 *    2008-06-19 bpm Original code contributed by Toby Stuart (with contributions from Robert Williams)
 *
 * @constructor
 * Create a new ItemSelector
 * @param {Object} config Configuration options
 * @xtype itemselector 
 */
Ext.ux.form.ItemSelector = Ext.extend(Ext.form.Field,  {
    hideNavIcons:false,
    imagePath:"",
    iconUp:"up2.gif",
    iconDown:"down2.gif",
    iconLeft:"left2.gif",
    iconRight:"right2.gif",
    iconTop:"top2.gif",
    iconBottom:"bottom2.gif",
    drawUpIcon:true,
    drawDownIcon:true,
    drawLeftIcon:true,
    drawRightIcon:true,
    drawTopIcon:true,
    drawBotIcon:true,
    delimiter:',',
    bodyStyle:null,
    border:false,
    defaultAutoCreate:{tag: "div"},
    /**
     * @cfg {Array} multiselects An array of {@link Ext.ux.form.MultiSelect} config objects, with at least all required parameters (e.g., store)
     */
    multiselects:null,

    initComponent: function(){
        Ext.ux.form.ItemSelector.superclass.initComponent.call(this);
        this.addEvents({
            'rowdblclick' : true,
            'change' : true
        });
    },

    onRender: function(ct, position){
        Ext.ux.form.ItemSelector.superclass.onRender.call(this, ct, position);

        // Internal default configuration for both multiselects
        var msConfig = [{
            legend: 'Available',
            draggable: true,
            droppable: true,
            width: 100,
            height: 100
        },{
            legend: 'Selected',
            droppable: true,
            draggable: true,
            width: 100,
            height: 100
        }];

        this.fromMultiselect = new Ext.ux.form.MultiSelect(Ext.applyIf(this.multiselects[0], msConfig[0]));
        this.fromMultiselect.on('dblclick', this.onRowDblClick, this);

        this.toMultiselect = new Ext.ux.form.MultiSelect(Ext.applyIf(this.multiselects[1], msConfig[1]));
        this.toMultiselect.on('dblclick', this.onRowDblClick, this);

        var p = new Ext.Panel({
            bodyStyle:this.bodyStyle,
            border:this.border,
            layout:"table",
            layoutConfig:{columns:3}
        });

        p.add(this.fromMultiselect);
        var icons = new Ext.Panel({header:false});
        p.add(icons);
        p.add(this.toMultiselect);
        p.render(this.el);
        icons.el.down('.'+icons.bwrapCls).remove();

        // ICON HELL!!!
        if (this.imagePath!="" && this.imagePath.charAt(this.imagePath.length-1)!="/")
            this.imagePath+="/";
        this.iconUp = this.imagePath + (this.iconUp || 'up2.gif');
        this.iconDown = this.imagePath + (this.iconDown || 'down2.gif');
        this.iconLeft = this.imagePath + (this.iconLeft || 'left2.gif');
        this.iconRight = this.imagePath + (this.iconRight || 'right2.gif');
        this.iconTop = this.imagePath + (this.iconTop || 'top2.gif');
        this.iconBottom = this.imagePath + (this.iconBottom || 'bottom2.gif');
        var el=icons.getEl();
        this.toTopIcon = el.createChild({tag:'img', src:this.iconTop, style:{cursor:'pointer', margin:'2px'}});
        el.createChild({tag: 'br'});
        this.upIcon = el.createChild({tag:'img', src:this.iconUp, style:{cursor:'pointer', margin:'2px'}});
        el.createChild({tag: 'br'});
        this.addIcon = el.createChild({tag:'img', src:this.iconRight, style:{cursor:'pointer', margin:'2px'}});
        el.createChild({tag: 'br'});
        this.removeIcon = el.createChild({tag:'img', src:this.iconLeft, style:{cursor:'pointer', margin:'2px'}});
        el.createChild({tag: 'br'});
        this.downIcon = el.createChild({tag:'img', src:this.iconDown, style:{cursor:'pointer', margin:'2px'}});
        el.createChild({tag: 'br'});
        this.toBottomIcon = el.createChild({tag:'img', src:this.iconBottom, style:{cursor:'pointer', margin:'2px'}});
        this.toTopIcon.on('click', this.toTop, this);
        this.upIcon.on('click', this.up, this);
        this.downIcon.on('click', this.down, this);
        this.toBottomIcon.on('click', this.toBottom, this);
        this.addIcon.on('click', this.fromTo, this);
        this.removeIcon.on('click', this.toFrom, this);
        if (!this.drawUpIcon || this.hideNavIcons) { this.upIcon.dom.style.display='none'; }
        if (!this.drawDownIcon || this.hideNavIcons) { this.downIcon.dom.style.display='none'; }
        if (!this.drawLeftIcon || this.hideNavIcons) { this.addIcon.dom.style.display='none'; }
        if (!this.drawRightIcon || this.hideNavIcons) { this.removeIcon.dom.style.display='none'; }
        if (!this.drawTopIcon || this.hideNavIcons) { this.toTopIcon.dom.style.display='none'; }
        if (!this.drawBotIcon || this.hideNavIcons) { this.toBottomIcon.dom.style.display='none'; }

        var tb = p.body.first();
        this.el.setWidth(p.body.first().getWidth());
        p.body.removeClass();

        this.hiddenName = this.name;
        var hiddenTag = {tag: "input", type: "hidden", value: "", name: this.name};
        this.hiddenField = this.el.createChild(hiddenTag);
    },
    
    doLayout: function(){
        if(this.rendered){
            this.fromMultiselect.fs.doLayout();
            this.toMultiselect.fs.doLayout();
        }
    },

    afterRender: function(){
        Ext.ux.form.ItemSelector.superclass.afterRender.call(this);

        this.toStore = this.toMultiselect.store;
        this.toStore.on('add', this.valueChanged, this);
        this.toStore.on('remove', this.valueChanged, this);
        this.toStore.on('load', this.valueChanged, this);
        this.valueChanged(this.toStore);
    },

    toTop : function() {
        var selectionsArray = this.toMultiselect.view.getSelectedIndexes();
        var records = [];
        if (selectionsArray.length > 0) {
            selectionsArray.sort();
            for (var i=0; i<selectionsArray.length; i++) {
                record = this.toMultiselect.view.store.getAt(selectionsArray[i]);
                records.push(record);
            }
            selectionsArray = [];
            for (var i=records.length-1; i>-1; i--) {
                record = records[i];
                this.toMultiselect.view.store.remove(record);
                this.toMultiselect.view.store.insert(0, record);
                selectionsArray.push(((records.length - 1) - i));
            }
        }
        this.toMultiselect.view.refresh();
        this.toMultiselect.view.select(selectionsArray);
    },

    toBottom : function() {
        var selectionsArray = this.toMultiselect.view.getSelectedIndexes();
        var records = [];
        if (selectionsArray.length > 0) {
            selectionsArray.sort();
            for (var i=0; i<selectionsArray.length; i++) {
                record = this.toMultiselect.view.store.getAt(selectionsArray[i]);
                records.push(record);
            }
            selectionsArray = [];
            for (var i=0; i<records.length; i++) {
                record = records[i];
                this.toMultiselect.view.store.remove(record);
                this.toMultiselect.view.store.add(record);
                selectionsArray.push((this.toMultiselect.view.store.getCount()) - (records.length - i));
            }
        }
        this.toMultiselect.view.refresh();
        this.toMultiselect.view.select(selectionsArray);
    },

    up : function() {
        var record = null;
        var selectionsArray = this.toMultiselect.view.getSelectedIndexes();
        selectionsArray.sort();
        var newSelectionsArray = [];
        if (selectionsArray.length > 0) {
            for (var i=0; i<selectionsArray.length; i++) {
                record = this.toMultiselect.view.store.getAt(selectionsArray[i]);
                if ((selectionsArray[i] - 1) >= 0) {
                    this.toMultiselect.view.store.remove(record);
                    this.toMultiselect.view.store.insert(selectionsArray[i] - 1, record);
                    newSelectionsArray.push(selectionsArray[i] - 1);
                }
            }
            this.toMultiselect.view.refresh();
            this.toMultiselect.view.select(newSelectionsArray);
        }
    },

    down : function() {
        var record = null;
        var selectionsArray = this.toMultiselect.view.getSelectedIndexes();
        selectionsArray.sort();
        selectionsArray.reverse();
        var newSelectionsArray = [];
        if (selectionsArray.length > 0) {
            for (var i=0; i<selectionsArray.length; i++) {
                record = this.toMultiselect.view.store.getAt(selectionsArray[i]);
                if ((selectionsArray[i] + 1) < this.toMultiselect.view.store.getCount()) {
                    this.toMultiselect.view.store.remove(record);
                    this.toMultiselect.view.store.insert(selectionsArray[i] + 1, record);
                    newSelectionsArray.push(selectionsArray[i] + 1);
                }
            }
            this.toMultiselect.view.refresh();
            this.toMultiselect.view.select(newSelectionsArray);
        }
    },

    fromTo : function() {
        var selectionsArray = this.fromMultiselect.view.getSelectedIndexes();
        var records = [];
        if (selectionsArray.length > 0) {
            for (var i=0; i<selectionsArray.length; i++) {
                record = this.fromMultiselect.view.store.getAt(selectionsArray[i]);
                records.push(record);
            }
            if(!this.allowDup)selectionsArray = [];
            for (var i=0; i<records.length; i++) {
                record = records[i];
                if(this.allowDup){
                    var x=new Ext.data.Record();
                    record.id=x.id;
                    delete x;
                    this.toMultiselect.view.store.add(record);
                }else{
                    this.fromMultiselect.view.store.remove(record);
                    this.toMultiselect.view.store.add(record);
                    selectionsArray.push((this.toMultiselect.view.store.getCount() - 1));
                }
            }
        }
        this.toMultiselect.view.refresh();
        this.fromMultiselect.view.refresh();
        var si = this.toMultiselect.store.sortInfo;
        if(si){
            this.toMultiselect.store.sort(si.field, si.direction);
        }
        this.toMultiselect.view.select(selectionsArray);
    },

    toFrom : function() {
        var selectionsArray = this.toMultiselect.view.getSelectedIndexes();
        var records = [];
        if (selectionsArray.length > 0) {
            for (var i=0; i<selectionsArray.length; i++) {
                record = this.toMultiselect.view.store.getAt(selectionsArray[i]);
                records.push(record);
            }
            selectionsArray = [];
            for (var i=0; i<records.length; i++) {
                record = records[i];
                this.toMultiselect.view.store.remove(record);
                if(!this.allowDup){
                    this.fromMultiselect.view.store.add(record);
                    selectionsArray.push((this.fromMultiselect.view.store.getCount() - 1));
                }
            }
        }
        this.fromMultiselect.view.refresh();
        this.toMultiselect.view.refresh();
        var si = this.fromMultiselect.store.sortInfo;
        if (si){
            this.fromMultiselect.store.sort(si.field, si.direction);
        }
        this.fromMultiselect.view.select(selectionsArray);
    },

    valueChanged: function(store) {
        var record = null;
        var values = [];
        for (var i=0; i<store.getCount(); i++) {
            record = store.getAt(i);
            values.push(record.get(this.toMultiselect.valueField));
        }
        this.hiddenField.dom.value = values.join(this.delimiter);
        this.fireEvent('change', this, this.getValue(), this.hiddenField.dom.value);
    },

    getValue : function() {
        return this.hiddenField.dom.value;
    },

    onRowDblClick : function(vw, index, node, e) {
        if (vw == this.toMultiselect.view){
            this.toFrom();
        } else if (vw == this.fromMultiselect.view) {
            this.fromTo();
        }
        return this.fireEvent('rowdblclick', vw, index, node, e);
    },

    reset: function(){
        range = this.toMultiselect.store.getRange();
        this.toMultiselect.store.removeAll();
        this.fromMultiselect.store.add(range);
        var si = this.fromMultiselect.store.sortInfo;
        if (si){
            this.fromMultiselect.store.sort(si.field, si.direction);
        }
        this.valueChanged(this.toMultiselect.store);
    }
});

Ext.reg('itemselector', Ext.ux.form.ItemSelector);

//backwards compat
Ext.ux.ItemSelector = Ext.ux.form.ItemSelector;
//patch due to a gemet rest api problem (getRelatedConcepts?concept_ur)
function clean_getRelatedConcepts_response(data){
if(data.length>0 && data[0].split){
  data_clean = [];
  for (jj in data){
    item = data[jj];
    if(item.split){
        data_clean.push(Ext.util.JSON.decode(item));
    }
  }
  return data_clean;
}
return data;
}
var ThesaurusReader=function(config){this.INSPIRE="http://inspire.jrc.it/theme/";this.CONCEPT="http://www.eionet.europa.eu/gemet/concept/";this.GROUP="http://www.eionet.europa.eu/gemet/group/";this.SUPERGROUP="http://www.eionet.europa.eu/gemet/supergroup/";this.THEME="http://www.eionet.europa.eu/gemet/theme/";this.appPath="";if(config.appPath){this.appPath=config.appPath;}
this.url="http://www.eionet.europa.eu/gemet/";this.proxy=this.appPath+"proxy.php?url=";this.lang='en';this.outputLangs=['cs','en'];this.separator=" > ";this.returnPath=true;this.returnInspire=true;if(config.url)this.url=config.url;if(config.proxy)this.proxy=config.proxy;if(config.lang)this.lang=config.lang;if(config.outputLangs)this.outputLangs=config.outputLangs;if(config.separator)this.separator=config.separator;if(config.returnPath!='undefined')this.returnPath=config.returnPath;if(config.returnInspire)this.returnInspire=config.returnInspire;this.handler=config.handler;this.data=null;this.theMask=null;this.status=0;var searchField=new Ext.form.TriggerField({width:150,minLength:3,triggerClass:'x-form-search-trigger',obj:this});this.showError=function(){Ext.Msg.alert('Error','Source not found at:'+this.url);this.theMask.hide();};this.drawTerms=function(r,o){this.theMask.hide();var root=o.options.node;root.getUI().getIconEl().src=Ext.BLANK_IMAGE_URL;root.getUI().getIconEl().className="x-tree-node-icon";if(r.responseText){try{
var data=clean_getRelatedConcepts_response(Ext.util.JSON.decode(r.responseText));
this.drawBranch(root,data);root.expand();}catch(e){alert('Data error!');}}};this.drawBranch=function(root,data){for(var i=0;i<data.length;i++){if(data[i].uri.indexOf(this.INSPIRE)>-1)var icon=this.appPath+'img/inspire.gif';else if(data[i].uri.indexOf(this.THEME)>-1)var icon=this.appPath+'img/eeaicon.gif';else if(data[i].uri.indexOf(this.GROUP)>-1)var icon=this.appPath+'img/group.gif';else var icon=this.appPath+'img/term.gif';var node=new Ext.tree.TreeNode({text:data[i].preferredLabel.string,termId:data[i].uri,data:data[i],icon:icon,cls:'thes-link'});if((this.returnInspire)&&(data[i].uri.indexOf(this.INSPIRE)>-1)){node.on('click',this.returnTerm,this,data[i].termId);}
else node.on('click',this.getById,this,data[i].termId);root.appendChild(node);}};this.emptyTree=function(){var root=this.thesRoot;while(root.item(0))root.removeChild(root.item(0));};this.getByTerm=function(){this.obj.emptyTree();this.obj.detailPanel.collapse();this.obj.treePanel.topToolbar.hide();if(this.getValue().length<this.minLength){Ext.Msg.alert(HS.i18n('Warning'),'&gt;= '+this.minLength+' '+HS.i18n('characters required'));return false;}
if(!this.obj.theMask)
this.obj.theMask=new Ext.LoadMask(this.obj.body);this.obj.theMask.show();this.obj.thesRoot.setText(HS.i18n('Found'));Ext.Ajax.request({url:this.obj.prepareRequest("getConceptsMatchingRegexByThesaurus?thesaurus_uri="+
this.obj.CONCEPT+"&language="+this.obj.lang+"&regex="+this.getValue()),scope:this.obj,options:{node:this.obj.thesRoot},success:this.obj.drawTerms,failure:this.obj.showError});};this.getTopConcepts=function(conceptURI){this.emptyTree();this.treePanel.topToolbar.hide();this.detailPanel.body.update('');this.detailPanel.collapse();if(!this.theMask)
this.theMask=new Ext.LoadMask(this.body);this.theMask.show();if(conceptURI==this.INSPIRE)
this.thesRoot.setText(HS.i18n('INSPIRE themes'));else
this.thesRoot.setText(HS.i18n('Top concepts'));Ext.Ajax.request({url:this.prepareRequest("getTopmostConcepts?thesaurus_uri="+conceptURI+"&language="+this.lang),scope:this,options:{node:this.thesRoot},success:this.drawTerms,failure:this.showError});};this.getById=function(theNode){if(!this.theMask)
this.theMask=new Ext.LoadMask(this.body);this.data=theNode.attributes.termId;this.emptyTree();this.treePanel.topToolbar.show();this.thesRoot.setText(theNode.text);var theTitle=this.treePanel.topToolbar.items.item(2);theTitle.getEl().dom.innerHTML="<span class='thes-term'><b>"+theNode.text+"</b></span>";
if(theNode.attributes.data.definition){this.detailPanel.body.update(theNode.attributes.data.definition.string);this.detailPanel.expand();}
else{this.detailPanel.body.update('');this.detailPanel.collapse();}
var nt=new Ext.tree.TreeNode({text:HS.i18n("NT"),termId:'nt',icon:this.appPath+'img/indicator.gif'});this.thesRoot.appendChild(nt);Ext.Ajax.request({url:this.prepareRequest("getRelatedConcepts?concept_uri="+
theNode.attributes.termId+"&relation_uri=http://www.w3.org/2004/02/skos/core%23narrower&language="+
this.lang),scope:this,options:{node:nt},success:this.drawTerms,failure:this.showError});var bt=new Ext.tree.TreeNode({text:HS.i18n("BT"),termId:'bt',icon:this.appPath+'img/indicator.gif'});this.thesRoot.appendChild(bt);Ext.Ajax.request({url:this.prepareRequest("getRelatedConcepts?concept_uri="+
theNode.attributes.termId+"&relation_uri=http://www.w3.org/2004/02/skos/core%23broader&language="+
this.lang),scope:this,options:{node:bt},success:this.drawTerms,failure:this.showError});var rt=new Ext.tree.TreeNode({text:HS.i18n("RT"),termId:'rt',icon:this.appPath+'img/indicator.gif'});this.thesRoot.appendChild(rt);Ext.Ajax.request({url:this.prepareRequest("getRelatedConcepts?concept_uri="+
theNode.attributes.termId+"&relation_uri=http://www.w3.org/2004/02/skos/core%23related&language="+
this.lang),scope:this,options:{node:rt},success:this.drawTerms,failure:this.showError});this.thesRoot.expand();};this.prepareRequest=function(arg){var url=this.url+arg;if(this.proxy)
return this.proxy+escape(url);else
return url;};this.returnTerm=function(obj){if(obj.xtype!='button')
this.data=obj.attributes.termId;this.theMask.show();this.output={terms:{},uri:'',version:''};this.status=0;for(var i=0;i<this.outputLangs.length;i++){Ext.Ajax.request({url:this.prepareRequest("getConcept?concept_uri="+this.data+"&language="+this.outputLangs[i]),scope:this,success:this.getConceptBack,failure:this.showError});}};this.getBroaderConcept=function(uri,lang){Ext.Ajax.request({url:this.prepareRequest("getRelatedConcepts?concept_uri="+uri+"&relation_uri=http://www.w3.org/2004/02/skos/core%23broader&language="+lang),scope:this,success:this.getConceptBack,failure:this.showError});};this.getConceptBack=function(r,o){if(r.responseText){try{
var data=clean_getRelatedConcepts_response(Ext.util.JSON.decode(r.responseText));
if(!data.preferredLabel){for(var i=0;i<data.length;i++){if(data[i].uri.indexOf(this.CONCEPT)>-1){data=data[i];break;}}
if(!data.preferredLabel){this.finishTerm();return;}}
if(!this.output.terms[data.preferredLabel.language]){this.output.terms[data.preferredLabel.language]=data.preferredLabel.string;this.output.uri=data.uri;}
else
this.output.terms[data.preferredLabel.language]=data.preferredLabel.string+
this.separator+this.output.terms[data.preferredLabel.language];if(this.returnPath)
this.getBroaderConcept(data.uri,data.preferredLabel.language);else
this.finishTerm();}
catch(e){alert('Data error!');}}
else{this.finishTerm();}};this.finishTerm=function(){this.status++;if(this.status==this.outputLangs.length){Ext.Ajax.request({url:this.prepareRequest("getAvailableThesauri"),scope:this,success:this.returnTerms,failure:this.showError});}};this.returnTerms=function(r,o){var data=Ext.util.JSON.decode(r.responseText);for(var i=0;i<data.length;i++){if(this.output.uri.indexOf(data[i].uri)>-1){this.output.version=data[i].version;break;}}
this.theMask.hide();this.handler(this.output);};this.detailPanel=new Ext.Panel({height:100,region:'south',collapsed:true,collapseMode:'mini',autoScroll:true,cls:'thes-description',split:true});var tb=new Ext.Toolbar([{xtype:'button',text:HS.i18n("Use"),icon:this.appPath+'img/drop-yes.gif',cls:'x-btn-text-icon',handler:this.returnTerm,scope:this},'-','xxx']);this.treePanel=new Ext.tree.TreePanel({layout:'fit',useArrows:true,autoScroll:true,region:'center',tbar:tb,rootVisible:true});this.thesRoot=new Ext.tree.TreeNode({draggable:true,allowChildren:true,leaf:false,singleClickExpand:true,text:'',cls:'thes-root',expanded:true});tb.hide();this.treePanel.setRootNode(this.thesRoot);searchField.onTriggerClick=this.getByTerm;searchField.on('specialkey',function(f,e){if(e.getKey()==e.ENTER)searchField.onTriggerClick();},searchField);config.layout='border';
config.tbar=[
   //{handler:function(){this.getTopConcepts(this.INSPIRE);},
   // icon:this.appPath+'img/inspire.gif',cls:'x-btn-icon',tooltip:HS.i18n('INSPIRE themes'),scope:this},
   {handler:function(){this.getTopConcepts(this.CONCEPT);},icon:this.appPath+'img/eeaicon.gif',cls:'x-btn-icon',tooltip:HS.i18n('GEMET top concepts'),scope:this},"-",HS.i18n("Search")+': ',searchField];config.items=[this.detailPanel,this.treePanel];ThesaurusReader.superclass.constructor.call(this,config);};Ext.extend(ThesaurusReader,Ext.Panel,{});var HS={lang:null,defaultLang:"eng",allLangsSet:false,Lang:{},i18n:function(){if(!this.getLang()){this.setLang(this.defaultLang);}
var trans=null;var KEY=null;if(typeof(arguments[0])==typeof({})){trans=arguments[0];KEY=arguments[1];}
else{trans=this.Lang;KEY=arguments[0];}
var retString="";for(var lang in trans){if(lang==this.lang){retString=trans[this.lang][KEY];}}
return(retString?retString:KEY);},setLang:function(code,saveToCookie){this.initLangs()
if(this.allLangsSet==false){var hsset=false;var olset=false;var hscode=null;var olcode=null;for(var l in this.langs){breakthis=false;var keys=this.langs[l];for(var i=0;i<keys.length;i++){if(keys[i]==code){hscode=l.split(";")[0];olcode=this.getOLCode(hscode);breakthis=true;break;}}
if(breakthis){break;}}
if(hscode==null){hscode="eng";olcode="en";}
this.lang=hscode;if(saveToCookie==true){this.setCookie("lang",hscode);}
hsset=true;if(window.OpenLayers&&window.OpenLayers.Lang){OpenLayers.Lang.setCode(olcode);olset=true;}
if(olset&&hsset){}}
return true;},getLang:function(type){if(!type){type=3;}
if(!this.lang){return null;}
else{return this.getCodeFromLanguage(this.lang,type);}},getLastLangCode:function(){var code=null;if(window.location.search.length>0){var search=window.location.search;var params=search.substr(1,search.length);params=params.split("&");for(var i=0;i<params.length;i++){var param=params[i].split("=");if(param[0]=="lang"){code=this.getCodeFromLanguage(param[1],3);}}}
if(!code){try{code=this.getCookie("lang");code=this.getCodeFromLanguage(code);}
catch(e){}}
return code;},getCodeFromLanguage:function(code,type){if(!type){type=3;}
for(var l in this.langs){breakthis=false;var keys=this.langs[l];for(var i=0;i<keys.length;i++){if(keys[i]==code){codes=l.split(";");switch(type){case 2:return codes[2];break;case 3:return codes[0];break;case"ol":return codes[0];break;default:return"eng";break;}}}}
return null;},setCookie:function(c_name,value,expiredays){var exdate=new Date();exdate.setDate(exdate.getDate()+expiredays);document.cookie=c_name+"="+escape(value)+
((expiredays==null)?"":";expires="+exdate.toGMTString());},getCookie:function(c_name){if(document.cookie.length>0){c_start=document.cookie.indexOf(c_name+"=");if(c_start!=-1){c_start=c_start+c_name.length+1;c_end=document.cookie.indexOf(";",c_start);if(c_end==-1)c_end=document.cookie.length;return unescape(document.cookie.substring(c_start,c_end));}}
return"";},langs:{"eng;en;en":["en","eng","english"],"ger;de;de":["de","ger","deutsch"],"fre;fr;fr":["fr","fre","france"],"pol;pl;pl":["pl","pol","polska"],"ita:it;it":["it","ita","italiano","italien"],"rus:ru;ru":["rus","ru","russe"],"spa:es:spa":["es","spa","espagnol","castillan"],"slk:sk:sk":["slk","slo","sk","slovensky","slovak"],"cze;cs-CZ;cs":["cz","cze","cs-CZ","czech","cesky","cs"],"lav;lv-LV;lv":["lv","lav","lv-LV","latvian","latv"]},initLangs:function(){for(var lang in this.langs){var hsLangName=lang.split(";")[0];var olangName=lang.split(";")[1];if(!this.Lang[hsLangName]){this.Lang[hsLangName]={};}
try{if(window.OpenLayers&&!OpenLayers.Lang[olangName]){OpenLayers.Lang[olangName]={};}}catch(e){}}},getOLCode:function(code){for(var c in this.langs){var codes=c.split(";");if(code==codes[0]){return(codes.length>1?codes[1]:codes[0]);}}
return"en";},setDefaultLanguage:function(){var lastLang=this.getLastLangCode();if(!lastLang){lastLang=this.defaultLang;}
this.setLang(lastLang);}};HS.initLangs();HS.Lang["cze"]["Home"]="Výchozí";HS.Lang["cze"]["Search"]="Hledat";HS.Lang["cze"]["BT"]="Širší termíny";HS.Lang["cze"]["NT"]="Užší termíny";HS.Lang["cze"]["RT"]="Příbuzné termíny";HS.Lang["cze"]["Use"]="Použít";HS.Lang["cze"]["Themes"]="Témata";HS.Lang["cze"]["Groups"]="Skupiny";HS.Lang["cze"]["Warning"]="Výstraha";HS.Lang["cze"]["characters required"]="znaků vyžadováno";HS.Lang["cze"]["Top concepts"]="Výchozí témata";HS.Lang["cze"]["Found"]="Nalezeno";HS.Lang["cze"]["INSPIRE themes"]="INSPIRE - témata";HS.Lang["cze"]['GEMET top concepts']="GEMET - základní koncepty";HS.Lang["eng"]["BT"]="Broader terms";HS.Lang["eng"]["NT"]="Narrower terms";HS.Lang["eng"]["RT"]="Related terms";Ext.namespace("Cigno");
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
/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */


/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Events/buttonclick.js
 */

/**
 * Class: OpenLayers.Control.PanZoom
 * The PanZoom is a visible control, composed of a
 * <OpenLayers.Control.PanPanel> and a <OpenLayers.Control.ZoomPanel>. By
 * default it is drawn in the upper left corner of the map.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.PanZoom = OpenLayers.Class(OpenLayers.Control, {

    /** 
     * APIProperty: slideFactor
     * {Integer} Number of pixels by which we'll pan the map in any direction 
     *     on clicking the arrow buttons.  If you want to pan by some ratio
     *     of the map dimensions, use <slideRatio> instead.
     */
    slideFactor: 50,

    /** 
     * APIProperty: slideRatio
     * {Number} The fraction of map width/height by which we'll pan the map            
     *     on clicking the arrow buttons.  Default is null.  If set, will
     *     override <slideFactor>. E.g. if slideRatio is .5, then the Pan Up
     *     button will pan up half the map height. 
     */
    slideRatio: null,

    /** 
     * Property: buttons
     * {Array(DOMElement)} Array of Button Divs 
     */
    buttons: null,

    /** 
     * Property: position
     * {<OpenLayers.Pixel>} 
     */
    position: null,

    /**
     * Constructor: OpenLayers.Control.PanZoom
     * 
     * Parameters:
     * options - {Object}
     */
    initialize: function(options) {
        this.position = new OpenLayers.Pixel(OpenLayers.Control.PanZoom.X,
                                             OpenLayers.Control.PanZoom.Y);
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
    },

    /**
     * APIMethod: destroy
     */
    destroy: function() {
        if (this.map) {
            this.map.events.unregister("buttonclick", this, this.onButtonClick);
        }
        this.removeButtons();
        this.buttons = null;
        this.position = null;
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },

    /** 
     * Method: setMap
     *
     * Properties:
     * map - {<OpenLayers.Map>} 
     */
    setMap: function(map) {
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
        this.map.events.register("buttonclick", this, this.onButtonClick);
    },

    /**
     * Method: draw
     *
     * Parameters:
     * px - {<OpenLayers.Pixel>} 
     * 
     * Returns:
     * {DOMElement} A reference to the container div for the PanZoom control.
     */
    draw: function(px) {
        // initialize our internal div
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        px = this.position;

        // place the controls
        this.buttons = [];

        var sz = {w: 18, h: 18};
        var centered = new OpenLayers.Pixel(px.x+sz.w/2, px.y);

        this._addButton("panup", "north-mini.png", centered, sz);
        px.y = centered.y+sz.h;
        this._addButton("panleft", "west-mini.png", px, sz);
        this._addButton("panright", "east-mini.png", px.add(sz.w, 0), sz);
        this._addButton("pandown", "south-mini.png", 
                        centered.add(0, sz.h*2), sz);
        this._addButton("zoomin", "zoom-plus-mini.png", 
                        centered.add(0, sz.h*3+5), sz);
        this._addButton("zoomworld", "zoom-world-mini.png", 
                        centered.add(0, sz.h*4+5), sz);
        this._addButton("zoomout", "zoom-minus-mini.png", 
                        centered.add(0, sz.h*5+5), sz);
        return this.div;
    },
    
    /**
     * Method: _addButton
     * 
     * Parameters:
     * id - {String} 
     * img - {String} 
     * xy - {<OpenLayers.Pixel>} 
     * sz - {<OpenLayers.Size>} 
     * 
     * Returns:
     * {DOMElement} A Div (an alphaImageDiv, to be precise) that contains the
     *     image of the button, and has all the proper event handlers set.
     */
    _addButton:function(id, img, xy, sz) {
        var imgLocation = OpenLayers.Util.getImageLocation(img);
        var btn = OpenLayers.Util.createAlphaImageDiv(
                                    this.id + "_" + id, 
                                    xy, sz, imgLocation, "absolute");
        btn.style.cursor = "pointer";
        //we want to add the outer div
        this.div.appendChild(btn);
        btn.action = id;
        btn.className = "olButton";
    
        //we want to remember/reference the outer div
        this.buttons.push(btn);
        return btn;
    },
    
    /**
     * Method: _removeButton
     * 
     * Parameters:
     * btn - {Object}
     */
    _removeButton: function(btn) {
        this.div.removeChild(btn);
        OpenLayers.Util.removeItem(this.buttons, btn);
    },
    
    /**
     * Method: removeButtons
     */
    removeButtons: function() {
        for(var i=this.buttons.length-1; i>=0; --i) {
            this._removeButton(this.buttons[i]);
        }
    },
    
    /**
     * Method: onButtonClick
     *
     * Parameters:
     * evt - {Event}
     */
    onButtonClick: function(evt) {
        var btn = evt.buttonElement;
        switch (btn.action) {
            case "panup": 
                this.map.pan(0, -this.getSlideFactor("h"));
                break;
            case "pandown": 
                this.map.pan(0, this.getSlideFactor("h"));
                break;
            case "panleft": 
                this.map.pan(-this.getSlideFactor("w"), 0);
                break;
            case "panright": 
                this.map.pan(this.getSlideFactor("w"), 0);
                break;
            case "zoomin": 
                this.map.zoomIn(); 
                break;
            case "zoomout": 
                this.map.zoomOut(); 
                break;
            case "zoomworld": 
                this.map.zoomToMaxExtent(); 
                break;
        }
    },
    
    /**
     * Method: getSlideFactor
     *
     * Parameters:
     * dim - {String} "w" or "h" (for width or height).
     *
     * Returns:
     * {Number} The slide factor for panning in the requested direction.
     */
    getSlideFactor: function(dim) {
        return this.slideRatio ?
            this.map.getSize()[dim] * this.slideRatio :
            this.slideFactor;
    },

    CLASS_NAME: "OpenLayers.Control.PanZoom"
});

/**
 * Constant: X
 * {Integer}
 */
OpenLayers.Control.PanZoom.X = 4;

/**
 * Constant: Y
 * {Integer}
 */
OpenLayers.Control.PanZoom.Y = 4;
/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */


/**
 * @requires OpenLayers/Control.js
 */

/**
 * Class: OpenLayers.Control.ArgParser
 * The ArgParser control adds location bar query string parsing functionality 
 * to an OpenLayers Map.
 * When added to a Map control, on a page load/refresh, the Map will 
 * automatically take the href string and parse it for lon, lat, zoom, and 
 * layers information. 
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.ArgParser = OpenLayers.Class(OpenLayers.Control, {

    /**
     * Property: center
     * {<OpenLayers.LonLat>}
     */
    center: null,
    
    /**
     * Property: zoom
     * {int}
     */
    zoom: null,

    /**
     * Property: layers
     * {Array(<OpenLayers.Layer>)}
     */
    layers: null,
    
    /** 
     * APIProperty: displayProjection
     * {<OpenLayers.Projection>} Requires proj4js support. 
     *     Projection used when reading the coordinates from the URL. This will
     *     reproject the map coordinates from the URL into the map's
     *     projection.
     *
     *     If you are using this functionality, be aware that any permalink
     *     which is added to the map will determine the coordinate type which
     *     is read from the URL, which means you should not add permalinks with
     *     different displayProjections to the same map. 
     */
    displayProjection: null, 

    /**
     * Constructor: OpenLayers.Control.ArgParser
     *
     * Parameters:
     * options - {Object}
     */

    /**
     * Method: getParameters
     */    
    getParameters: function(url) {
        url = url || window.location.href;
        var parameters = OpenLayers.Util.getParameters(url);

        // If we have an anchor in the url use it to split the url
        var index = url.indexOf('#');
        if (index > 0) {
            // create an url to parse on the getParameters
            url = '?' + url.substring(index + 1, url.length);

            OpenLayers.Util.extend(parameters,
                    OpenLayers.Util.getParameters(url));
        }
        return parameters;
    },
    
    /**
     * Method: setMap
     * Set the map property for the control. 
     * 
     * Parameters:
     * map - {<OpenLayers.Map>} 
     */
    setMap: function(map) {
        OpenLayers.Control.prototype.setMap.apply(this, arguments);

        //make sure we dont already have an arg parser attached
        for(var i=0, len=this.map.controls.length; i<len; i++) {
            var control = this.map.controls[i];
            if ( (control != this) &&
                 (control.CLASS_NAME == "OpenLayers.Control.ArgParser") ) {
                
                // If a second argparser is added to the map, then we 
                // override the displayProjection to be the one added to the
                // map. 
                if (control.displayProjection != this.displayProjection) {
                    this.displayProjection = control.displayProjection;
                }    
                
                break;
            }
        }
        if (i == this.map.controls.length) {

            var args = this.getParameters();
            // Be careful to set layer first, to not trigger unnecessary layer loads
            if (args.layers) {
                this.layers = args.layers;
    
                // when we add a new layer, set its visibility 
                this.map.events.register('addlayer', this, 
                                         this.configureLayers);
                this.configureLayers();
            }
            if (args.lat && args.lon) {
                this.center = new OpenLayers.LonLat(parseFloat(args.lon),
                                                    parseFloat(args.lat));
                if (args.zoom) {
                    this.zoom = parseFloat(args.zoom);
                }
    
                // when we add a new baselayer to see when we can set the center
                this.map.events.register('changebaselayer', this, 
                                         this.setCenter);
                this.setCenter();
            }
        }
    },
   
    /** 
     * Method: setCenter
     * As soon as a baseLayer has been loaded, we center and zoom
     *   ...and remove the handler.
     */
    setCenter: function() {
        
        if (this.map.baseLayer) {
            //dont need to listen for this one anymore
            this.map.events.unregister('changebaselayer', this, 
                                       this.setCenter);
            
            if (this.displayProjection) {
                this.center.transform(this.displayProjection, 
                                      this.map.getProjectionObject()); 
            }      

            this.map.setCenter(this.center, this.zoom);
        }
    },

    /** 
     * Method: configureLayers
     * As soon as all the layers are loaded, cycle through them and 
     *   hide or show them. 
     */
    configureLayers: function() {

        if (this.layers.length == this.map.layers.length) { 
            this.map.events.unregister('addlayer', this, this.configureLayers);

            for(var i=0, len=this.layers.length; i<len; i++) {
                
                var layer = this.map.layers[i];
                var c = this.layers.charAt(i);
                
                if (c == "B") {
                    this.map.setBaseLayer(layer);
                } else if ( (c == "T") || (c == "F") ) {
                    layer.setVisibility(c == "T");
                }
            }
        }
    },     

    CLASS_NAME: "OpenLayers.Control.ArgParser"
});
/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/BaseTypes.js
 * @requires OpenLayers/BaseTypes/Bounds.js
 * @requires OpenLayers/BaseTypes/Element.js
 * @requires OpenLayers/BaseTypes/LonLat.js
 * @requires OpenLayers/BaseTypes/Pixel.js
 * @requires OpenLayers/BaseTypes/Size.js
 * @requires OpenLayers/Lang.js
 */

/**
 * Namespace: Util
 */
OpenLayers.Util = OpenLayers.Util || {};

/** 
 * Function: getElement
 * This is the old $() from prototype
 *
 * Parameters:
 * e - {String or DOMElement or Window}
 *
 * Returns:
 * {Array(DOMElement) or DOMElement}
 */
OpenLayers.Util.getElement = function() {
    var elements = [];

    for (var i=0, len=arguments.length; i<len; i++) {
        var element = arguments[i];
        if (typeof element == 'string') {
            element = document.getElementById(element);
        }
        if (arguments.length == 1) {
            return element;
        }
        elements.push(element);
    }
    return elements;
};

/**
 * Function: isElement
 * A cross-browser implementation of "e instanceof Element".
 *
 * Parameters:
 * o - {Object} The object to test.
 *
 * Returns:
 * {Boolean}
 */
OpenLayers.Util.isElement = function(o) {
    return !!(o && o.nodeType === 1);
};

/**
 * Function: isArray
 * Tests that the provided object is an array.
 * This test handles the cross-IFRAME case not caught
 * by "a instanceof Array" and should be used instead.
 * 
 * Parameters:
 * a - {Object} the object test.
 * 
 * Returns:
 * {Boolean} true if the object is an array.
 */
OpenLayers.Util.isArray = function(a) {
	return (Object.prototype.toString.call(a) === '[object Array]');
};

/** 
 * Maintain existing definition of $.
 */
if(typeof window.$  === "undefined") {
    window.$ = OpenLayers.Util.getElement;
}

/** 
 * Function: removeItem
 * Remove an object from an array. Iterates through the array
 *     to find the item, then removes it.
 *
 * Parameters:
 * array - {Array}
 * item - {Object}
 * 
 * Returns:
 * {Array} A reference to the array
 */
OpenLayers.Util.removeItem = function(array, item) {
    for(var i = array.length - 1; i >= 0; i--) {
        if(array[i] == item) {
            array.splice(i,1);
            //break;more than once??
        }
    }
    return array;
};

/** 
 * Function: indexOf
 * Seems to exist already in FF, but not in MOZ.
 * 
 * Parameters:
 * array - {Array}
 * obj - {*}
 * 
 * Returns:
 * {Integer} The index at, which the first object was found in the array.
 *           If not found, returns -1.
 */
OpenLayers.Util.indexOf = function(array, obj) {
    // use the build-in function if available.
    if (typeof array.indexOf == "function") {
        return array.indexOf(obj);
    } else {
        for (var i = 0, len = array.length; i < len; i++) {
            if (array[i] == obj) {
                return i;
            }
        }
        return -1;   
    }
};



/**
 * Function: modifyDOMElement
 * 
 * Modifies many properties of a DOM element all at once.  Passing in 
 * null to an individual parameter will avoid setting the attribute.
 *
 * Parameters:
 * element - {DOMElement} DOM element to modify.
 * id - {String} The element id attribute to set.
 * px - {<OpenLayers.Pixel>|Object} The element left and top position,
 *                                  OpenLayers.Pixel or an object with
 *                                  a 'x' and 'y' properties.
 * sz - {<OpenLayers.Size>|Object} The element width and height,
 *                                 OpenLayers.Size or an object with a
 *                                 'w' and 'h' properties.
 * position - {String}       The position attribute.  eg: absolute, 
 *                           relative, etc.
 * border - {String}         The style.border attribute.  eg:
 *                           solid black 2px
 * overflow - {String}       The style.overview attribute.  
 * opacity - {Float}         Fractional value (0.0 - 1.0)
 */
OpenLayers.Util.modifyDOMElement = function(element, id, px, sz, position, 
                                            border, overflow, opacity) {

    if (id) {
        element.id = id;
    }
    if (px) {
        element.style.left = px.x + "px";
        element.style.top = px.y + "px";
    }
    if (sz) {
        element.style.width = sz.w + "px";
        element.style.height = sz.h + "px";
    }
    if (position) {
        element.style.position = position;
    }
    if (border) {
        element.style.border = border;
    }
    if (overflow) {
        element.style.overflow = overflow;
    }
    if (parseFloat(opacity) >= 0.0 && parseFloat(opacity) < 1.0) {
        element.style.filter = 'alpha(opacity=' + (opacity * 100) + ')';
        element.style.opacity = opacity;
    } else if (parseFloat(opacity) == 1.0) {
        element.style.filter = '';
        element.style.opacity = '';
    }
};

/** 
 * Function: createDiv
 * Creates a new div and optionally set some standard attributes.
 * Null may be passed to each parameter if you do not wish to
 * set a particular attribute.
 * Note - zIndex is NOT set on the resulting div.
 * 
 * Parameters:
 * id - {String} An identifier for this element.  If no id is
 *               passed an identifier will be created 
 *               automatically.
 * px - {<OpenLayers.Pixel>|Object} The element left and top position,
 *                                  OpenLayers.Pixel or an object with
 *                                  a 'x' and 'y' properties.
 * sz - {<OpenLayers.Size>|Object} The element width and height,
 *                                 OpenLayers.Size or an object with a
 *                                 'w' and 'h' properties.
 * imgURL - {String} A url pointing to an image to use as a 
 *                   background image.
 * position - {String} The style.position value. eg: absolute,
 *                     relative etc.
 * border - {String} The the style.border value. 
 *                   eg: 2px solid black
 * overflow - {String} The style.overflow value. Eg. hidden
 * opacity - {Float} Fractional value (0.0 - 1.0)
 * 
 * Returns: 
 * {DOMElement} A DOM Div created with the specified attributes.
 */
OpenLayers.Util.createDiv = function(id, px, sz, imgURL, position, 
                                     border, overflow, opacity) {

    var dom = document.createElement('div');

    if (imgURL) {
        dom.style.backgroundImage = 'url(' + imgURL + ')';
    }

    //set generic properties
    if (!id) {
        id = OpenLayers.Util.createUniqueID("OpenLayersDiv");
    }
    if (!position) {
        position = "absolute";
    }
    OpenLayers.Util.modifyDOMElement(dom, id, px, sz, position, 
                                     border, overflow, opacity);

    return dom;
};

/**
 * Function: createImage
 * Creates an img element with specific attribute values.
 *  
 * Parameters:
 * id - {String} The id field for the img.  If none assigned one will be
 *               automatically generated.
 * px - {<OpenLayers.Pixel>|Object} The element left and top position,
 *                                  OpenLayers.Pixel or an object with
 *                                  a 'x' and 'y' properties.
 * sz - {<OpenLayers.Size>|Object} The element width and height,
 *                                 OpenLayers.Size or an object with a
 *                                 'w' and 'h' properties.
 * imgURL - {String} The url to use as the image source.
 * position - {String} The style.position value.
 * border - {String} The border to place around the image.
 * opacity - {Float} Fractional value (0.0 - 1.0)
 * delayDisplay - {Boolean} If true waits until the image has been
 *                          loaded.
 * 
 * Returns:
 * {DOMElement} A DOM Image created with the specified attributes.
 */
OpenLayers.Util.createImage = function(id, px, sz, imgURL, position, border,
                                       opacity, delayDisplay) {

    var image = document.createElement("img");

    //set generic properties
    if (!id) {
        id = OpenLayers.Util.createUniqueID("OpenLayersDiv");
    }
    if (!position) {
        position = "relative";
    }
    OpenLayers.Util.modifyDOMElement(image, id, px, sz, position, 
                                     border, null, opacity);

    if (delayDisplay) {
        image.style.display = "none";
        function display() {
            image.style.display = "";
            OpenLayers.Event.stopObservingElement(image);
        }
        OpenLayers.Event.observe(image, "load", display);
        OpenLayers.Event.observe(image, "error", display);
    }
    
    //set special properties
    image.style.alt = id;
    image.galleryImg = "no";
    if (imgURL) {
        image.src = imgURL;
    }
        
    return image;
};

/**
 * Property: IMAGE_RELOAD_ATTEMPTS
 * {Integer} How many times should we try to reload an image before giving up?
 *           Default is 0
 */
OpenLayers.IMAGE_RELOAD_ATTEMPTS = 0;

/**
 * Property: alphaHackNeeded
 * {Boolean} true if the png alpha hack is necessary and possible, false otherwise.
 */
OpenLayers.Util.alphaHackNeeded = null;

/**
 * Function: alphaHack
 * Checks whether it's necessary (and possible) to use the png alpha
 * hack which allows alpha transparency for png images under Internet
 * Explorer.
 * 
 * Returns:
 * {Boolean} true if the png alpha hack is necessary and possible, false otherwise.
 */
OpenLayers.Util.alphaHack = function() {
    if (OpenLayers.Util.alphaHackNeeded == null) {
        var arVersion = navigator.appVersion.split("MSIE");
        var version = parseFloat(arVersion[1]);
        var filter = false;
    
        // IEs4Lin dies when trying to access document.body.filters, because 
        // the property is there, but requires a DLL that can't be provided. This
        // means that we need to wrap this in a try/catch so that this can
        // continue.
    
        try { 
            filter = !!(document.body.filters);
        } catch (e) {}    
    
        OpenLayers.Util.alphaHackNeeded = (filter && 
                                           (version >= 5.5) && (version < 7));
    }
    return OpenLayers.Util.alphaHackNeeded;
};

/** 
 * Function: modifyAlphaImageDiv
 * 
 * Parameters:
 * div - {DOMElement} Div containing Alpha-adjusted Image
 * id - {String}
 * px - {<OpenLayers.Pixel>|Object} OpenLayers.Pixel or an object with
 *                                  a 'x' and 'y' properties.
 * sz - {<OpenLayers.Size>|Object} OpenLayers.Size or an object with
 *                                 a 'w' and 'h' properties.
 * imgURL - {String}
 * position - {String}
 * border - {String}
 * sizing - {String} 'crop', 'scale', or 'image'. Default is "scale"
 * opacity - {Float} Fractional value (0.0 - 1.0)
 */ 
OpenLayers.Util.modifyAlphaImageDiv = function(div, id, px, sz, imgURL, 
                                               position, border, sizing, 
                                               opacity) {

    OpenLayers.Util.modifyDOMElement(div, id, px, sz, position,
                                     null, null, opacity);

    var img = div.childNodes[0];

    if (imgURL) {
        img.src = imgURL;
    }
    OpenLayers.Util.modifyDOMElement(img, div.id + "_innerImage", null, sz, 
                                     "relative", border);
    
    if (OpenLayers.Util.alphaHack()) {
        if(div.style.display != "none") {
            div.style.display = "inline-block";
        }
        if (sizing == null) {
            sizing = "scale";
        }
        
        div.style.filter = "progid:DXImageTransform.Microsoft" +
                           ".AlphaImageLoader(src='" + img.src + "', " +
                           "sizingMethod='" + sizing + "')";
        if (parseFloat(div.style.opacity) >= 0.0 && 
            parseFloat(div.style.opacity) < 1.0) {
            div.style.filter += " alpha(opacity=" + div.style.opacity * 100 + ")";
        }

        img.style.filter = "alpha(opacity=0)";
    }
};

/** 
 * Function: createAlphaImageDiv
 * 
 * Parameters:
 * id - {String}
 * px - {<OpenLayers.Pixel>|Object} OpenLayers.Pixel or an object with
 *                                  a 'x' and 'y' properties.
 * sz - {<OpenLayers.Size>|Object} OpenLayers.Size or an object with
 *                                 a 'w' and 'h' properties.
 * imgURL - {String}
 * position - {String}
 * border - {String}
 * sizing - {String} 'crop', 'scale', or 'image'. Default is "scale"
 * opacity - {Float} Fractional value (0.0 - 1.0)
 * delayDisplay - {Boolean} If true waits until the image has been
 *                          loaded.
 * 
 * Returns:
 * {DOMElement} A DOM Div created with a DOM Image inside it. If the hack is 
 *              needed for transparency in IE, it is added.
 */ 
OpenLayers.Util.createAlphaImageDiv = function(id, px, sz, imgURL, 
                                               position, border, sizing, 
                                               opacity, delayDisplay) {
    
    var div = OpenLayers.Util.createDiv();
    var img = OpenLayers.Util.createImage(null, null, null, null, null, null, 
                                          null, delayDisplay);
    img.className = "olAlphaImg";
    div.appendChild(img);

    OpenLayers.Util.modifyAlphaImageDiv(div, id, px, sz, imgURL, position, 
                                        border, sizing, opacity);
    
    return div;
};


/** 
 * Function: upperCaseObject
 * Creates a new hashtable and copies over all the keys from the 
 *     passed-in object, but storing them under an uppercased
 *     version of the key at which they were stored.
 * 
 * Parameters: 
 * object - {Object}
 * 
 * Returns: 
 * {Object} A new Object with all the same keys but uppercased
 */
OpenLayers.Util.upperCaseObject = function (object) {
    var uObject = {};
    for (var key in object) {
        uObject[key.toUpperCase()] = object[key];
    }
    return uObject;
};

/** 
 * Function: applyDefaults
 * Takes an object and copies any properties that don't exist from
 *     another properties, by analogy with OpenLayers.Util.extend() from
 *     Prototype.js.
 * 
 * Parameters:
 * to - {Object} The destination object.
 * from - {Object} The source object.  Any properties of this object that
 *     are undefined in the to object will be set on the to object.
 *
 * Returns:
 * {Object} A reference to the to object.  Note that the to argument is modified
 *     in place and returned by this function.
 */
OpenLayers.Util.applyDefaults = function (to, from) {
    to = to || {};
    /*
     * FF/Windows < 2.0.0.13 reports "Illegal operation on WrappedNative
     * prototype object" when calling hawOwnProperty if the source object is an
     * instance of window.Event.
     */
    var fromIsEvt = typeof window.Event == "function"
                    && from instanceof window.Event;

    for (var key in from) {
        if (to[key] === undefined ||
            (!fromIsEvt && from.hasOwnProperty
             && from.hasOwnProperty(key) && !to.hasOwnProperty(key))) {
            to[key] = from[key];
        }
    }
    /**
     * IE doesn't include the toString property when iterating over an object's
     * properties with the for(property in object) syntax.  Explicitly check if
     * the source has its own toString property.
     */
    if(!fromIsEvt && from && from.hasOwnProperty
       && from.hasOwnProperty('toString') && !to.hasOwnProperty('toString')) {
        to.toString = from.toString;
    }
    
    return to;
};

/**
 * Function: getParameterString
 * 
 * Parameters:
 * params - {Object}
 * 
 * Returns:
 * {String} A concatenation of the properties of an object in 
 *          http parameter notation. 
 *          (ex. <i>"key1=value1&key2=value2&key3=value3"</i>)
 *          If a parameter is actually a list, that parameter will then
 *          be set to a comma-seperated list of values (foo,bar) instead
 *          of being URL escaped (foo%3Abar). 
 */
OpenLayers.Util.getParameterString = function(params) {
    var paramsArray = [];
    
    for (var key in params) {
      var value = params[key];
      if ((value != null) && (typeof value != 'function')) {
        var encodedValue;
        if (typeof value == 'object' && value.constructor == Array) {
          /* value is an array; encode items and separate with "," */
          var encodedItemArray = [];
          var item;
          for (var itemIndex=0, len=value.length; itemIndex<len; itemIndex++) {
            item = value[itemIndex];
            encodedItemArray.push(encodeURIComponent(
                (item === null || item === undefined) ? "" : item)
            );
          }
          encodedValue = encodedItemArray.join(",");
        }
        else {
          /* value is a string; simply encode */
          encodedValue = encodeURIComponent(value);
        }
        paramsArray.push(encodeURIComponent(key) + "=" + encodedValue);
      }
    }
    
    return paramsArray.join("&");
};

/**
 * Function: urlAppend
 * Appends a parameter string to a url. This function includes the logic for
 * using the appropriate character (none, & or ?) to append to the url before
 * appending the param string.
 * 
 * Parameters:
 * url - {String} The url to append to
 * paramStr - {String} The param string to append
 * 
 * Returns:
 * {String} The new url
 */
OpenLayers.Util.urlAppend = function(url, paramStr) {
    var newUrl = url;
    if(paramStr) {
        var parts = (url + " ").split(/[?&]/);
        newUrl += (parts.pop() === " " ?
            paramStr :
            parts.length ? "&" + paramStr : "?" + paramStr);
    }
    return newUrl;
};

/**
 * Property: ImgPath
 * {String} Default is ''.
 */
OpenLayers.ImgPath = '';

/** 
 * Function: getImagesLocation
 * 
 * Returns:
 * {String} The fully formatted image location string
 */
OpenLayers.Util.getImagesLocation = function() {
    return OpenLayers.ImgPath || (OpenLayers._getScriptLocation() + "img/");
};

/** 
 * Function: getImageLocation
 * 
 * Returns:
 * {String} The fully formatted location string for a specified image
 */
OpenLayers.Util.getImageLocation = function(image) {
    return OpenLayers.Util.getImagesLocation() + image;
};


/** 
 * Function: Try
 * Execute functions until one of them doesn't throw an error. 
 *     Capitalized because "try" is a reserved word in JavaScript.
 *     Taken directly from OpenLayers.Util.Try()
 * 
 * Parameters:
 * [*] - {Function} Any number of parameters may be passed to Try()
 *    It will attempt to execute each of them until one of them 
 *    successfully executes. 
 *    If none executes successfully, returns null.
 * 
 * Returns:
 * {*} The value returned by the first successfully executed function.
 */
OpenLayers.Util.Try = function() {
    var returnValue = null;

    for (var i=0, len=arguments.length; i<len; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) {}
    }

    return returnValue;
};

/**
 * Function: getXmlNodeValue
 * 
 * Parameters:
 * node - {XMLNode}
 * 
 * Returns:
 * {String} The text value of the given node, without breaking in firefox or IE
 */
OpenLayers.Util.getXmlNodeValue = function(node) {
    var val = null;
    OpenLayers.Util.Try( 
        function() {
            val = node.text;
            if (!val) {
                val = node.textContent;
            }
            if (!val) {
                val = node.firstChild.nodeValue;
            }
        }, 
        function() {
            val = node.textContent;
        }); 
    return val;
};

/** 
 * Function: mouseLeft
 * 
 * Parameters:
 * evt - {Event}
 * div - {HTMLDivElement}
 * 
 * Returns:
 * {Boolean}
 */
OpenLayers.Util.mouseLeft = function (evt, div) {
    // start with the element to which the mouse has moved
    var target = (evt.relatedTarget) ? evt.relatedTarget : evt.toElement;
    // walk up the DOM tree.
    while (target != div && target != null) {
        target = target.parentNode;
    }
    // if the target we stop at isn't the div, then we've left the div.
    return (target != div);
};

/**
 * Property: precision
 * {Number} The number of significant digits to retain to avoid
 * floating point precision errors.
 *
 * We use 14 as a "safe" default because, although IEEE 754 double floats
 * (standard on most modern operating systems) support up to about 16
 * significant digits, 14 significant digits are sufficient to represent
 * sub-millimeter accuracy in any coordinate system that anyone is likely to
 * use with OpenLayers.
 *
 * If DEFAULT_PRECISION is set to 0, the original non-truncating behavior
 * of OpenLayers <2.8 is preserved. Be aware that this will cause problems
 * with certain projections, e.g. spherical Mercator.
 *
 */
OpenLayers.Util.DEFAULT_PRECISION = 14;

/**
 * Function: toFloat
 * Convenience method to cast an object to a Number, rounded to the
 * desired floating point precision.
 *
 * Parameters:
 * number    - {Number} The number to cast and round.
 * precision - {Number} An integer suitable for use with
 *      Number.toPrecision(). Defaults to OpenLayers.Util.DEFAULT_PRECISION.
 *      If set to 0, no rounding is performed.
 *
 * Returns:
 * {Number} The cast, rounded number.
 */
OpenLayers.Util.toFloat = function (number, precision) {
    if (precision == null) {
        precision = OpenLayers.Util.DEFAULT_PRECISION;
    }
    if (typeof number !== "number") {
        number = parseFloat(number);
    }
    return precision === 0 ? number :
                             parseFloat(number.toPrecision(precision));
};

/**
 * Function: rad
 * 
 * Parameters:
 * x - {Float}
 * 
 * Returns:
 * {Float}
 */
OpenLayers.Util.rad = function(x) {return x*Math.PI/180;};

/**
 * Function: deg
 *
 * Parameters:
 * x - {Float}
 *
 * Returns:
 * {Float}
 */
OpenLayers.Util.deg = function(x) {return x*180/Math.PI;};

/**
 * Property: VincentyConstants
 * {Object} Constants for Vincenty functions.
 */
OpenLayers.Util.VincentyConstants = {
    a: 6378137,
    b: 6356752.3142,
    f: 1/298.257223563
};

/**
 * APIFunction: distVincenty
 * Given two objects representing points with geographic coordinates, this
 *     calculates the distance between those points on the surface of an
 *     ellipsoid.
 *
 * Parameters:
 * p1 - {<OpenLayers.LonLat>} (or any object with both .lat, .lon properties)
 * p2 - {<OpenLayers.LonLat>} (or any object with both .lat, .lon properties)
 *
 * Returns:
 * {Float} The distance (in km) between the two input points as measured on an
 *     ellipsoid.  Note that the input point objects must be in geographic
 *     coordinates (decimal degrees) and the return distance is in kilometers.
 */
OpenLayers.Util.distVincenty = function(p1, p2) {
    var ct = OpenLayers.Util.VincentyConstants;
    var a = ct.a, b = ct.b, f = ct.f;

    var L = OpenLayers.Util.rad(p2.lon - p1.lon);
    var U1 = Math.atan((1-f) * Math.tan(OpenLayers.Util.rad(p1.lat)));
    var U2 = Math.atan((1-f) * Math.tan(OpenLayers.Util.rad(p2.lat)));
    var sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
    var sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);
    var lambda = L, lambdaP = 2*Math.PI;
    var iterLimit = 20;
    while (Math.abs(lambda-lambdaP) > 1e-12 && --iterLimit>0) {
        var sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda);
        var sinSigma = Math.sqrt((cosU2*sinLambda) * (cosU2*sinLambda) +
        (cosU1*sinU2-sinU1*cosU2*cosLambda) * (cosU1*sinU2-sinU1*cosU2*cosLambda));
        if (sinSigma==0) {
            return 0;  // co-incident points
        }
        var cosSigma = sinU1*sinU2 + cosU1*cosU2*cosLambda;
        var sigma = Math.atan2(sinSigma, cosSigma);
        var alpha = Math.asin(cosU1 * cosU2 * sinLambda / sinSigma);
        var cosSqAlpha = Math.cos(alpha) * Math.cos(alpha);
        var cos2SigmaM = cosSigma - 2*sinU1*sinU2/cosSqAlpha;
        var C = f/16*cosSqAlpha*(4+f*(4-3*cosSqAlpha));
        lambdaP = lambda;
        lambda = L + (1-C) * f * Math.sin(alpha) *
        (sigma + C*sinSigma*(cos2SigmaM+C*cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)));
    }
    if (iterLimit==0) {
        return NaN;  // formula failed to converge
    }
    var uSq = cosSqAlpha * (a*a - b*b) / (b*b);
    var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
    var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));
    var deltaSigma = B*sinSigma*(cos2SigmaM+B/4*(cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)-
        B/6*cos2SigmaM*(-3+4*sinSigma*sinSigma)*(-3+4*cos2SigmaM*cos2SigmaM)));
    var s = b*A*(sigma-deltaSigma);
    var d = s.toFixed(3)/1000; // round to 1mm precision
    return d;
};

/**
 * APIFunction: destinationVincenty
 * Calculate destination point given start point lat/long (numeric degrees),
 * bearing (numeric degrees) & distance (in m).
 * Adapted from Chris Veness work, see
 * http://www.movable-type.co.uk/scripts/latlong-vincenty-direct.html
 *
 * Parameters:
 * lonlat  - {<OpenLayers.LonLat>} (or any object with both .lat, .lon
 *     properties) The start point.
 * brng     - {Float} The bearing (degrees).
 * dist     - {Float} The ground distance (meters).
 *
 * Returns:
 * {<OpenLayers.LonLat>} The destination point.
 */
OpenLayers.Util.destinationVincenty = function(lonlat, brng, dist) {
    var u = OpenLayers.Util;
    var ct = u.VincentyConstants;
    var a = ct.a, b = ct.b, f = ct.f;

    var lon1 = lonlat.lon;
    var lat1 = lonlat.lat;

    var s = dist;
    var alpha1 = u.rad(brng);
    var sinAlpha1 = Math.sin(alpha1);
    var cosAlpha1 = Math.cos(alpha1);

    var tanU1 = (1-f) * Math.tan(u.rad(lat1));
    var cosU1 = 1 / Math.sqrt((1 + tanU1*tanU1)), sinU1 = tanU1*cosU1;
    var sigma1 = Math.atan2(tanU1, cosAlpha1);
    var sinAlpha = cosU1 * sinAlpha1;
    var cosSqAlpha = 1 - sinAlpha*sinAlpha;
    var uSq = cosSqAlpha * (a*a - b*b) / (b*b);
    var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
    var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));

    var sigma = s / (b*A), sigmaP = 2*Math.PI;
    while (Math.abs(sigma-sigmaP) > 1e-12) {
        var cos2SigmaM = Math.cos(2*sigma1 + sigma);
        var sinSigma = Math.sin(sigma);
        var cosSigma = Math.cos(sigma);
        var deltaSigma = B*sinSigma*(cos2SigmaM+B/4*(cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)-
            B/6*cos2SigmaM*(-3+4*sinSigma*sinSigma)*(-3+4*cos2SigmaM*cos2SigmaM)));
        sigmaP = sigma;
        sigma = s / (b*A) + deltaSigma;
    }

    var tmp = sinU1*sinSigma - cosU1*cosSigma*cosAlpha1;
    var lat2 = Math.atan2(sinU1*cosSigma + cosU1*sinSigma*cosAlpha1,
        (1-f)*Math.sqrt(sinAlpha*sinAlpha + tmp*tmp));
    var lambda = Math.atan2(sinSigma*sinAlpha1, cosU1*cosSigma - sinU1*sinSigma*cosAlpha1);
    var C = f/16*cosSqAlpha*(4+f*(4-3*cosSqAlpha));
    var L = lambda - (1-C) * f * sinAlpha *
        (sigma + C*sinSigma*(cos2SigmaM+C*cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)));

    var revAz = Math.atan2(sinAlpha, -tmp);  // final bearing

    return new OpenLayers.LonLat(lon1+u.deg(L), u.deg(lat2));
};

/**
 * Function: getParameters
 * Parse the parameters from a URL or from the current page itself into a 
 *     JavaScript Object. Note that parameter values with commas are separated
 *     out into an Array.
 * 
 * Parameters:
 * url - {String} Optional url used to extract the query string.
 *                If url is null or is not supplied, query string is taken 
 *                from the page location.
 * 
 * Returns:
 * {Object} An object of key/value pairs from the query string.
 */
OpenLayers.Util.getParameters = function(url) {
    // if no url specified, take it from the location bar
    url = (url === null || url === undefined) ? window.location.href : url;

    //parse out parameters portion of url string
    var paramsString = "";
    if (OpenLayers.String.contains(url, '?')) {
        var start = url.indexOf('?') + 1;
        var end = OpenLayers.String.contains(url, "#") ?
                    url.indexOf('#') : url.length;
        paramsString = url.substring(start, end);
    }

    var parameters = {};
    var pairs = paramsString.split(/[&;]/);
    for(var i=0, len=pairs.length; i<len; ++i) {
        var keyValue = pairs[i].split('=');
        if (keyValue[0]) {

            var key = keyValue[0];
            try {
                key = decodeURIComponent(key);
            } catch (err) {
                key = unescape(key);
            }
            
            // being liberal by replacing "+" with " "
            var value = (keyValue[1] || '').replace(/\+/g, " ");

            try {
                value = decodeURIComponent(value);
            } catch (err) {
                value = unescape(value);
            }
            
            // follow OGC convention of comma delimited values
            value = value.split(",");

            //if there's only one value, do not return as array                    
            if (value.length == 1) {
                value = value[0];
            }                
            
            parameters[key] = value;
         }
     }
    return parameters;
};

/**
 * Property: lastSeqID
 * {Integer} The ever-incrementing count variable.
 *           Used for generating unique ids.
 */
OpenLayers.Util.lastSeqID = 0;

/**
 * Function: createUniqueID
 * Create a unique identifier for this session.  Each time this function
 *     is called, a counter is incremented.  The return will be the optional
 *     prefix (defaults to "id_") appended with the counter value.
 * 
 * Parameters:
 * prefix {String} Optionsal string to prefix unique id. Default is "id_".
 * 
 * Returns:
 * {String} A unique id string, built on the passed in prefix.
 */
OpenLayers.Util.createUniqueID = function(prefix) {
    if (prefix == null) {
        prefix = "id_";
    }
    OpenLayers.Util.lastSeqID += 1; 
    return prefix + OpenLayers.Util.lastSeqID;        
};

/**
 * Constant: INCHES_PER_UNIT
 * {Object} Constant inches per unit -- borrowed from MapServer mapscale.c
 * derivation of nautical miles from http://en.wikipedia.org/wiki/Nautical_mile
 * Includes the full set of units supported by CS-MAP (http://trac.osgeo.org/csmap/)
 * and PROJ.4 (http://trac.osgeo.org/proj/)
 * The hardcoded table is maintain in a CS-MAP source code module named CSdataU.c
 * The hardcoded table of PROJ.4 units are in pj_units.c.
 */
OpenLayers.INCHES_PER_UNIT = { 
    'inches': 1.0,
    'ft': 12.0,
    'mi': 63360.0,
    'm': 39.3701,
    'km': 39370.1,
    'dd': 4374754,
    'yd': 36
};
OpenLayers.INCHES_PER_UNIT["in"]= OpenLayers.INCHES_PER_UNIT.inches;
OpenLayers.INCHES_PER_UNIT["degrees"] = OpenLayers.INCHES_PER_UNIT.dd;
OpenLayers.INCHES_PER_UNIT["nmi"] = 1852 * OpenLayers.INCHES_PER_UNIT.m;

// Units from CS-Map
OpenLayers.METERS_PER_INCH = 0.02540005080010160020;
OpenLayers.Util.extend(OpenLayers.INCHES_PER_UNIT, {
    "Inch": OpenLayers.INCHES_PER_UNIT.inches,
    "Meter": 1.0 / OpenLayers.METERS_PER_INCH,   //EPSG:9001
    "Foot": 0.30480060960121920243 / OpenLayers.METERS_PER_INCH,   //EPSG:9003
    "IFoot": 0.30480000000000000000 / OpenLayers.METERS_PER_INCH,   //EPSG:9002
    "ClarkeFoot": 0.3047972651151 / OpenLayers.METERS_PER_INCH,   //EPSG:9005
    "SearsFoot": 0.30479947153867624624 / OpenLayers.METERS_PER_INCH,   //EPSG:9041
    "GoldCoastFoot": 0.30479971018150881758 / OpenLayers.METERS_PER_INCH,   //EPSG:9094
    "IInch": 0.02540000000000000000 / OpenLayers.METERS_PER_INCH,
    "MicroInch": 0.00002540000000000000 / OpenLayers.METERS_PER_INCH,
    "Mil": 0.00000002540000000000 / OpenLayers.METERS_PER_INCH,
    "Centimeter": 0.01000000000000000000 / OpenLayers.METERS_PER_INCH,
    "Kilometer": 1000.00000000000000000000 / OpenLayers.METERS_PER_INCH,   //EPSG:9036
    "Yard": 0.91440182880365760731 / OpenLayers.METERS_PER_INCH,
    "SearsYard": 0.914398414616029 / OpenLayers.METERS_PER_INCH,   //EPSG:9040
    "IndianYard": 0.91439853074444079983 / OpenLayers.METERS_PER_INCH,   //EPSG:9084
    "IndianYd37": 0.91439523 / OpenLayers.METERS_PER_INCH,   //EPSG:9085
    "IndianYd62": 0.9143988 / OpenLayers.METERS_PER_INCH,   //EPSG:9086
    "IndianYd75": 0.9143985 / OpenLayers.METERS_PER_INCH,   //EPSG:9087
    "IndianFoot": 0.30479951 / OpenLayers.METERS_PER_INCH,   //EPSG:9080
    "IndianFt37": 0.30479841 / OpenLayers.METERS_PER_INCH,   //EPSG:9081
    "IndianFt62": 0.3047996 / OpenLayers.METERS_PER_INCH,   //EPSG:9082
    "IndianFt75": 0.3047995 / OpenLayers.METERS_PER_INCH,   //EPSG:9083
    "Mile": 1609.34721869443738887477 / OpenLayers.METERS_PER_INCH,
    "IYard": 0.91440000000000000000 / OpenLayers.METERS_PER_INCH,   //EPSG:9096
    "IMile": 1609.34400000000000000000 / OpenLayers.METERS_PER_INCH,   //EPSG:9093
    "NautM": 1852.00000000000000000000 / OpenLayers.METERS_PER_INCH,   //EPSG:9030
    "Lat-66": 110943.316488932731 / OpenLayers.METERS_PER_INCH,
    "Lat-83": 110946.25736872234125 / OpenLayers.METERS_PER_INCH,
    "Decimeter": 0.10000000000000000000 / OpenLayers.METERS_PER_INCH,
    "Millimeter": 0.00100000000000000000 / OpenLayers.METERS_PER_INCH,
    "Dekameter": 10.00000000000000000000 / OpenLayers.METERS_PER_INCH,
    "Decameter": 10.00000000000000000000 / OpenLayers.METERS_PER_INCH,
    "Hectometer": 100.00000000000000000000 / OpenLayers.METERS_PER_INCH,
    "GermanMeter": 1.0000135965 / OpenLayers.METERS_PER_INCH,   //EPSG:9031
    "CaGrid": 0.999738 / OpenLayers.METERS_PER_INCH,
    "ClarkeChain": 20.1166194976 / OpenLayers.METERS_PER_INCH,   //EPSG:9038
    "GunterChain": 20.11684023368047 / OpenLayers.METERS_PER_INCH,   //EPSG:9033
    "BenoitChain": 20.116782494375872 / OpenLayers.METERS_PER_INCH,   //EPSG:9062
    "SearsChain": 20.11676512155 / OpenLayers.METERS_PER_INCH,   //EPSG:9042
    "ClarkeLink": 0.201166194976 / OpenLayers.METERS_PER_INCH,   //EPSG:9039
    "GunterLink": 0.2011684023368047 / OpenLayers.METERS_PER_INCH,   //EPSG:9034
    "BenoitLink": 0.20116782494375872 / OpenLayers.METERS_PER_INCH,   //EPSG:9063
    "SearsLink": 0.2011676512155 / OpenLayers.METERS_PER_INCH,   //EPSG:9043
    "Rod": 5.02921005842012 / OpenLayers.METERS_PER_INCH,
    "IntnlChain": 20.1168 / OpenLayers.METERS_PER_INCH,   //EPSG:9097
    "IntnlLink": 0.201168 / OpenLayers.METERS_PER_INCH,   //EPSG:9098
    "Perch": 5.02921005842012 / OpenLayers.METERS_PER_INCH,
    "Pole": 5.02921005842012 / OpenLayers.METERS_PER_INCH,
    "Furlong": 201.1684023368046 / OpenLayers.METERS_PER_INCH,
    "Rood": 3.778266898 / OpenLayers.METERS_PER_INCH,
    "CapeFoot": 0.3047972615 / OpenLayers.METERS_PER_INCH,
    "Brealey": 375.00000000000000000000 / OpenLayers.METERS_PER_INCH,
    "ModAmFt": 0.304812252984505969011938 / OpenLayers.METERS_PER_INCH,
    "Fathom": 1.8288 / OpenLayers.METERS_PER_INCH,
    "NautM-UK": 1853.184 / OpenLayers.METERS_PER_INCH,
    "50kilometers": 50000.0 / OpenLayers.METERS_PER_INCH,
    "150kilometers": 150000.0 / OpenLayers.METERS_PER_INCH
});

//unit abbreviations supported by PROJ.4
OpenLayers.Util.extend(OpenLayers.INCHES_PER_UNIT, {
    "mm": OpenLayers.INCHES_PER_UNIT["Meter"] / 1000.0,
    "cm": OpenLayers.INCHES_PER_UNIT["Meter"] / 100.0,
    "dm": OpenLayers.INCHES_PER_UNIT["Meter"] * 100.0,
    "km": OpenLayers.INCHES_PER_UNIT["Meter"] * 1000.0,
    "kmi": OpenLayers.INCHES_PER_UNIT["nmi"],    //International Nautical Mile
    "fath": OpenLayers.INCHES_PER_UNIT["Fathom"], //International Fathom
    "ch": OpenLayers.INCHES_PER_UNIT["IntnlChain"],  //International Chain
    "link": OpenLayers.INCHES_PER_UNIT["IntnlLink"], //International Link
    "us-in": OpenLayers.INCHES_PER_UNIT["inches"], //U.S. Surveyor's Inch
    "us-ft": OpenLayers.INCHES_PER_UNIT["Foot"],	//U.S. Surveyor's Foot
    "us-yd": OpenLayers.INCHES_PER_UNIT["Yard"],	//U.S. Surveyor's Yard
    "us-ch": OpenLayers.INCHES_PER_UNIT["GunterChain"], //U.S. Surveyor's Chain
    "us-mi": OpenLayers.INCHES_PER_UNIT["Mile"],   //U.S. Surveyor's Statute Mile
    "ind-yd": OpenLayers.INCHES_PER_UNIT["IndianYd37"],  //Indian Yard
    "ind-ft": OpenLayers.INCHES_PER_UNIT["IndianFt37"],  //Indian Foot
    "ind-ch": 20.11669506 / OpenLayers.METERS_PER_INCH  //Indian Chain
});

/** 
 * Constant: DOTS_PER_INCH
 * {Integer} 72 (A sensible default)
 */
OpenLayers.DOTS_PER_INCH = 72;

/**
 * Function: normalizeScale
 * 
 * Parameters:
 * scale - {float}
 * 
 * Returns:
 * {Float} A normalized scale value, in 1 / X format. 
 *         This means that if a value less than one ( already 1/x) is passed
 *         in, it just returns scale directly. Otherwise, it returns 
 *         1 / scale
 */
OpenLayers.Util.normalizeScale = function (scale) {
    var normScale = (scale > 1.0) ? (1.0 / scale) 
                                  : scale;
    return normScale;
};

/**
 * Function: getResolutionFromScale
 * 
 * Parameters:
 * scale - {Float}
 * units - {String} Index into OpenLayers.INCHES_PER_UNIT hashtable.
 *                  Default is degrees
 * 
 * Returns:
 * {Float} The corresponding resolution given passed-in scale and unit 
 *     parameters.  If the given scale is falsey, the returned resolution will
 *     be undefined.
 */
OpenLayers.Util.getResolutionFromScale = function (scale, units) {
    var resolution;
    if (scale) {
        if (units == null) {
            units = "degrees";
        }
        var normScale = OpenLayers.Util.normalizeScale(scale);
        resolution = 1 / (normScale * OpenLayers.INCHES_PER_UNIT[units]
                                        * OpenLayers.DOTS_PER_INCH);        
    }
    return resolution;
};

/**
 * Function: getScaleFromResolution
 * 
 * Parameters:
 * resolution - {Float}
 * units - {String} Index into OpenLayers.INCHES_PER_UNIT hashtable.
 *                  Default is degrees
 * 
 * Returns:
 * {Float} The corresponding scale given passed-in resolution and unit 
 *         parameters.
 */
OpenLayers.Util.getScaleFromResolution = function (resolution, units) {

    if (units == null) {
        units = "degrees";
    }

    var scale = resolution * OpenLayers.INCHES_PER_UNIT[units] *
                    OpenLayers.DOTS_PER_INCH;
    return scale;
};

/**
 * Function: pagePosition
 * Calculates the position of an element on the page (see
 * http://code.google.com/p/doctype/wiki/ArticlePageOffset)
 *
 * OpenLayers.Util.pagePosition is based on Yahoo's getXY method, which is
 * Copyright (c) 2006, Yahoo! Inc.
 * All rights reserved.
 * 
 * Redistribution and use of this software in source and binary forms, with or
 * without modification, are permitted provided that the following conditions
 * are met:
 * 
 * * Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 * 
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 * 
 * * Neither the name of Yahoo! Inc. nor the names of its contributors may be
 *   used to endorse or promote products derived from this software without
 *   specific prior written permission of Yahoo! Inc.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
 * POSSIBILITY OF SUCH DAMAGE.
 *
 * Parameters:
 * forElement - {DOMElement}
 * 
 * Returns:
 * {Array} two item array, Left value then Top value.
 */
OpenLayers.Util.pagePosition =  function(forElement) {
    // NOTE: If element is hidden (display none or disconnected or any the
    // ancestors are hidden) we get (0,0) by default but we still do the
    // accumulation of scroll position.

    var pos = [0, 0];
    var viewportElement = OpenLayers.Util.getViewportElement();
    if (!forElement || forElement == window || forElement == viewportElement) {
        // viewport is always at 0,0 as that defined the coordinate system for
        // this function - this avoids special case checks in the code below
        return pos;
    }

    // Gecko browsers normally use getBoxObjectFor to calculate the position.
    // When invoked for an element with an implicit absolute position though it
    // can be off by one. Therefore the recursive implementation is used in
    // those (relatively rare) cases.
    var BUGGY_GECKO_BOX_OBJECT =
        OpenLayers.IS_GECKO && document.getBoxObjectFor &&
        OpenLayers.Element.getStyle(forElement, 'position') == 'absolute' &&
        (forElement.style.top == '' || forElement.style.left == '');

    var parent = null;
    var box;

    if (forElement.getBoundingClientRect) { // IE
        box = forElement.getBoundingClientRect();
        var scrollTop = viewportElement.scrollTop;
        var scrollLeft = viewportElement.scrollLeft;

        pos[0] = box.left + scrollLeft;
        pos[1] = box.top + scrollTop;

    } else if (document.getBoxObjectFor && !BUGGY_GECKO_BOX_OBJECT) { // gecko
        // Gecko ignores the scroll values for ancestors, up to 1.9.  See:
        // https://bugzilla.mozilla.org/show_bug.cgi?id=328881 and
        // https://bugzilla.mozilla.org/show_bug.cgi?id=330619

        box = document.getBoxObjectFor(forElement);
        var vpBox = document.getBoxObjectFor(viewportElement);
        pos[0] = box.screenX - vpBox.screenX;
        pos[1] = box.screenY - vpBox.screenY;

    } else { // safari/opera
        pos[0] = forElement.offsetLeft;
        pos[1] = forElement.offsetTop;
        parent = forElement.offsetParent;
        if (parent != forElement) {
            while (parent) {
                pos[0] += parent.offsetLeft;
                pos[1] += parent.offsetTop;
                parent = parent.offsetParent;
            }
        }

        var browser = OpenLayers.BROWSER_NAME;

        // opera & (safari absolute) incorrectly account for body offsetTop
        if (browser == "opera" || (browser == "safari" &&
              OpenLayers.Element.getStyle(forElement, 'position') == 'absolute')) {
            pos[1] -= document.body.offsetTop;
        }

        // accumulate the scroll positions for everything but the body element
        parent = forElement.offsetParent;
        while (parent && parent != document.body) {
            pos[0] -= parent.scrollLeft;
            // see https://bugs.opera.com/show_bug.cgi?id=249965
            if (browser != "opera" || parent.tagName != 'TR') {
                pos[1] -= parent.scrollTop;
            }
            parent = parent.offsetParent;
        }
    }
    
    return pos;
};

/**
 * Function: getViewportElement
 * Returns die viewport element of the document. The viewport element is
 * usually document.documentElement, except in IE,where it is either
 * document.body or document.documentElement, depending on the document's
 * compatibility mode (see
 * http://code.google.com/p/doctype/wiki/ArticleClientViewportElement)
 */
OpenLayers.Util.getViewportElement = function() {
    var viewportElement = arguments.callee.viewportElement;
    if (viewportElement == undefined) {
        viewportElement = (OpenLayers.BROWSER_NAME == "msie" &&
            document.compatMode != 'CSS1Compat') ? document.body :
            document.documentElement;
        arguments.callee.viewportElement = viewportElement;
    }
    return viewportElement;
};

/** 
 * Function: isEquivalentUrl
 * Test two URLs for equivalence. 
 * 
 * Setting 'ignoreCase' allows for case-independent comparison.
 * 
 * Comparison is based on: 
 *  - Protocol
 *  - Host (evaluated without the port)
 *  - Port (set 'ignorePort80' to ignore "80" values)
 *  - Hash ( set 'ignoreHash' to disable)
 *  - Pathname (for relative <-> absolute comparison) 
 *  - Arguments (so they can be out of order)
 *  
 * Parameters:
 * url1 - {String}
 * url2 - {String}
 * options - {Object} Allows for customization of comparison:
 *                    'ignoreCase' - Default is True
 *                    'ignorePort80' - Default is True
 *                    'ignoreHash' - Default is True
 *
 * Returns:
 * {Boolean} Whether or not the two URLs are equivalent
 */
OpenLayers.Util.isEquivalentUrl = function(url1, url2, options) {
    options = options || {};

    OpenLayers.Util.applyDefaults(options, {
        ignoreCase: true,
        ignorePort80: true,
        ignoreHash: true
    });

    var urlObj1 = OpenLayers.Util.createUrlObject(url1, options);
    var urlObj2 = OpenLayers.Util.createUrlObject(url2, options);

    //compare all keys except for "args" (treated below)
    for(var key in urlObj1) {
        if(key !== "args") {
            if(urlObj1[key] != urlObj2[key]) {
                return false;
            }
        }
    }

    // compare search args - irrespective of order
    for(var key in urlObj1.args) {
        if(urlObj1.args[key] != urlObj2.args[key]) {
            return false;
        }
        delete urlObj2.args[key];
    }
    // urlObj2 shouldn't have any args left
    for(var key in urlObj2.args) {
        return false;
    }
    
    return true;
};

/**
 * Function: createUrlObject
 * 
 * Parameters:
 * url - {String}
 * options - {Object} A hash of options.
 *
 * Valid options:
 *   ignoreCase - {Boolean} lowercase url,
 *   ignorePort80 - {Boolean} don't include explicit port if port is 80,
 *   ignoreHash - {Boolean} Don't include part of url after the hash (#).
 * 
 * Returns:
 * {Object} An object with separate url, a, port, host, and args parsed out 
 *          and ready for comparison
 */
OpenLayers.Util.createUrlObject = function(url, options) {
    options = options || {};

    // deal with relative urls first
    if(!(/^\w+:\/\//).test(url)) {
        var loc = window.location;
        var port = loc.port ? ":" + loc.port : "";
        var fullUrl = loc.protocol + "//" + loc.host.split(":").shift() + port;
        if(url.indexOf("/") === 0) {
            // full pathname
            url = fullUrl + url;
        } else {
            // relative to current path
            var parts = loc.pathname.split("/");
            parts.pop();
            url = fullUrl + parts.join("/") + "/" + url;
        }
    }
  
    if (options.ignoreCase) {
        url = url.toLowerCase(); 
    }

    var a = document.createElement('a');
    a.href = url;
    
    var urlObject = {};
    
    //host (without port)
    urlObject.host = a.host.split(":").shift();

    //protocol
    urlObject.protocol = a.protocol;  

    //port (get uniform browser behavior with port 80 here)
    if(options.ignorePort80) {
        urlObject.port = (a.port == "80" || a.port == "0") ? "" : a.port;
    } else {
        urlObject.port = (a.port == "" || a.port == "0") ? "80" : a.port;
    }

    //hash
    urlObject.hash = (options.ignoreHash || a.hash === "#") ? "" : a.hash;  
    
    //args
    var queryString = a.search;
    if (!queryString) {
        var qMark = url.indexOf("?");
        queryString = (qMark != -1) ? url.substr(qMark) : "";
    }
    urlObject.args = OpenLayers.Util.getParameters(queryString);

    // pathname
    //
    // This is a workaround for Internet Explorer where
    // window.location.pathname has a leading "/", but
    // a.pathname has no leading "/".
    urlObject.pathname = (a.pathname.charAt(0) == "/") ? a.pathname : "/" + a.pathname;
    
    return urlObject; 
};
 
/**
 * Function: removeTail
 * Takes a url and removes everything after the ? and #
 * 
 * Parameters:
 * url - {String} The url to process
 * 
 * Returns:
 * {String} The string with all queryString and Hash removed
 */
OpenLayers.Util.removeTail = function(url) {
    var head = null;
    
    var qMark = url.indexOf("?");
    var hashMark = url.indexOf("#");

    if (qMark == -1) {
        head = (hashMark != -1) ? url.substr(0,hashMark) : url;
    } else {
        head = (hashMark != -1) ? url.substr(0,Math.min(qMark, hashMark)) 
                                  : url.substr(0, qMark);
    }
    return head;
};

/**
 * Constant: IS_GECKO
 * {Boolean} True if the userAgent reports the browser to use the Gecko engine
 */
OpenLayers.IS_GECKO = (function() {
    var ua = navigator.userAgent.toLowerCase();
    return ua.indexOf("webkit") == -1 && ua.indexOf("gecko") != -1;
})();

/**
 * Constant: BROWSER_NAME
 * {String}
 * A substring of the navigator.userAgent property.  Depending on the userAgent
 *     property, this will be the empty string or one of the following:
 *     * "opera" -- Opera
 *     * "msie"  -- Internet Explorer
 *     * "safari" -- Safari
 *     * "firefox" -- Firefox
 *     * "mozilla" -- Mozilla
 */
OpenLayers.BROWSER_NAME = (function() {
    var name = "";
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("opera") != -1) {
        name = "opera";
    } else if (ua.indexOf("msie") != -1) {
        name = "msie";
    } else if (ua.indexOf("safari") != -1) {
        name = "safari";
    } else if (ua.indexOf("mozilla") != -1) {
        if (ua.indexOf("firefox") != -1) {
            name = "firefox";
        } else {
            name = "mozilla";
        }
    }
    return name;
})();

/**
 * Function: getBrowserName
 * 
 * Returns:
 * {String} A string which specifies which is the current 
 *          browser in which we are running. 
 * 
 *          Currently-supported browser detection and codes:
 *           * 'opera' -- Opera
 *           * 'msie'  -- Internet Explorer
 *           * 'safari' -- Safari
 *           * 'firefox' -- Firefox
 *           * 'mozilla' -- Mozilla
 * 
 *          If we are unable to property identify the browser, we 
 *           return an empty string.
 */
OpenLayers.Util.getBrowserName = function() {
    return OpenLayers.BROWSER_NAME;
};

/**
 * Method: getRenderedDimensions
 * Renders the contentHTML offscreen to determine actual dimensions for
 *     popup sizing. As we need layout to determine dimensions the content
 *     is rendered -9999px to the left and absolute to ensure the 
 *     scrollbars do not flicker
 *     
 * Parameters:
 * contentHTML
 * size - {<OpenLayers.Size>} If either the 'w' or 'h' properties is 
 *     specified, we fix that dimension of the div to be measured. This is 
 *     useful in the case where we have a limit in one dimension and must 
 *     therefore meaure the flow in the other dimension.
 * options - {Object}
 *
 * Allowed Options:
 *     displayClass - {String} Optional parameter.  A CSS class name(s) string
 *         to provide the CSS context of the rendered content.
 *     containerElement - {DOMElement} Optional parameter. Insert the HTML to 
 *         this node instead of the body root when calculating dimensions. 
 * 
 * Returns:
 * {<OpenLayers.Size>}
 */
OpenLayers.Util.getRenderedDimensions = function(contentHTML, size, options) {
    
    var w, h;
    
    // create temp container div with restricted size
    var container = document.createElement("div");
    container.style.visibility = "hidden";
        
    var containerElement = (options && options.containerElement) 
    	? options.containerElement : document.body;

    //fix a dimension, if specified.
    if (size) {
        if (size.w) {
            w = size.w;
            container.style.width = w + "px";
        } else if (size.h) {
            h = size.h;
            container.style.height = h + "px";
        }
    }

    //add css classes, if specified
    if (options && options.displayClass) {
        container.className = options.displayClass;
    }
    
    // create temp content div and assign content
    var content = document.createElement("div");
    content.innerHTML = contentHTML;
    
    // we need overflow visible when calculating the size
    content.style.overflow = "visible";
    if (content.childNodes) {
        for (var i=0, l=content.childNodes.length; i<l; i++) {
            if (!content.childNodes[i].style) continue;
            content.childNodes[i].style.overflow = "visible";
        }
    }
    
    // add content to restricted container 
    container.appendChild(content);
    
    // append container to body for rendering
    containerElement.appendChild(container);
    
    // Opera and IE7 can't handle a node with position:aboslute if it inherits
    // position:absolute from a parent.
    var parentHasPositionAbsolute = false;
    var parent = container.parentNode;
    while (parent && parent.tagName.toLowerCase()!="body") {
        var parentPosition = OpenLayers.Element.getStyle(parent, "position");
        if(parentPosition == "absolute") {
            parentHasPositionAbsolute = true;
            break;
        } else if (parentPosition && parentPosition != "static") {
            break;
        }
        parent = parent.parentNode;
    }

    if(!parentHasPositionAbsolute) {
        container.style.position = "absolute";
    }
    
    // calculate scroll width of content and add corners and shadow width
    if (!w) {
        w = parseInt(content.scrollWidth);
    
        // update container width to allow height to adjust
        container.style.width = w + "px";
    }        
    // capture height and add shadow and corner image widths
    if (!h) {
        h = parseInt(content.scrollHeight);
    }

    // remove elements
    container.removeChild(content);
    containerElement.removeChild(container);
    
    return new OpenLayers.Size(w, h);
};

/**
 * APIFunction: getScrollbarWidth
 * This function has been modified by the OpenLayers from the original version,
 *     written by Matthew Eernisse and released under the Apache 2 
 *     license here:
 * 
 *     http://www.fleegix.org/articles/2006/05/30/getting-the-scrollbar-width-in-pixels
 * 
 *     It has been modified simply to cache its value, since it is physically 
 *     impossible that this code could ever run in more than one browser at 
 *     once. 
 * 
 * Returns:
 * {Integer}
 */
OpenLayers.Util.getScrollbarWidth = function() {
    
    var scrollbarWidth = OpenLayers.Util._scrollbarWidth;
    
    if (scrollbarWidth == null) {
        var scr = null;
        var inn = null;
        var wNoScroll = 0;
        var wScroll = 0;
    
        // Outer scrolling div
        scr = document.createElement('div');
        scr.style.position = 'absolute';
        scr.style.top = '-1000px';
        scr.style.left = '-1000px';
        scr.style.width = '100px';
        scr.style.height = '50px';
        // Start with no scrollbar
        scr.style.overflow = 'hidden';
    
        // Inner content div
        inn = document.createElement('div');
        inn.style.width = '100%';
        inn.style.height = '200px';
    
        // Put the inner div in the scrolling div
        scr.appendChild(inn);
        // Append the scrolling div to the doc
        document.body.appendChild(scr);
    
        // Width of the inner div sans scrollbar
        wNoScroll = inn.offsetWidth;
    
        // Add the scrollbar
        scr.style.overflow = 'scroll';
        // Width of the inner div width scrollbar
        wScroll = inn.offsetWidth;
    
        // Remove the scrolling div from the doc
        document.body.removeChild(document.body.lastChild);
    
        // Pixel width of the scroller
        OpenLayers.Util._scrollbarWidth = (wNoScroll - wScroll);
        scrollbarWidth = OpenLayers.Util._scrollbarWidth;
    }

    return scrollbarWidth;
};

/**
 * APIFunction: getFormattedLonLat
 * This function will return latitude or longitude value formatted as 
 *
 * Parameters:
 * coordinate - {Float} the coordinate value to be formatted
 * axis - {String} value of either 'lat' or 'lon' to indicate which axis is to
 *          to be formatted (default = lat)
 * dmsOption - {String} specify the precision of the output can be one of:
 *           'dms' show degrees minutes and seconds
 *           'dm' show only degrees and minutes
 *           'd' show only degrees
 * 
 * Returns:
 * {String} the coordinate value formatted as a string
 */
OpenLayers.Util.getFormattedLonLat = function(coordinate, axis, dmsOption) {
    if (!dmsOption) {
        dmsOption = 'dms';    //default to show degree, minutes, seconds
    }
	
	coordinate = (coordinate+540)%360 - 180; // normalize for sphere being round
	
    var abscoordinate = Math.abs(coordinate);
    var coordinatedegrees = Math.floor(abscoordinate);

    var coordinateminutes = (abscoordinate - coordinatedegrees)/(1/60);
    var tempcoordinateminutes = coordinateminutes;
    coordinateminutes = Math.floor(coordinateminutes);
    var coordinateseconds = (tempcoordinateminutes - coordinateminutes)/(1/60);
    coordinateseconds =  Math.round(coordinateseconds*10);
    coordinateseconds /= 10;

    if( coordinateseconds >= 60) { 
        coordinateseconds -= 60; 
        coordinateminutes += 1; 
        if( coordinateminutes >= 60) { 
            coordinateminutes -= 60; 
            coordinatedegrees += 1; 
        } 
    }
    
    if( coordinatedegrees < 10 ) {
        coordinatedegrees = "0" + coordinatedegrees;
    }
    var str = coordinatedegrees + "\u00B0";

    if (dmsOption.indexOf('dm') >= 0) {
        if( coordinateminutes < 10 ) {
            coordinateminutes = "0" + coordinateminutes;
        }
        str += coordinateminutes + "'";
  
        if (dmsOption.indexOf('dms') >= 0) {
            if( coordinateseconds < 10 ) {
                coordinateseconds = "0" + coordinateseconds;
            }
            str += coordinateseconds + '"';
        }
    }
    
    if (axis == "lon") {
        str += coordinate < 0 ? OpenLayers.i18n("W") : OpenLayers.i18n("E");
    } else {
        str += coordinate < 0 ? OpenLayers.i18n("S") : OpenLayers.i18n("N");
    }
    return str;
};

/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */


/**
 * @requires OpenLayers/Control.js
 */

/**
 * Class: OpenLayers.Control.MousePosition
 * The MousePosition control displays geographic coordinates of the mouse
 * pointer, as it is moved about the map.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.MousePosition = OpenLayers.Class(OpenLayers.Control, {
    
    /**
     * APIProperty: autoActivate
     * {Boolean} Activate the control when it is added to a map.  Default is
     *     true.
     */
    autoActivate: true,

    /** 
     * Property: element
     * {DOMElement} 
     */
    element: null,
    
    /** 
     * APIProperty: prefix
     * {String}
     */
    prefix: '',
    
    /** 
     * APIProperty: separator
     * {String}
     */
    separator: ', ',
    
    /** 
     * APIProperty: suffix
     * {String}
     */
    suffix: '',
    
    /** 
     * APIProperty: numDigits
     * {Integer}
     */
    numDigits: 5,
    
    /** 
     * APIProperty: granularity
     * {Integer} 
     */
    granularity: 10,

    /**
     * APIProperty: emptyString 
     * {String} Set this to some value to set when the mouse is outside the
     *     map.
     */
    emptyString: null,
    
    /** 
     * Property: lastXy
     * {<OpenLayers.Pixel>}
     */
    lastXy: null,

    /**
     * APIProperty: displayProjection
     * {<OpenLayers.Projection>} The projection in which the 
     * mouse position is displayed
     */
    displayProjection: null, 
    
    /**
     * Constructor: OpenLayers.Control.MousePosition
     * 
     * Parameters:
     * options - {Object} Options for control.
     */

    /**
     * Method: destroy
     */
     destroy: function() {
         this.deactivate();
         OpenLayers.Control.prototype.destroy.apply(this, arguments);
     },

    /**
     * APIMethod: activate
     */
    activate: function() {
        if (OpenLayers.Control.prototype.activate.apply(this, arguments)) {
            this.map.events.register('mousemove', this, this.redraw);
            this.map.events.register('mouseout', this, this.reset);
            this.redraw();
            return true;
        } else {
            return false;
        }
    },
    
    /**
     * APIMethod: deactivate
     */
    deactivate: function() {
        if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
            this.map.events.unregister('mousemove', this, this.redraw);
            this.map.events.unregister('mouseout', this, this.reset);
            this.element.innerHTML = "";
            return true;
        } else {
            return false;
        }
    },

    /**
     * Method: draw
     * {DOMElement}
     */    
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this, arguments);

        if (!this.element) {
            this.div.left = "";
            this.div.top = "";
            this.element = this.div;
        }
        
        return this.div;
    },
   
    /**
     * Method: redraw  
     */
    redraw: function(evt) {

        var lonLat;

        if (evt == null) {
            this.reset();
            return;
        } else {
            if (this.lastXy == null ||
                Math.abs(evt.xy.x - this.lastXy.x) > this.granularity ||
                Math.abs(evt.xy.y - this.lastXy.y) > this.granularity)
            {
                this.lastXy = evt.xy;
                return;
            }

            lonLat = this.map.getLonLatFromPixel(evt.xy);
            if (!lonLat) { 
                // map has not yet been properly initialized
                return;
            }    
            if (this.displayProjection) {
                lonLat.transform(this.map.getProjectionObject(), 
                                 this.displayProjection );
            }      
            this.lastXy = evt.xy;
            
        }
        
        var newHtml = this.formatOutput(lonLat);

        if (newHtml != this.element.innerHTML) {
            this.element.innerHTML = newHtml;
        }
    },

    /**
     * Method: reset
     */
    reset: function(evt) {
        if (this.emptyString != null) {
            this.element.innerHTML = this.emptyString;
        }
    },

    /**
     * Method: formatOutput
     * Override to provide custom display output
     *
     * Parameters:
     * lonLat - {<OpenLayers.LonLat>} Location to display
     */
    formatOutput: function(lonLat) {
        var digits = parseInt(this.numDigits);
        var newHtml =
            this.prefix +
            lonLat.lon.toFixed(digits) +
            this.separator + 
            lonLat.lat.toFixed(digits) +
            this.suffix;
        return newHtml;
    },

    CLASS_NAME: "OpenLayers.Control.MousePosition"
});
/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */


/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Feature/Vector.js
 */

/**
 * Class: OpenLayers.Control.DrawFeature
 * The DrawFeature control draws point, line or polygon features on a vector
 * layer when active.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.DrawFeature = OpenLayers.Class(OpenLayers.Control, {
    
    /**
     * Property: layer
     * {<OpenLayers.Layer.Vector>}
     */
    layer: null,

    /**
     * Property: callbacks
     * {Object} The functions that are sent to the handler for callback
     */
    callbacks: null,
    
    /**
     * Supported event types:
     * featureadded - Triggered when a feature is added
     */
    
    /**
     * APIProperty: multi
     * {Boolean} Cast features to multi-part geometries before passing to the
     *     layer.  Default is false.
     */
    multi: false,

    /**
     * APIProperty: featureAdded
     * {Function} Called after each feature is added
     */
    featureAdded: function() {},

    /**
     * APIProperty: handlerOptions
     * {Object} Used to set non-default properties on the control's handler
     */
    handlerOptions: null,
    
    /**
     * Constructor: OpenLayers.Control.DrawFeature
     * 
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} 
     * handler - {<OpenLayers.Handler>} 
     * options - {Object} 
     */
    initialize: function(layer, handler, options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.callbacks = OpenLayers.Util.extend(
            {
                done: this.drawFeature,
                modify: function(vertex, feature) {
                    this.layer.events.triggerEvent(
                        "sketchmodified", {vertex: vertex, feature: feature}
                    );
                },
                create: function(vertex, feature) {
                    this.layer.events.triggerEvent(
                        "sketchstarted", {vertex: vertex, feature: feature}
                    );
                }
            },
            this.callbacks
        );
        this.layer = layer;
        this.handlerOptions = this.handlerOptions || {};
        this.handlerOptions.layerOptions = OpenLayers.Util.applyDefaults(
            this.handlerOptions.layerOptions, {
                renderers: layer.renderers, rendererOptions: layer.rendererOptions
            }
        );
        if (!("multi" in this.handlerOptions)) {
            this.handlerOptions.multi = this.multi;
        }
        var sketchStyle = this.layer.styleMap && this.layer.styleMap.styles.temporary;
        if(sketchStyle) {
            this.handlerOptions.layerOptions = OpenLayers.Util.applyDefaults(
                this.handlerOptions.layerOptions,
                {styleMap: new OpenLayers.StyleMap({"default": sketchStyle})}
            );
        }
        this.handler = new handler(this, this.callbacks, this.handlerOptions);
    },

    /**
     * Method: drawFeature
     */
    drawFeature: function(geometry) {
        var feature = new OpenLayers.Feature.Vector(geometry);
        var proceed = this.layer.events.triggerEvent(
            "sketchcomplete", {feature: feature}
        );
        if(proceed !== false) {
            feature.state = OpenLayers.State.INSERT;
            this.layer.addFeatures([feature]);
            this.featureAdded(feature);
            this.events.triggerEvent("featureadded",{feature : feature});
        }
    },
    
    /**
     * APIMethod: insertXY
     * Insert a point in the current sketch given x & y coordinates.
     *
     * Parameters:
     * x - {Number} The x-coordinate of the point.
     * y - {Number} The y-coordinate of the point.
     */
    insertXY: function(x, y) {
        if (this.handler && this.handler.line) {
            this.handler.insertXY(x, y);
        }
    },

    /**
     * APIMethod: insertDeltaXY
     * Insert a point given offsets from the previously inserted point.
     *
     * Parameters:
     * dx - {Number} The x-coordinate offset of the point.
     * dy - {Number} The y-coordinate offset of the point.
     */
    insertDeltaXY: function(dx, dy) {
        if (this.handler && this.handler.line) {
            this.handler.insertDeltaXY(dx, dy);
        }
    },

    /**
     * APIMethod: insertDirectionLength
     * Insert a point in the current sketch given a direction and a length.
     *
     * Parameters:
     * direction - {Number} Degrees clockwise from the positive x-axis.
     * length - {Number} Distance from the previously drawn point.
     */
    insertDirectionLength: function(direction, length) {
        if (this.handler && this.handler.line) {
            this.handler.insertDirectionLength(direction, length);
        }
    },

    /**
     * APIMethod: insertDeflectionLength
     * Insert a point in the current sketch given a deflection and a length.
     *     The deflection should be degrees clockwise from the previously 
     *     digitized segment.
     *
     * Parameters:
     * deflection - {Number} Degrees clockwise from the previous segment.
     * length - {Number} Distance from the previously drawn point.
     */
    insertDeflectionLength: function(deflection, length) {
        if (this.handler && this.handler.line) {
            this.handler.insertDeflectionLength(deflection, length);
        }
    },
    
    /**
     * APIMethod: undo
     * Remove the most recently added point in the current sketch geometry.
     *
     * Returns: 
     * {Boolean} An edit was undone.
     */
    undo: function() {
        return this.handler.undo && this.handler.undo();
    },
    
    /**
     * APIMethod: redo
     * Reinsert the most recently removed point resulting from an <undo> call.
     *     The undo stack is deleted whenever a point is added by other means.
     *
     * Returns: 
     * {Boolean} An edit was redone.
     */
    redo: function() {
        return this.handler.redo && this.handler.redo();
    },
    
    /**
     * APIMethod: finishSketch
     * Finishes the sketch without including the currently drawn point.
     *     This method can be called to terminate drawing programmatically
     *     instead of waiting for the user to end the sketch.
     */
    finishSketch: function() {
        this.handler.finishGeometry();
    },

    /**
     * APIMethod: cancel
     * Cancel the current sketch.  This removes the current sketch and keeps
     *     the drawing control active.
     */
    cancel: function() {
        this.handler.cancel();
    },

    CLASS_NAME: "OpenLayers.Control.DrawFeature"
});
/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */


/**
 * @requires OpenLayers/Handler/Drag.js
 */

/**
 * Class: OpenLayers.Handler.RegularPolygon
 * Handler to draw a regular polygon on the map.  Polygon is displayed on mouse
 *     down, moves or is modified on mouse move, and is finished on mouse up.
 *     The handler triggers callbacks for 'done' and 'cancel'.  Create a new
 *     instance with the <OpenLayers.Handler.RegularPolygon> constructor.
 * 
 * Inherits from:
 *  - <OpenLayers.Handler.Drag>
 */
OpenLayers.Handler.RegularPolygon = OpenLayers.Class(OpenLayers.Handler.Drag, {
    
    /**
     * APIProperty: sides
     * {Integer} Number of sides for the regular polygon.  Needs to be greater
     *     than 2.  Defaults to 4.
     */
    sides: 4,

    /**
     * APIProperty: radius
     * {Float} Optional radius in map units of the regular polygon.  If this is
     *     set to some non-zero value, a polygon with a fixed radius will be
     *     drawn and dragged with mose movements.  If this property is not
     *     set, dragging changes the radius of the polygon.  Set to null by
     *     default.
     */
    radius: null,
    
    /**
     * APIProperty: snapAngle
     * {Float} If set to a non-zero value, the handler will snap the polygon
     *     rotation to multiples of the snapAngle.  Value is an angle measured
     *     in degrees counterclockwise from the positive x-axis.  
     */
    snapAngle: null,
    
    /**
     * APIProperty: snapToggle
     * {String} If set, snapToggle is checked on mouse events and will set
     *     the snap mode to the opposite of what it currently is.  To disallow
     *     toggling between snap and non-snap mode, set freehandToggle to
     *     null.  Acceptable toggle values are 'shiftKey', 'ctrlKey', and
     *     'altKey'. Snap mode is only possible if this.snapAngle is set to a
     *     non-zero value.
     */
    snapToggle: 'shiftKey',
    
    /**
     * Property: layerOptions
     * {Object} Any optional properties to be set on the sketch layer.
     */
    layerOptions: null,

    /**
     * APIProperty: persist
     * {Boolean} Leave the feature rendered until clear is called.  Default
     *     is false.  If set to true, the feature remains rendered until
     *     clear is called, typically by deactivating the handler or starting
     *     another drawing.
     */
    persist: false,

    /**
     * APIProperty: irregular
     * {Boolean} Draw an irregular polygon instead of a regular polygon.
     *     Default is false.  If true, the initial mouse down will represent
     *     one corner of the polygon bounds and with each mouse movement, the
     *     polygon will be stretched so the opposite corner of its bounds
     *     follows the mouse position.  This property takes precedence over
     *     the radius property.  If set to true, the radius property will
     *     be ignored.
     */
    irregular: false,

    /**
     * APIProperty: citeCompliant
     * {Boolean} If set to true, coordinates of features drawn in a map extent
     * crossing the date line won't exceed the world bounds. Default is false.
     */
    citeCompliant: false,

    /**
     * Property: angle
     * {Float} The angle from the origin (mouse down) to the current mouse
     *     position, in radians.  This is measured counterclockwise from the
     *     positive x-axis.
     */
    angle: null,

    /**
     * Property: fixedRadius
     * {Boolean} The polygon has a fixed radius.  True if a radius is set before
     *     drawing begins.  False otherwise.
     */
    fixedRadius: false,

    /**
     * Property: feature
     * {<OpenLayers.Feature.Vector>} The currently drawn polygon feature
     */
    feature: null,

    /**
     * Property: layer
     * {<OpenLayers.Layer.Vector>} The temporary drawing layer
     */
    layer: null,

    /**
     * Property: origin
     * {<OpenLayers.Geometry.Point>} Location of the first mouse down
     */
    origin: null,

    /**
     * Constructor: OpenLayers.Handler.RegularPolygon
     * Create a new regular polygon handler.
     *
     * Parameters:
     * control - {<OpenLayers.Control>} The control that owns this handler
     * callbacks - {Object} An object with a properties whose values are
     *     functions.  Various callbacks described below.
     * options - {Object} An object with properties to be set on the handler.
     *     If the options.sides property is not specified, the number of sides
     *     will default to 4.
     *
     * Named callbacks:
     * create - Called when a sketch is first created.  Callback called with
     *     the creation point geometry and sketch feature.
     * done - Called when the sketch drawing is finished.  The callback will
     *     recieve a single argument, the sketch geometry.
     * cancel - Called when the handler is deactivated while drawing.  The
     *     cancel callback will receive a geometry.
     */
    initialize: function(control, callbacks, options) {
        if(!(options && options.layerOptions && options.layerOptions.styleMap)) {
            this.style = OpenLayers.Util.extend(OpenLayers.Feature.Vector.style['default'], {});
        }

        OpenLayers.Handler.Drag.prototype.initialize.apply(this,
                                                [control, callbacks, options]);
        this.options = (options) ? options : {};
    },
    
    /**
     * APIMethod: setOptions
     * 
     * Parameters:
     * newOptions - {Object} 
     */
    setOptions: function (newOptions) {
        OpenLayers.Util.extend(this.options, newOptions);
        OpenLayers.Util.extend(this, newOptions);
    },
    
    /**
     * APIMethod: activate
     * Turn on the handler.
     *
     * Returns:
     * {Boolean} The handler was successfully activated
     */
    activate: function() {
        var activated = false;
        if(OpenLayers.Handler.Drag.prototype.activate.apply(this, arguments)) {
            // create temporary vector layer for rendering geometry sketch
            var options = OpenLayers.Util.extend({
                displayInLayerSwitcher: false,
                // indicate that the temp vector layer will never be out of range
                // without this, resolution properties must be specified at the
                // map-level for this temporary layer to init its resolutions
                // correctly
                calculateInRange: OpenLayers.Function.True,
                wrapDateLine: this.citeCompliant
            }, this.layerOptions);
            this.layer = new OpenLayers.Layer.Vector(this.CLASS_NAME, options);
            this.map.addLayer(this.layer);
            activated = true;
        }
        return activated;
    },

    /**
     * APIMethod: deactivate
     * Turn off the handler.
     *
     * Returns:
     * {Boolean} The handler was successfully deactivated
     */
    deactivate: function() {
        var deactivated = false;
        if(OpenLayers.Handler.Drag.prototype.deactivate.apply(this, arguments)) {
            // call the cancel callback if mid-drawing
            if(this.dragging) {
                this.cancel();
            }
            // If a layer's map property is set to null, it means that that
            // layer isn't added to the map. Since we ourself added the layer
            // to the map in activate(), we can assume that if this.layer.map
            // is null it means that the layer has been destroyed (as a result
            // of map.destroy() for example.
            if (this.layer.map != null) {
                this.layer.destroy(false);
                if (this.feature) {
                    this.feature.destroy();
                }
            }
            this.layer = null;
            this.feature = null;
            deactivated = true;
        }
        return deactivated;
    },
    
    /**
     * Method: down
     * Start drawing a new feature
     *
     * Parameters:
     * evt - {Event} The drag start event
     */
    down: function(evt) {
        this.fixedRadius = !!(this.radius);
        var maploc = this.layer.getLonLatFromViewPortPx(evt.xy); 
        this.origin = new OpenLayers.Geometry.Point(maploc.lon, maploc.lat);
        // create the new polygon
        if(!this.fixedRadius || this.irregular) {
            // smallest radius should not be less one pixel in map units
            // VML doesn't behave well with smaller
            this.radius = this.map.getResolution();
        }
        if(this.persist) {
            this.clear();
        }
        this.feature = new OpenLayers.Feature.Vector();
        this.createGeometry();
        this.callback("create", [this.origin, this.feature]);
        this.layer.addFeatures([this.feature], {silent: true});
        this.layer.drawFeature(this.feature, this.style);
    },
    
    /**
     * Method: move
     * Respond to drag move events
     *
     * Parameters:
     * evt - {Evt} The move event
     */
    move: function(evt) {
        var maploc = this.layer.getLonLatFromViewPortPx(evt.xy); 
        var point = new OpenLayers.Geometry.Point(maploc.lon, maploc.lat);
        if(this.irregular) {
            var ry = Math.sqrt(2) * Math.abs(point.y - this.origin.y) / 2;
            this.radius = Math.max(this.map.getResolution() / 2, ry);
        } else if(this.fixedRadius) {
            this.origin = point;
        } else {
            this.calculateAngle(point, evt);
            this.radius = Math.max(this.map.getResolution() / 2,
                                   point.distanceTo(this.origin));
        }
        this.modifyGeometry();
        if(this.irregular) {
            var dx = point.x - this.origin.x;
            var dy = point.y - this.origin.y;
            var ratio;
            if(dy == 0) {
                ratio = dx / (this.radius * Math.sqrt(2));
            } else {
                ratio = dx / dy;
            }
            this.feature.geometry.resize(1, this.origin, ratio);
            this.feature.geometry.move(dx / 2, dy / 2);
        }
        this.layer.drawFeature(this.feature, this.style);
    },

    /**
     * Method: up
     * Finish drawing the feature
     *
     * Parameters:
     * evt - {Event} The mouse up event
     */
    up: function(evt) {
        this.finalize();
        // the mouseup method of superclass doesn't call the
        // "done" callback if there's been no move between
        // down and up
        if (this.start == this.last) {
            this.callback("done", [evt.xy]);
        }
    },

    /**
     * Method: out
     * Finish drawing the feature.
     *
     * Parameters:
     * evt - {Event} The mouse out event
     */
    out: function(evt) {
        this.finalize();
    },

    /**
     * Method: createGeometry
     * Create the new polygon geometry.  This is called at the start of the
     *     drag and at any point during the drag if the number of sides
     *     changes.
     */
    createGeometry: function() {
        this.angle = Math.PI * ((1/this.sides) - (1/2));
        if(this.snapAngle) {
            this.angle += this.snapAngle * (Math.PI / 180);
        }
        this.feature.geometry = OpenLayers.Geometry.Polygon.createRegularPolygon(
            this.origin, this.radius, this.sides, this.snapAngle
        );
    },
    
    /**
     * Method: modifyGeometry
     * Modify the polygon geometry in place.
     */
    modifyGeometry: function() {
        var angle, point;
        var ring = this.feature.geometry.components[0];
        // if the number of sides ever changes, create a new geometry
        if(ring.components.length != (this.sides + 1)) {
            this.createGeometry();
            ring = this.feature.geometry.components[0];
        }
        for(var i=0; i<this.sides; ++i) {
            point = ring.components[i];
            angle = this.angle + (i * 2 * Math.PI / this.sides);
            point.x = this.origin.x + (this.radius * Math.cos(angle));
            point.y = this.origin.y + (this.radius * Math.sin(angle));
            point.clearBounds();
        }
    },
    
    /**
     * Method: calculateAngle
     * Calculate the angle based on settings.
     *
     * Parameters:
     * point - {<OpenLayers.Geometry.Point>}
     * evt - {Event}
     */
    calculateAngle: function(point, evt) {
        var alpha = Math.atan2(point.y - this.origin.y,
                               point.x - this.origin.x);
        if(this.snapAngle && (this.snapToggle && !evt[this.snapToggle])) {
            var snapAngleRad = (Math.PI / 180) * this.snapAngle;
            this.angle = Math.round(alpha / snapAngleRad) * snapAngleRad;
        } else {
            this.angle = alpha;
        }
    },

    /**
     * APIMethod: cancel
     * Finish the geometry and call the "cancel" callback.
     */
    cancel: function() {
        // the polygon geometry gets cloned in the callback method
        this.callback("cancel", null);
        this.finalize();
    },

    /**
     * Method: finalize
     * Finish the geometry and call the "done" callback.
     */
    finalize: function() {
        this.origin = null;
        this.radius = this.options.radius;
    },

    /**
     * APIMethod: clear
     * Clear any rendered features on the temporary layer.  This is called
     *     when the handler is deactivated, canceled, or done (unless persist
     *     is true).
     */
    clear: function() {
        if (this.layer) {
            this.layer.renderer.clear();
            this.layer.destroyFeatures();
        }
    },
    
    /**
     * Method: callback
     * Trigger the control's named callback with the given arguments
     *
     * Parameters:
     * name - {String} The key for the callback that is one of the properties
     *     of the handler's callbacks object.
     * args - {Array} An array of arguments with which to call the callback
     *     (defined by the control).
     */
    callback: function (name, args) {
        // override the callback method to always send the polygon geometry
        if (this.callbacks[name]) {
            this.callbacks[name].apply(this.control,
                                       [this.feature.geometry.clone()]);
        }
        // since sketch features are added to the temporary layer
        // they must be cleared here if done or cancel
        if(!this.persist && (name == "done" || name == "cancel")) {
            this.clear();
        }
    },

    CLASS_NAME: "OpenLayers.Handler.RegularPolygon"
});
/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */


/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Feature/Vector.js
 * @requires OpenLayers/Handler/Feature.js
 * @requires OpenLayers/Layer/Vector/RootContainer.js
 */

/**
 * Class: OpenLayers.Control.SelectFeature
 * The SelectFeature control selects vector features from a given layer on 
 * click or hover. 
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.SelectFeature = OpenLayers.Class(OpenLayers.Control, {

    /**
     * Supported event types:
     *  - *beforefeaturehighlighted* Triggered before a feature is highlighted
     *  - *featurehighlighted* Triggered when a feature is highlighted
     *  - *featureunhighlighted* Triggered when a feature is unhighlighted
     *  - *boxselectionstart* Triggered before box selection starts
     *  - *boxselectionend* Triggered after box selection ends
     */
    
    /**
     * Property: multipleKey
     * {String} An event modifier ('altKey' or 'shiftKey') that temporarily sets
     *     the <multiple> property to true.  Default is null.
     */
    multipleKey: null,
    
    /**
     * Property: toggleKey
     * {String} An event modifier ('altKey' or 'shiftKey') that temporarily sets
     *     the <toggle> property to true.  Default is null.
     */
    toggleKey: null,
    
    /**
     * APIProperty: multiple
     * {Boolean} Allow selection of multiple geometries.  Default is false.
     */
    multiple: false, 

    /**
     * APIProperty: clickout
     * {Boolean} Unselect features when clicking outside any feature.
     *     Default is true.
     */
    clickout: true,

    /**
     * APIProperty: toggle
     * {Boolean} Unselect a selected feature on click.  Default is false.  Only
     *     has meaning if hover is false.
     */
    toggle: false,

    /**
     * APIProperty: hover
     * {Boolean} Select on mouse over and deselect on mouse out.  If true, this
     * ignores clicks and only listens to mouse moves.
     */
    hover: false,

    /**
     * APIProperty: highlightOnly
     * {Boolean} If true do not actually select features (that is place them in 
     * the layer's selected features array), just highlight them. This property
     * has no effect if hover is false. Defaults to false.
     */
    highlightOnly: false,
    
    /**
     * APIProperty: box
     * {Boolean} Allow feature selection by drawing a box.
     */
    box: false,
    
    /**
     * Property: onBeforeSelect 
     * {Function} Optional function to be called before a feature is selected.
     *     The function should expect to be called with a feature.
     */
    onBeforeSelect: function() {},
    
    /**
     * APIProperty: onSelect 
     * {Function} Optional function to be called when a feature is selected.
     *     The function should expect to be called with a feature.
     */
    onSelect: function() {},

    /**
     * APIProperty: onUnselect
     * {Function} Optional function to be called when a feature is unselected.
     *     The function should expect to be called with a feature.
     */
    onUnselect: function() {},
    
    /**
     * Property: scope
     * {Object} The scope to use with the onBeforeSelect, onSelect, onUnselect
     *     callbacks. If null the scope will be this control.
     */
    scope: null,

    /**
     * APIProperty: geometryTypes
     * {Array(String)} To restrict selecting to a limited set of geometry types,
     *     send a list of strings corresponding to the geometry class names.
     */
    geometryTypes: null,

    /**
     * Property: layer
     * {<OpenLayers.Layer.Vector>} The vector layer with a common renderer
     * root for all layers this control is configured with (if an array of
     * layers was passed to the constructor), or the vector layer the control
     * was configured with (if a single layer was passed to the constructor).
     */
    layer: null,
    
    /**
     * Property: layers
     * {Array(<OpenLayers.Layer.Vector>)} The layers this control will work on,
     * or null if the control was configured with a single layer
     */
    layers: null,
    
    /**
     * APIProperty: callbacks
     * {Object} The functions that are sent to the handlers.feature for callback
     */
    callbacks: null,
    
    /**
     * APIProperty: selectStyle 
     * {Object} Hash of styles
     */
    selectStyle: null,
    
    /**
     * Property: renderIntent
     * {String} key used to retrieve the select style from the layer's
     * style map.
     */
    renderIntent: "select",

    /**
     * Property: handlers
     * {Object} Object with references to multiple <OpenLayers.Handler>
     *     instances.
     */
    handlers: null,

    /**
     * Constructor: OpenLayers.Control.SelectFeature
     * Create a new control for selecting features.
     *
     * Parameters:
     * layers - {<OpenLayers.Layer.Vector>}, or an array of vector layers. The
     *     layer(s) this control will select features from.
     * options - {Object} 
     */
    initialize: function(layers, options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        
        if(this.scope === null) {
            this.scope = this;
        }
        this.initLayer(layers);
        var callbacks = {
            click: this.clickFeature,
            clickout: this.clickoutFeature
        };
        if (this.hover) {
            callbacks.over = this.overFeature;
            callbacks.out = this.outFeature;
        }
             
        this.callbacks = OpenLayers.Util.extend(callbacks, this.callbacks);
        this.handlers = {
            feature: new OpenLayers.Handler.Feature(
                this, this.layer, this.callbacks,
                {geometryTypes: this.geometryTypes}
            )
        };

        if (this.box) {
            this.handlers.box = new OpenLayers.Handler.Box(
                this, {done: this.selectBox},
                {boxDivClassName: "olHandlerBoxSelectFeature"}
            ); 
        }
    },

    /**
     * Method: initLayer
     * Assign the layer property. If layers is an array, we need to use
     *     a RootContainer.
     *
     * Parameters:
     * layers - {<OpenLayers.Layer.Vector>}, or an array of vector layers.
     */
    initLayer: function(layers) {
        if(OpenLayers.Util.isArray(layers)) {
            this.layers = layers;
            this.layer = new OpenLayers.Layer.Vector.RootContainer(
                this.id + "_container", {
                    layers: layers
                }
            );
        } else {
            this.layer = layers;
        }
    },
    
    /**
     * Method: destroy
     */
    destroy: function() {
        if(this.active && this.layers) {
            this.map.removeLayer(this.layer);
        }
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
        if(this.layers) {
            this.layer.destroy();
        }
    },

    /**
     * Method: activate
     * Activates the control.
     * 
     * Returns:
     * {Boolean} The control was effectively activated.
     */
    activate: function () {
        if (!this.active) {
            if(this.layers) {
                this.map.addLayer(this.layer);
            }
            this.handlers.feature.activate();
            if(this.box && this.handlers.box) {
                this.handlers.box.activate();
            }
        }
        return OpenLayers.Control.prototype.activate.apply(
            this, arguments
        );
    },

    /**
     * Method: deactivate
     * Deactivates the control.
     * 
     * Returns:
     * {Boolean} The control was effectively deactivated.
     */
    deactivate: function () {
        if (this.active) {
            this.handlers.feature.deactivate();
            if(this.handlers.box) {
                this.handlers.box.deactivate();
            }
            if(this.layers) {
                this.map.removeLayer(this.layer);
            }
        }
        return OpenLayers.Control.prototype.deactivate.apply(
            this, arguments
        );
    },

    /**
     * Method: unselectAll
     * Unselect all selected features.  To unselect all except for a single
     *     feature, set the options.except property to the feature.
     *
     * Parameters:
     * options - {Object} Optional configuration object.
     */
    unselectAll: function(options) {
        // we'll want an option to supress notification here
        var layers = this.layers || [this.layer];
        var layer, feature;
        for(var l=0; l<layers.length; ++l) {
            layer = layers[l];
            for(var i=layer.selectedFeatures.length-1; i>=0; --i) {
                feature = layer.selectedFeatures[i];
                if(!options || options.except != feature) {
                    this.unselect(feature);
                }
            }
        }
    },

    /**
     * Method: clickFeature
     * Called on click in a feature
     * Only responds if this.hover is false.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} 
     */
    clickFeature: function(feature) {
        if(!this.hover) {
            var selected = (OpenLayers.Util.indexOf(
                feature.layer.selectedFeatures, feature) > -1);
            if(selected) {
                if(this.toggleSelect()) {
                    this.unselect(feature);
                } else if(!this.multipleSelect()) {
                    this.unselectAll({except: feature});
                }
            } else {
                if(!this.multipleSelect()) {
                    this.unselectAll({except: feature});
                }
                this.select(feature);
            }
        }
    },

    /**
     * Method: multipleSelect
     * Allow for multiple selected features based on <multiple> property and
     *     <multipleKey> event modifier.
     *
     * Returns:
     * {Boolean} Allow for multiple selected features.
     */
    multipleSelect: function() {
        return this.multiple || (this.handlers.feature.evt &&
                                 this.handlers.feature.evt[this.multipleKey]);
    },
    
    /**
     * Method: toggleSelect
     * Event should toggle the selected state of a feature based on <toggle>
     *     property and <toggleKey> event modifier.
     *
     * Returns:
     * {Boolean} Toggle the selected state of a feature.
     */
    toggleSelect: function() {
        return this.toggle || (this.handlers.feature.evt &&
                               this.handlers.feature.evt[this.toggleKey]);
    },

    /**
     * Method: clickoutFeature
     * Called on click outside a previously clicked (selected) feature.
     * Only responds if this.hover is false.
     *
     * Parameters:
     * feature - {<OpenLayers.Vector.Feature>} 
     */
    clickoutFeature: function(feature) {
        if(!this.hover && this.clickout) {
            this.unselectAll();
        }
    },

    /**
     * Method: overFeature
     * Called on over a feature.
     * Only responds if this.hover is true.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} 
     */
    overFeature: function(feature) {
        var layer = feature.layer;
        if(this.hover) {
            if(this.highlightOnly) {
                this.highlight(feature);
            } else if(OpenLayers.Util.indexOf(
                layer.selectedFeatures, feature) == -1) {
                this.select(feature);
            }
        }
    },

    /**
     * Method: outFeature
     * Called on out of a selected feature.
     * Only responds if this.hover is true.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} 
     */
    outFeature: function(feature) {
        if(this.hover) {
            if(this.highlightOnly) {
                // we do nothing if we're not the last highlighter of the
                // feature
                if(feature._lastHighlighter == this.id) {
                    // if another select control had highlighted the feature before
                    // we did it ourself then we use that control to highlight the
                    // feature as it was before we highlighted it, else we just
                    // unhighlight it
                    if(feature._prevHighlighter &&
                       feature._prevHighlighter != this.id) {
                        delete feature._lastHighlighter;
                        var control = this.map.getControl(
                            feature._prevHighlighter);
                        if(control) {
                            control.highlight(feature);
                        }
                    } else {
                        this.unhighlight(feature);
                    }
                }
            } else {
                this.unselect(feature);
            }
        }
    },

    /**
     * Method: highlight
     * Redraw feature with the select style.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} 
     */
    highlight: function(feature) {
        var layer = feature.layer;
        var cont = this.events.triggerEvent("beforefeaturehighlighted", {
            feature : feature
        });
        if(cont !== false) {
            feature._prevHighlighter = feature._lastHighlighter;
            feature._lastHighlighter = this.id;
            var style = this.selectStyle || this.renderIntent;
            layer.drawFeature(feature, style);
            this.events.triggerEvent("featurehighlighted", {feature : feature});
        }
    },

    /**
     * Method: unhighlight
     * Redraw feature with the "default" style
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} 
     */
    unhighlight: function(feature) {
        var layer = feature.layer;
        // three cases:
        // 1. there's no other highlighter, in that case _prev is undefined,
        //    and we just need to undef _last
        // 2. another control highlighted the feature after we did it, in
        //    that case _last references this other control, and we just
        //    need to undef _prev
        // 3. another control highlighted the feature before we did it, in
        //    that case _prev references this other control, and we need to
        //    set _last to _prev and undef _prev
        if(feature._prevHighlighter == undefined) {
            delete feature._lastHighlighter;
        } else if(feature._prevHighlighter == this.id) {
            delete feature._prevHighlighter;
        } else {
            feature._lastHighlighter = feature._prevHighlighter;
            delete feature._prevHighlighter;
        }
        layer.drawFeature(feature, feature.style || feature.layer.style ||
            "default");
        this.events.triggerEvent("featureunhighlighted", {feature : feature});
    },
    
    /**
     * Method: select
     * Add feature to the layer's selectedFeature array, render the feature as
     * selected, and call the onSelect function.
     * 
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} 
     */
    select: function(feature) {
        var cont = this.onBeforeSelect.call(this.scope, feature);
        var layer = feature.layer;
        if(cont !== false) {
            cont = layer.events.triggerEvent("beforefeatureselected", {
                feature: feature
            });
            if(cont !== false) {
                layer.selectedFeatures.push(feature);
                this.highlight(feature);
                // if the feature handler isn't involved in the feature
                // selection (because the box handler is used or the
                // feature is selected programatically) we fake the
                // feature handler to allow unselecting on click
                if(!this.handlers.feature.lastFeature) {
                    this.handlers.feature.lastFeature = layer.selectedFeatures[0];
                }
                layer.events.triggerEvent("featureselected", {feature: feature});
                this.onSelect.call(this.scope, feature);
            }
        }
    },

    /**
     * Method: unselect
     * Remove feature from the layer's selectedFeature array, render the feature as
     * normal, and call the onUnselect function.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>}
     */
    unselect: function(feature) {
        var layer = feature.layer;
        // Store feature style for restoration later
        this.unhighlight(feature);
        OpenLayers.Util.removeItem(layer.selectedFeatures, feature);
        layer.events.triggerEvent("featureunselected", {feature: feature});
        this.onUnselect.call(this.scope, feature);
    },
    
    /**
     * Method: selectBox
     * Callback from the handlers.box set up when <box> selection is true
     *     on.
     *
     * Parameters:
     * position - {<OpenLayers.Bounds> || <OpenLayers.Pixel> }  
     */
    selectBox: function(position) {
        if (position instanceof OpenLayers.Bounds) {
            var minXY = this.map.getLonLatFromPixel({
                x: position.left,
                y: position.bottom
            });
            var maxXY = this.map.getLonLatFromPixel({
                x: position.right,
                y: position.top
            });
            var bounds = new OpenLayers.Bounds(
                minXY.lon, minXY.lat, maxXY.lon, maxXY.lat
            );
            
            // if multiple is false, first deselect currently selected features
            if (!this.multipleSelect()) {
                this.unselectAll();
            }
            
            // because we're using a box, we consider we want multiple selection
            var prevMultiple = this.multiple;
            this.multiple = true;
            var layers = this.layers || [this.layer];
            this.events.triggerEvent("boxselectionstart", {layers: layers}); 
            var layer;
            for(var l=0; l<layers.length; ++l) {
                layer = layers[l];
                for(var i=0, len = layer.features.length; i<len; ++i) {
                    var feature = layer.features[i];
                    // check if the feature is displayed
                    if (!feature.getVisibility()) {
                        continue;
                    }

                    if (this.geometryTypes == null || OpenLayers.Util.indexOf(
                            this.geometryTypes, feature.geometry.CLASS_NAME) > -1) {
                        if (bounds.toGeometry().intersects(feature.geometry)) {
                            if (OpenLayers.Util.indexOf(layer.selectedFeatures, feature) == -1) {
                                this.select(feature);
                            }
                        }
                    }
                }
            }
            this.multiple = prevMultiple;
            this.events.triggerEvent("boxselectionend", {layers: layers}); 
        }
    },

    /** 
     * Method: setMap
     * Set the map property for the control. 
     * 
     * Parameters:
     * map - {<OpenLayers.Map>} 
     */
    setMap: function(map) {
        this.handlers.feature.setMap(map);
        if (this.box) {
            this.handlers.box.setMap(map);
        }
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
    },
    
    /**
     * APIMethod: setLayer
     * Attach a new layer to the control, overriding any existing layers.
     *
     * Parameters:
     * layers - Array of {<OpenLayers.Layer.Vector>} or a single
     *     {<OpenLayers.Layer.Vector>}
     */
    setLayer: function(layers) {
        var isActive = this.active;
        this.unselectAll();
        this.deactivate();
        if(this.layers) {
            this.layer.destroy();
            this.layers = null;
        }
        this.initLayer(layers);
        this.handlers.feature.layer = this.layer;
        if (isActive) {
            this.activate();
        }
    },
    
    CLASS_NAME: "OpenLayers.Control.SelectFeature"
});
/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */


/**
 * @requires OpenLayers/Handler.js
 */

/**
 * Class: OpenLayers.Handler.Feature 
 * Handler to respond to mouse events related to a drawn feature.  Callbacks
 *     with the following keys will be notified of the following events
 *     associated with features: click, clickout, over, out, and dblclick.
 *
 * This handler stops event propagation for mousedown and mouseup if those
 *     browser events target features that can be selected.
 *
 * Inherits from:
 *  - <OpenLayers.Handler>
 */
OpenLayers.Handler.Feature = OpenLayers.Class(OpenLayers.Handler, {

    /**
     * Property: EVENTMAP
     * {Object} A object mapping the browser events to objects with callback
     *     keys for in and out.
     */
    EVENTMAP: {
        'click': {'in': 'click', 'out': 'clickout'},
        'mousemove': {'in': 'over', 'out': 'out'},
        'dblclick': {'in': 'dblclick', 'out': null},
        'mousedown': {'in': null, 'out': null},
        'mouseup': {'in': null, 'out': null},
        'touchstart': {'in': 'click', 'out': 'clickout'}
    },

    /**
     * Property: feature
     * {<OpenLayers.Feature.Vector>} The last feature that was hovered.
     */
    feature: null,

    /**
     * Property: lastFeature
     * {<OpenLayers.Feature.Vector>} The last feature that was handled.
     */
    lastFeature: null,

    /**
     * Property: down
     * {<OpenLayers.Pixel>} The location of the last mousedown.
     */
    down: null,

    /**
     * Property: up
     * {<OpenLayers.Pixel>} The location of the last mouseup.
     */
    up: null,

    /**
     * Property: touch
     * {Boolean} When a touchstart event is fired, touch will be true and all
     *     mouse related listeners will do nothing.
     */
    touch: false,
    
    /**
     * Property: clickTolerance
     * {Number} The number of pixels the mouse can move between mousedown
     *     and mouseup for the event to still be considered a click.
     *     Dragging the map should not trigger the click and clickout callbacks
     *     unless the map is moved by less than this tolerance. Defaults to 4.
     */
    clickTolerance: 4,

    /**
     * Property: geometryTypes
     * To restrict dragging to a limited set of geometry types, send a list
     * of strings corresponding to the geometry class names.
     * 
     * @type Array(String)
     */
    geometryTypes: null,

    /**
     * Property: stopClick
     * {Boolean} If stopClick is set to true, handled clicks do not
     *      propagate to other click listeners. Otherwise, handled clicks
     *      do propagate. Unhandled clicks always propagate, whatever the
     *      value of stopClick. Defaults to true.
     */
    stopClick: true,

    /**
     * Property: stopDown
     * {Boolean} If stopDown is set to true, handled mousedowns do not
     *      propagate to other mousedown listeners. Otherwise, handled
     *      mousedowns do propagate. Unhandled mousedowns always propagate,
     *      whatever the value of stopDown. Defaults to true.
     */
    stopDown: true,

    /**
     * Property: stopUp
     * {Boolean} If stopUp is set to true, handled mouseups do not
     *      propagate to other mouseup listeners. Otherwise, handled mouseups
     *      do propagate. Unhandled mouseups always propagate, whatever the
     *      value of stopUp. Defaults to false.
     */
    stopUp: false,
    
    /**
     * Constructor: OpenLayers.Handler.Feature
     *
     * Parameters:
     * control - {<OpenLayers.Control>} 
     * layer - {<OpenLayers.Layer.Vector>}
     * callbacks - {Object} An object with a 'over' property whos value is
     *     a function to be called when the mouse is over a feature. The 
     *     callback should expect to recieve a single argument, the feature.
     * options - {Object} 
     */
    initialize: function(control, layer, callbacks, options) {
        OpenLayers.Handler.prototype.initialize.apply(this, [control, callbacks, options]);
        this.layer = layer;
    },

    /**
     * Method: touchstart
     * Handle touchstart events
     *
     * Parameters:
     * evt - {Event}
     *
     * Returns:
     * {Boolean} Let the event propagate.
     */
    touchstart: function(evt) {
        if(!this.touch) {
            this.touch =  true;
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        return OpenLayers.Event.isMultiTouch(evt) ?
                true : this.mousedown(evt);
    },

    /**
     * Method: touchmove
     * Handle touchmove events. We just prevent the browser default behavior,
     *    for Android Webkit not to select text when moving the finger after
     *    selecting a feature.
     *
     * Parameters:
     * evt - {Event}
     */
    touchmove: function(evt) {
        OpenLayers.Event.stop(evt);
    },

    /**
     * Method: mousedown
     * Handle mouse down.  Stop propagation if a feature is targeted by this
     *     event (stops map dragging during feature selection).
     * 
     * Parameters:
     * evt - {Event} 
     */
    mousedown: function(evt) {
        // Feature selection is only done with a left click. Other handlers may stop the
        // propagation of left-click mousedown events but not right-click mousedown events.
        // This mismatch causes problems when comparing the location of the down and up
        // events in the click function so it is important ignore right-clicks.
        if (OpenLayers.Event.isLeftClick(evt) || OpenLayers.Event.isSingleTouch(evt)) {
            this.down = evt.xy;
        }
        return this.handle(evt) ? !this.stopDown : true;
    },
    
    /**
     * Method: mouseup
     * Handle mouse up.  Stop propagation if a feature is targeted by this
     *     event.
     * 
     * Parameters:
     * evt - {Event} 
     */
    mouseup: function(evt) {
        this.up = evt.xy;
        return this.handle(evt) ? !this.stopUp : true;
    },

    /**
     * Method: click
     * Handle click.  Call the "click" callback if click on a feature,
     *     or the "clickout" callback if click outside any feature.
     * 
     * Parameters:
     * evt - {Event} 
     *
     * Returns:
     * {Boolean}
     */
    click: function(evt) {
        return this.handle(evt) ? !this.stopClick : true;
    },
        
    /**
     * Method: mousemove
     * Handle mouse moves.  Call the "over" callback if moving in to a feature,
     *     or the "out" callback if moving out of a feature.
     * 
     * Parameters:
     * evt - {Event} 
     *
     * Returns:
     * {Boolean}
     */
    mousemove: function(evt) {
        if (!this.callbacks['over'] && !this.callbacks['out']) {
            return true;
        }     
        this.handle(evt);
        return true;
    },
    
    /**
     * Method: dblclick
     * Handle dblclick.  Call the "dblclick" callback if dblclick on a feature.
     *
     * Parameters:
     * evt - {Event} 
     *
     * Returns:
     * {Boolean}
     */
    dblclick: function(evt) {
        return !this.handle(evt);
    },

    /**
     * Method: geometryTypeMatches
     * Return true if the geometry type of the passed feature matches
     *     one of the geometry types in the geometryTypes array.
     *
     * Parameters:
     * feature - {<OpenLayers.Vector.Feature>}
     *
     * Returns:
     * {Boolean}
     */
    geometryTypeMatches: function(feature) {
        return this.geometryTypes == null ||
            OpenLayers.Util.indexOf(this.geometryTypes,
                                    feature.geometry.CLASS_NAME) > -1;
    },

    /**
     * Method: handle
     *
     * Parameters:
     * evt - {Event}
     *
     * Returns:
     * {Boolean} The event occurred over a relevant feature.
     */
    handle: function(evt) {
        if(this.feature && !this.feature.layer) {
            // feature has been destroyed
            this.feature = null;
        }
        var type = evt.type;
        var handled = false;
        var previouslyIn = !!(this.feature); // previously in a feature
        var click = (type == "click" || type == "dblclick" || type == "touchstart");
        this.feature = this.layer.getFeatureFromEvent(evt);
        if(this.feature && !this.feature.layer) {
            // feature has been destroyed
            this.feature = null;
        }
        if(this.lastFeature && !this.lastFeature.layer) {
            // last feature has been destroyed
            this.lastFeature = null;
        }
        if(this.feature) {
            if(type === "touchstart") {
                // stop the event to prevent Android Webkit from
                // "flashing" the map div
                OpenLayers.Event.stop(evt);
            }
            var inNew = (this.feature != this.lastFeature);
            if(this.geometryTypeMatches(this.feature)) {
                // in to a feature
                if(previouslyIn && inNew) {
                    // out of last feature and in to another
                    if(this.lastFeature) {
                        this.triggerCallback(type, 'out', [this.lastFeature]);
                    }
                    this.triggerCallback(type, 'in', [this.feature]);
                } else if(!previouslyIn || click) {
                    // in feature for the first time
                    this.triggerCallback(type, 'in', [this.feature]);
                }
                this.lastFeature = this.feature;
                handled = true;
            } else {
                // not in to a feature
                if(this.lastFeature && (previouslyIn && inNew || click)) {
                    // out of last feature for the first time
                    this.triggerCallback(type, 'out', [this.lastFeature]);
                }
                // next time the mouse goes in a feature whose geometry type
                // doesn't match we don't want to call the 'out' callback
                // again, so let's set this.feature to null so that
                // previouslyIn will evaluate to false the next time
                // we enter handle. Yes, a bit hackish...
                this.feature = null;
            }
        } else {
            if(this.lastFeature && (previouslyIn || click)) {
                this.triggerCallback(type, 'out', [this.lastFeature]);
            }
        }
        return handled;
    },
    
    /**
     * Method: triggerCallback
     * Call the callback keyed in the event map with the supplied arguments.
     *     For click and clickout, the <clickTolerance> is checked first.
     *
     * Parameters:
     * type - {String}
     */
    triggerCallback: function(type, mode, args) {
        var key = this.EVENTMAP[type][mode];
        if(key) {
            if(type == 'click' && this.up && this.down) {
                // for click/clickout, only trigger callback if tolerance is met
                var dpx = Math.sqrt(
                    Math.pow(this.up.x - this.down.x, 2) +
                    Math.pow(this.up.y - this.down.y, 2)
                );
                if(dpx <= this.clickTolerance) {
                    this.callback(key, args);
                }
            } else {
                this.callback(key, args);
            }
        }
    },

    /**
     * Method: activate 
     * Turn on the handler.  Returns false if the handler was already active.
     *
     * Returns:
     * {Boolean}
     */
    activate: function() {
        var activated = false;
        if(OpenLayers.Handler.prototype.activate.apply(this, arguments)) {
            this.moveLayerToTop();
            this.map.events.on({
                "removelayer": this.handleMapEvents,
                "changelayer": this.handleMapEvents,
                scope: this
            });
            activated = true;
        }
        return activated;
    },
    
    /**
     * Method: deactivate 
     * Turn off the handler.  Returns false if the handler was already active.
     *
     * Returns: 
     * {Boolean}
     */
    deactivate: function() {
        var deactivated = false;
        if(OpenLayers.Handler.prototype.deactivate.apply(this, arguments)) {
            this.moveLayerBack();
            this.feature = null;
            this.lastFeature = null;
            this.down = null;
            this.up = null;
            this.touch = false;
            this.map.events.un({
                "removelayer": this.handleMapEvents,
                "changelayer": this.handleMapEvents,
                scope: this
            });
            deactivated = true;
        }
        return deactivated;
    },
    
    /**
     * Method handleMapEvents
     * 
     * Parameters:
     * evt - {Object}
     */
    handleMapEvents: function(evt) {
        if (evt.type == "removelayer" || evt.property == "order") {
            this.moveLayerToTop();
        }
    },
    
    /**
     * Method: moveLayerToTop
     * Moves the layer for this handler to the top, so mouse events can reach
     * it.
     */
    moveLayerToTop: function() {
        var index = Math.max(this.map.Z_INDEX_BASE['Feature'] - 1,
            this.layer.getZIndex()) + 1;
        this.layer.setZIndex(index);
        
    },
    
    /**
     * Method: moveLayerBack
     * Moves the layer back to the position determined by the map's layers
     * array.
     */
    moveLayerBack: function() {
        var index = this.layer.getZIndex() - 1;
        if (index >= this.map.Z_INDEX_BASE['Feature']) {
            this.layer.setZIndex(index);
        } else {
            this.map.setLayerZIndex(this.layer,
                this.map.getLayerIndex(this.layer));
        }
    },

    CLASS_NAME: "OpenLayers.Handler.Feature"
});
/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/BaseTypes/Class.js
 */


/**
 * Class: OpenLayers.Popup
 * A popup is a small div that can opened and closed on the map.
 * Typically opened in response to clicking on a marker.  
 * See <OpenLayers.Marker>.  Popup's don't require their own
 * layer and are added the the map using the <OpenLayers.Map.addPopup>
 * method.
 *
 * Example:
 * (code)
 * popup = new OpenLayers.Popup("chicken", 
 *                    new OpenLayers.LonLat(5,40),
 *                    new OpenLayers.Size(200,200),
 *                    "example popup",
 *                    true);
 *       
 * map.addPopup(popup);
 * (end)
 */
OpenLayers.Popup = OpenLayers.Class({

    /** 
     * Property: events  
     * {<OpenLayers.Events>} custom event manager 
     */
    events: null,
    
    /** Property: id
     * {String} the unique identifier assigned to this popup.
     */
    id: "",

    /** 
     * Property: lonlat 
     * {<OpenLayers.LonLat>} the position of this popup on the map
     */
    lonlat: null,

    /** 
     * Property: div 
     * {DOMElement} the div that contains this popup.
     */
    div: null,

    /** 
     * Property: contentSize 
     * {<OpenLayers.Size>} the width and height of the content.
     */
    contentSize: null,    

    /** 
     * Property: size 
     * {<OpenLayers.Size>} the width and height of the popup.
     */
    size: null,    

    /** 
     * Property: contentHTML 
     * {String} An HTML string for this popup to display.
     */
    contentHTML: null,
    
    /** 
     * Property: backgroundColor 
     * {String} the background color used by the popup.
     */
    backgroundColor: "",
    
    /** 
     * Property: opacity 
     * {float} the opacity of this popup (between 0.0 and 1.0)
     */
    opacity: "",

    /** 
     * Property: border 
     * {String} the border size of the popup.  (eg 2px)
     */
    border: "",
    
    /** 
     * Property: contentDiv 
     * {DOMElement} a reference to the element that holds the content of
     *              the div.
     */
    contentDiv: null,
    
    /** 
     * Property: groupDiv 
     * {DOMElement} First and only child of 'div'. The group Div contains the
     *     'contentDiv' and the 'closeDiv'.
     */
    groupDiv: null,

    /** 
     * Property: closeDiv
     * {DOMElement} the optional closer image
     */
    closeDiv: null,

    /** 
     * APIProperty: autoSize
     * {Boolean} Resize the popup to auto-fit the contents.
     *     Default is false.
     */
    autoSize: false,

    /**
     * APIProperty: minSize
     * {<OpenLayers.Size>} Minimum size allowed for the popup's contents.
     */
    minSize: null,

    /**
     * APIProperty: maxSize
     * {<OpenLayers.Size>} Maximum size allowed for the popup's contents.
     */
    maxSize: null,

    /** 
     * Property: displayClass
     * {String} The CSS class of the popup.
     */
    displayClass: "olPopup",

    /** 
     * Property: contentDisplayClass
     * {String} The CSS class of the popup content div.
     */
    contentDisplayClass: "olPopupContent",

    /** 
     * Property: padding 
     * {int or <OpenLayers.Bounds>} An extra opportunity to specify internal 
     *     padding of the content div inside the popup. This was originally
     *     confused with the css padding as specified in style.css's 
     *     'olPopupContent' class. We would like to get rid of this altogether,
     *     except that it does come in handy for the framed and anchoredbubble
     *     popups, who need to maintain yet another barrier between their 
     *     content and the outer border of the popup itself. 
     * 
     *     Note that in order to not break API, we must continue to support 
     *     this property being set as an integer. Really, though, we'd like to 
     *     have this specified as a Bounds object so that user can specify
     *     distinct left, top, right, bottom paddings. With the 3.0 release
     *     we can make this only a bounds.
     */
    padding: 0,

    /** 
     * Property: disableFirefoxOverflowHack
     * {Boolean} The hack for overflow in Firefox causes all elements 
     *     to be re-drawn, which causes Flash elements to be 
     *     re-initialized, which is troublesome.
     *     With this property the hack can be disabled.
     */
    disableFirefoxOverflowHack: false,

    /**
     * Method: fixPadding
     * To be removed in 3.0, this function merely helps us to deal with the 
     *     case where the user may have set an integer value for padding, 
     *     instead of an <OpenLayers.Bounds> object.
     */
    fixPadding: function() {
        if (typeof this.padding == "number") {
            this.padding = new OpenLayers.Bounds(
                this.padding, this.padding, this.padding, this.padding
            );
        }
    },

    /**
     * APIProperty: panMapIfOutOfView
     * {Boolean} When drawn, pan map such that the entire popup is visible in
     *     the current viewport (if necessary).
     *     Default is false.
     */
    panMapIfOutOfView: false,
    
    /**
     * APIProperty: keepInMap 
     * {Boolean} If panMapIfOutOfView is false, and this property is true, 
     *     contrain the popup such that it always fits in the available map
     *     space. By default, this is not set on the base class. If you are
     *     creating popups that are near map edges and not allowing pannning,
     *     and especially if you have a popup which has a
     *     fixedRelativePosition, setting this to false may be a smart thing to
     *     do. Subclasses may want to override this setting.
     *   
     *     Default is false.
     */
    keepInMap: false,

    /**
     * APIProperty: closeOnMove
     * {Boolean} When map pans, close the popup.
     *     Default is false.
     */
    closeOnMove: false,
    
    /** 
     * Property: map 
     * {<OpenLayers.Map>} this gets set in Map.js when the popup is added to the map
     */
    map: null,

    /** 
    * Constructor: OpenLayers.Popup
    * Create a popup.
    * 
    * Parameters: 
    * id - {String} a unqiue identifier for this popup.  If null is passed
    *               an identifier will be automatically generated. 
    * lonlat - {<OpenLayers.LonLat>}  The position on the map the popup will
    *                                 be shown.
    * contentSize - {<OpenLayers.Size>} The size of the content.
    * contentHTML - {String}          An HTML string to display inside the   
    *                                 popup.
    * closeBox - {Boolean}            Whether to display a close box inside
    *                                 the popup.
    * closeBoxCallback - {Function}   Function to be called on closeBox click.
    */
    initialize:function(id, lonlat, contentSize, contentHTML, closeBox, closeBoxCallback) {
        if (id == null) {
            id = OpenLayers.Util.createUniqueID(this.CLASS_NAME + "_");
        }

        this.id = id;
        this.lonlat = lonlat;

        this.contentSize = (contentSize != null) ? contentSize 
                                  : new OpenLayers.Size(
                                                   OpenLayers.Popup.WIDTH,
                                                   OpenLayers.Popup.HEIGHT);
        if (contentHTML != null) { 
             this.contentHTML = contentHTML;
        }
        this.backgroundColor = OpenLayers.Popup.COLOR;
        this.opacity = OpenLayers.Popup.OPACITY;
        this.border = OpenLayers.Popup.BORDER;

        this.div = OpenLayers.Util.createDiv(this.id, null, null, 
                                             null, null, null, "hidden");
        this.div.className = this.displayClass;
        
        var groupDivId = this.id + "_GroupDiv";
        this.groupDiv = OpenLayers.Util.createDiv(groupDivId, null, null, 
                                                    null, "relative", null,
                                                    "hidden");

        var id = this.div.id + "_contentDiv";
        this.contentDiv = OpenLayers.Util.createDiv(id, null, this.contentSize.clone(), 
                                                    null, "relative");
        this.contentDiv.className = this.contentDisplayClass;
        this.groupDiv.appendChild(this.contentDiv);
        this.div.appendChild(this.groupDiv);

        if (closeBox) {
            this.addCloseBox(closeBoxCallback);
        } 

        this.registerEvents();
    },

    /** 
     * Method: destroy
     * nullify references to prevent circular references and memory leaks
     */
    destroy: function() {

        this.id = null;
        this.lonlat = null;
        this.size = null;
        this.contentHTML = null;
        
        this.backgroundColor = null;
        this.opacity = null;
        this.border = null;
        
        if (this.closeOnMove && this.map) {
            this.map.events.unregister("movestart", this, this.hide);
        }

        this.events.destroy();
        this.events = null;
        
        if (this.closeDiv) {
            OpenLayers.Event.stopObservingElement(this.closeDiv); 
            this.groupDiv.removeChild(this.closeDiv);
        }
        this.closeDiv = null;
        
        this.div.removeChild(this.groupDiv);
        this.groupDiv = null;

        if (this.map != null) {
            this.map.removePopup(this);
        }
        this.map = null;
        this.div = null;
        
        this.autoSize = null;
        this.minSize = null;
        this.maxSize = null;
        this.padding = null;
        this.panMapIfOutOfView = null;
    },

    /** 
    * Method: draw
    * Constructs the elements that make up the popup.
    *
    * Parameters:
    * px - {<OpenLayers.Pixel>} the position the popup in pixels.
    * 
    * Returns:
    * {DOMElement} Reference to a div that contains the drawn popup
    */
    draw: function(px) {
        if (px == null) {
            if ((this.lonlat != null) && (this.map != null)) {
                px = this.map.getLayerPxFromLonLat(this.lonlat);
            }
        }

        // this assumes that this.map already exists, which is okay because 
        // this.draw is only called once the popup has been added to the map.
        if (this.closeOnMove) {
            this.map.events.register("movestart", this, this.hide);
        }
        
        //listen to movestart, moveend to disable overflow (FF bug)
        if (!this.disableFirefoxOverflowHack && OpenLayers.BROWSER_NAME == 'firefox') {
            this.map.events.register("movestart", this, function() {
                var style = document.defaultView.getComputedStyle(
                    this.contentDiv, null
                );
                var currentOverflow = style.getPropertyValue("overflow");
                if (currentOverflow != "hidden") {
                    this.contentDiv._oldOverflow = currentOverflow;
                    this.contentDiv.style.overflow = "hidden";
                }
            });
            this.map.events.register("moveend", this, function() {
                var oldOverflow = this.contentDiv._oldOverflow;
                if (oldOverflow) {
                    this.contentDiv.style.overflow = oldOverflow;
                    this.contentDiv._oldOverflow = null;
                }
            });
        }

        this.moveTo(px);
        if (!this.autoSize && !this.size) {
            this.setSize(this.contentSize);
        }
        this.setBackgroundColor();
        this.setOpacity();
        this.setBorder();
        this.setContentHTML();
        
        if (this.panMapIfOutOfView) {
            this.panIntoView();
        }    

        return this.div;
    },

    /** 
     * Method: updatePosition
     * if the popup has a lonlat and its map members set, 
     * then have it move itself to its proper position
     */
    updatePosition: function() {
        if ((this.lonlat) && (this.map)) {
            var px = this.map.getLayerPxFromLonLat(this.lonlat);
            if (px) {
                this.moveTo(px);           
            }    
        }
    },

    /**
     * Method: moveTo
     * 
     * Parameters:
     * px - {<OpenLayers.Pixel>} the top and left position of the popup div. 
     */
    moveTo: function(px) {
        if ((px != null) && (this.div != null)) {
            this.div.style.left = px.x + "px";
            this.div.style.top = px.y + "px";
        }
    },

    /**
     * Method: visible
     *
     * Returns:      
     * {Boolean} Boolean indicating whether or not the popup is visible
     */
    visible: function() {
        return OpenLayers.Element.visible(this.div);
    },

    /**
     * Method: toggle
     * Toggles visibility of the popup.
     */
    toggle: function() {
        if (this.visible()) {
            this.hide();
        } else {
            this.show();
        }
    },

    /**
     * Method: show
     * Makes the popup visible.
     */
    show: function() {
        this.div.style.display = '';

        if (this.panMapIfOutOfView) {
            this.panIntoView();
        }    
    },

    /**
     * Method: hide
     * Makes the popup invisible.
     */
    hide: function() {
        this.div.style.display = 'none';
    },

    /**
     * Method: setSize
     * Used to adjust the size of the popup. 
     *
     * Parameters:
     * contentSize - {<OpenLayers.Size>} the new size for the popup's 
     *     contents div (in pixels).
     */
    setSize:function(contentSize) { 
        this.size = contentSize.clone(); 
        
        // if our contentDiv has a css 'padding' set on it by a stylesheet, we 
        //  must add that to the desired "size". 
        var contentDivPadding = this.getContentDivPadding();
        var wPadding = contentDivPadding.left + contentDivPadding.right;
        var hPadding = contentDivPadding.top + contentDivPadding.bottom;

        // take into account the popup's 'padding' property
        this.fixPadding();
        wPadding += this.padding.left + this.padding.right;
        hPadding += this.padding.top + this.padding.bottom;

        // make extra space for the close div
        if (this.closeDiv) {
            var closeDivWidth = parseInt(this.closeDiv.style.width);
            wPadding += closeDivWidth + contentDivPadding.right;
        }

        //increase size of the main popup div to take into account the 
        // users's desired padding and close div.        
        this.size.w += wPadding;
        this.size.h += hPadding;

        //now if our browser is IE, we need to actually make the contents 
        // div itself bigger to take its own padding into effect. this makes 
        // me want to shoot someone, but so it goes.
        if (OpenLayers.BROWSER_NAME == "msie") {
            this.contentSize.w += 
                contentDivPadding.left + contentDivPadding.right;
            this.contentSize.h += 
                contentDivPadding.bottom + contentDivPadding.top;
        }

        if (this.div != null) {
            this.div.style.width = this.size.w + "px";
            this.div.style.height = this.size.h + "px";
        }
        if (this.contentDiv != null){
            this.contentDiv.style.width = contentSize.w + "px";
            this.contentDiv.style.height = contentSize.h + "px";
        }
    },  

    /**
     * APIMethod: updateSize
     * Auto size the popup so that it precisely fits its contents (as 
     *     determined by this.contentDiv.innerHTML). Popup size will, of
     *     course, be limited by the available space on the current map
     */
    updateSize: function() {
        
        // determine actual render dimensions of the contents by putting its
        // contents into a fake contentDiv (for the CSS) and then measuring it
        var preparedHTML = "<div class='" + this.contentDisplayClass+ "'>" + 
            this.contentDiv.innerHTML + 
            "</div>";
 
        var containerElement = (this.map) ? this.map.div
        								  : document.body;
        var realSize = OpenLayers.Util.getRenderedDimensions(
            preparedHTML, null,	{
                displayClass: this.displayClass,
                containerElement: containerElement
            }
        );

        // is the "real" size of the div is safe to display in our map?
        var safeSize = this.getSafeContentSize(realSize);

        var newSize = null;
        if (safeSize.equals(realSize)) {
            //real size of content is small enough to fit on the map, 
            // so we use real size.
            newSize = realSize;

        } else {

            // make a new 'size' object with the clipped dimensions 
            // set or null if not clipped.
            var fixedSize = {
                w: (safeSize.w < realSize.w) ? safeSize.w : null,
                h: (safeSize.h < realSize.h) ? safeSize.h : null
            };
        
            if (fixedSize.w && fixedSize.h) {
                //content is too big in both directions, so we will use 
                // max popup size (safeSize), knowing well that it will 
                // overflow both ways.                
                newSize = safeSize;
            } else {
                //content is clipped in only one direction, so we need to 
                // run getRenderedDimensions() again with a fixed dimension
                var clippedSize = OpenLayers.Util.getRenderedDimensions(
                    preparedHTML, fixedSize, {
                        displayClass: this.contentDisplayClass,
                        containerElement: containerElement
                    }
                );
                
                //if the clipped size is still the same as the safeSize, 
                // that means that our content must be fixed in the 
                // offending direction. If overflow is 'auto', this means 
                // we are going to have a scrollbar for sure, so we must 
                // adjust for that.
                //
                var currentOverflow = OpenLayers.Element.getStyle(
                    this.contentDiv, "overflow"
                );
                if ( (currentOverflow != "hidden") && 
                     (clippedSize.equals(safeSize)) ) {
                    var scrollBar = OpenLayers.Util.getScrollbarWidth();
                    if (fixedSize.w) {
                        clippedSize.h += scrollBar;
                    } else {
                        clippedSize.w += scrollBar;
                    }
                }
                
                newSize = this.getSafeContentSize(clippedSize);
            }
        }                        
        this.setSize(newSize);     
    },    

    /**
     * Method: setBackgroundColor
     * Sets the background color of the popup.
     *
     * Parameters:
     * color - {String} the background color.  eg "#FFBBBB"
     */
    setBackgroundColor:function(color) { 
        if (color != undefined) {
            this.backgroundColor = color; 
        }
        
        if (this.div != null) {
            this.div.style.backgroundColor = this.backgroundColor;
        }
    },  
    
    /**
     * Method: setOpacity
     * Sets the opacity of the popup.
     * 
     * Parameters:
     * opacity - {float} A value between 0.0 (transparent) and 1.0 (solid).   
     */
    setOpacity:function(opacity) { 
        if (opacity != undefined) {
            this.opacity = opacity; 
        }
        
        if (this.div != null) {
            // for Mozilla and Safari
            this.div.style.opacity = this.opacity;

            // for IE
            this.div.style.filter = 'alpha(opacity=' + this.opacity*100 + ')';
        }
    },  
    
    /**
     * Method: setBorder
     * Sets the border style of the popup.
     *
     * Parameters:
     * border - {String} The border style value. eg 2px 
     */
    setBorder:function(border) { 
        if (border != undefined) {
            this.border = border;
        }
        
        if (this.div != null) {
            this.div.style.border = this.border;
        }
    },      
    
    /**
     * Method: setContentHTML
     * Allows the user to set the HTML content of the popup.
     *
     * Parameters:
     * contentHTML - {String} HTML for the div.
     */
    setContentHTML:function(contentHTML) {

        if (contentHTML != null) {
            this.contentHTML = contentHTML;
        }
       
        if ((this.contentDiv != null) && 
            (this.contentHTML != null) &&
            (this.contentHTML != this.contentDiv.innerHTML)) {
       
            this.contentDiv.innerHTML = this.contentHTML;
       
            if (this.autoSize) {
                
                //if popup has images, listen for when they finish
                // loading and resize accordingly
                this.registerImageListeners();

                //auto size the popup to its current contents
                this.updateSize();
            }
        }    

    },
    
    /**
     * Method: registerImageListeners
     * Called when an image contained by the popup loaded. this function
     *     updates the popup size, then unregisters the image load listener.
     */   
    registerImageListeners: function() { 

        // As the images load, this function will call updateSize() to 
        // resize the popup to fit the content div (which presumably is now
        // bigger than when the image was not loaded).
        // 
        // If the 'panMapIfOutOfView' property is set, we will pan the newly
        // resized popup back into view.
        // 
        // Note that this function, when called, will have 'popup' and 
        // 'img' properties in the context.
        //
        var onImgLoad = function() {
            
            this.popup.updateSize();
     
            if ( this.popup.visible() && this.popup.panMapIfOutOfView ) {
                this.popup.panIntoView();
            }

            OpenLayers.Event.stopObserving(
                this.img, "load", this.img._onImageLoad
            );
    
        };

        //cycle through the images and if their size is 0x0, that means that 
        // they haven't been loaded yet, so we attach the listener, which 
        // will fire when the images finish loading and will resize the 
        // popup accordingly to its new size.
        var images = this.contentDiv.getElementsByTagName("img");
        for (var i = 0, len = images.length; i < len; i++) {
            var img = images[i];
            if (img.width == 0 || img.height == 0) {

                var context = {
                    'popup': this,
                    'img': img
                };

                //expando this function to the image itself before registering
                // it. This way we can easily and properly unregister it.
                img._onImgLoad = OpenLayers.Function.bind(onImgLoad, context);

                OpenLayers.Event.observe(img, 'load', img._onImgLoad);
            }    
        } 
    },

    /**
     * APIMethod: getSafeContentSize
     * 
     * Parameters:
     * size - {<OpenLayers.Size>} Desired size to make the popup.
     * 
     * Returns:
     * {<OpenLayers.Size>} A size to make the popup which is neither smaller
     *     than the specified minimum size, nor bigger than the maximum 
     *     size (which is calculated relative to the size of the viewport).
     */
    getSafeContentSize: function(size) {

        var safeContentSize = size.clone();

        // if our contentDiv has a css 'padding' set on it by a stylesheet, we 
        //  must add that to the desired "size". 
        var contentDivPadding = this.getContentDivPadding();
        var wPadding = contentDivPadding.left + contentDivPadding.right;
        var hPadding = contentDivPadding.top + contentDivPadding.bottom;

        // take into account the popup's 'padding' property
        this.fixPadding();
        wPadding += this.padding.left + this.padding.right;
        hPadding += this.padding.top + this.padding.bottom;

        if (this.closeDiv) {
            var closeDivWidth = parseInt(this.closeDiv.style.width);
            wPadding += closeDivWidth + contentDivPadding.right;
        }

        // prevent the popup from being smaller than a specified minimal size
        if (this.minSize) {
            safeContentSize.w = Math.max(safeContentSize.w, 
                (this.minSize.w - wPadding));
            safeContentSize.h = Math.max(safeContentSize.h, 
                (this.minSize.h - hPadding));
        }

        // prevent the popup from being bigger than a specified maximum size
        if (this.maxSize) {
            safeContentSize.w = Math.min(safeContentSize.w, 
                (this.maxSize.w - wPadding));
            safeContentSize.h = Math.min(safeContentSize.h, 
                (this.maxSize.h - hPadding));
        }
        
        //make sure the desired size to set doesn't result in a popup that 
        // is bigger than the map's viewport.
        //
        if (this.map && this.map.size) {
            
            var extraX = 0, extraY = 0;
            if (this.keepInMap && !this.panMapIfOutOfView) {
                var px = this.map.getPixelFromLonLat(this.lonlat);
                switch (this.relativePosition) {
                    case "tr":
                        extraX = px.x;
                        extraY = this.map.size.h - px.y;
                        break;
                    case "tl":
                        extraX = this.map.size.w - px.x;
                        extraY = this.map.size.h - px.y;
                        break;
                    case "bl":
                        extraX = this.map.size.w - px.x;
                        extraY = px.y;
                        break;
                    case "br":
                        extraX = px.x;
                        extraY = px.y;
                        break;
                    default:    
                        extraX = px.x;
                        extraY = this.map.size.h - px.y;
                        break;
                }
            }    
          
            var maxY = this.map.size.h - 
                this.map.paddingForPopups.top - 
                this.map.paddingForPopups.bottom - 
                hPadding - extraY;
            
            var maxX = this.map.size.w - 
                this.map.paddingForPopups.left - 
                this.map.paddingForPopups.right - 
                wPadding - extraX;
            
            safeContentSize.w = Math.min(safeContentSize.w, maxX);
            safeContentSize.h = Math.min(safeContentSize.h, maxY);
        }
        
        return safeContentSize;
    },
    
    /**
     * Method: getContentDivPadding
     * Glorious, oh glorious hack in order to determine the css 'padding' of 
     *     the contentDiv. IE/Opera return null here unless we actually add the 
     *     popup's main 'div' element (which contains contentDiv) to the DOM. 
     *     So we make it invisible and then add it to the document temporarily. 
     *
     *     Once we've taken the padding readings we need, we then remove it 
     *     from the DOM (it will actually get added to the DOM in 
     *     Map.js's addPopup)
     *
     * Returns:
     * {<OpenLayers.Bounds>}
     */
    getContentDivPadding: function() {

        //use cached value if we have it
        var contentDivPadding = this._contentDivPadding;
        if (!contentDivPadding) {

        	if (this.div.parentNode == null) {
	        	//make the div invisible and add it to the page        
	            this.div.style.display = "none";
	            document.body.appendChild(this.div);
	    	}
	            
            //read the padding settings from css, put them in an OL.Bounds        
            contentDivPadding = new OpenLayers.Bounds(
                OpenLayers.Element.getStyle(this.contentDiv, "padding-left"),
                OpenLayers.Element.getStyle(this.contentDiv, "padding-bottom"),
                OpenLayers.Element.getStyle(this.contentDiv, "padding-right"),
                OpenLayers.Element.getStyle(this.contentDiv, "padding-top")
            );
    
            //cache the value
            this._contentDivPadding = contentDivPadding;

            if (this.div.parentNode == document.body) {
	            //remove the div from the page and make it visible again
	            document.body.removeChild(this.div);
	            this.div.style.display = "";
            }
        }
        return contentDivPadding;
    },

    /**
     * Method: addCloseBox
     * 
     * Parameters:
     * callback - {Function} The callback to be called when the close button
     *     is clicked.
     */
    addCloseBox: function(callback) {

        this.closeDiv = OpenLayers.Util.createDiv(
            this.id + "_close", null, {w: 17, h: 17}
        );
        this.closeDiv.className = "olPopupCloseBox"; 
        
        // use the content div's css padding to determine if we should
        //  padd the close div
        var contentDivPadding = this.getContentDivPadding();
         
        this.closeDiv.style.right = contentDivPadding.right + "px";
        this.closeDiv.style.top = contentDivPadding.top + "px";
        this.groupDiv.appendChild(this.closeDiv);

        var closePopup = callback || function(e) {
            this.hide();
            OpenLayers.Event.stop(e);
        };
        OpenLayers.Event.observe(this.closeDiv, "touchend", 
                OpenLayers.Function.bindAsEventListener(closePopup, this));
        OpenLayers.Event.observe(this.closeDiv, "click", 
                OpenLayers.Function.bindAsEventListener(closePopup, this));
    },

    /**
     * Method: panIntoView
     * Pans the map such that the popup is totaly viewable (if necessary)
     */
    panIntoView: function() {
        
        var mapSize = this.map.getSize();
    
        //start with the top left corner of the popup, in px, 
        // relative to the viewport
        var origTL = this.map.getViewPortPxFromLayerPx( new OpenLayers.Pixel(
            parseInt(this.div.style.left),
            parseInt(this.div.style.top)
        ));
        var newTL = origTL.clone();
    
        //new left (compare to margins, using this.size to calculate right)
        if (origTL.x < this.map.paddingForPopups.left) {
            newTL.x = this.map.paddingForPopups.left;
        } else 
        if ( (origTL.x + this.size.w) > (mapSize.w - this.map.paddingForPopups.right)) {
            newTL.x = mapSize.w - this.map.paddingForPopups.right - this.size.w;
        }
        
        //new top (compare to margins, using this.size to calculate bottom)
        if (origTL.y < this.map.paddingForPopups.top) {
            newTL.y = this.map.paddingForPopups.top;
        } else 
        if ( (origTL.y + this.size.h) > (mapSize.h - this.map.paddingForPopups.bottom)) {
            newTL.y = mapSize.h - this.map.paddingForPopups.bottom - this.size.h;
        }
        
        var dx = origTL.x - newTL.x;
        var dy = origTL.y - newTL.y;
        
        this.map.pan(dx, dy);
    },

    /** 
     * Method: registerEvents
     * Registers events on the popup.
     *
     * Do this in a separate function so that subclasses can 
     *   choose to override it if they wish to deal differently
     *   with mouse events
     * 
     *   Note in the following handler functions that some special
     *    care is needed to deal correctly with mousing and popups. 
     *   
     *   Because the user might select the zoom-rectangle option and
     *    then drag it over a popup, we need a safe way to allow the
     *    mousemove and mouseup events to pass through the popup when
     *    they are initiated from outside. The same procedure is needed for
     *    touchmove and touchend events.
     * 
     *   Otherwise, we want to essentially kill the event propagation
     *    for all other events, though we have to do so carefully, 
     *    without disabling basic html functionality, like clicking on 
     *    hyperlinks or drag-selecting text.
     */
     registerEvents:function() {
        this.events = new OpenLayers.Events(this, this.div, null, true);

        function onTouchstart(evt) {
            OpenLayers.Event.stop(evt, true);
        }
        this.events.on({
            "mousedown": this.onmousedown,
            "mousemove": this.onmousemove,
            "mouseup": this.onmouseup,
            "click": this.onclick,
            "mouseout": this.onmouseout,
            "dblclick": this.ondblclick,
            "touchstart": onTouchstart,
            scope: this
        });
        
     },

    /** 
     * Method: onmousedown 
     * When mouse goes down within the popup, make a note of
     *   it locally, and then do not propagate the mousedown 
     *   (but do so safely so that user can select text inside)
     * 
     * Parameters:
     * evt - {Event} 
     */
    onmousedown: function (evt) {
        this.mousedown = true;
        OpenLayers.Event.stop(evt, true);
    },

    /** 
     * Method: onmousemove
     * If the drag was started within the popup, then 
     *   do not propagate the mousemove (but do so safely
     *   so that user can select text inside)
     * 
     * Parameters:
     * evt - {Event} 
     */
    onmousemove: function (evt) {
        if (this.mousedown) {
            OpenLayers.Event.stop(evt, true);
        }
    },

    /** 
     * Method: onmouseup
     * When mouse comes up within the popup, after going down 
     *   in it, reset the flag, and then (once again) do not 
     *   propagate the event, but do so safely so that user can 
     *   select text inside
     * 
     * Parameters:
     * evt - {Event} 
     */
    onmouseup: function (evt) {
        if (this.mousedown) {
            this.mousedown = false;
            OpenLayers.Event.stop(evt, true);
        }
    },

    /**
     * Method: onclick
     * Ignore clicks, but allowing default browser handling
     * 
     * Parameters:
     * evt - {Event} 
     */
    onclick: function (evt) {
        OpenLayers.Event.stop(evt, true);
    },

    /** 
     * Method: onmouseout
     * When mouse goes out of the popup set the flag to false so that
     *   if they let go and then drag back in, we won't be confused.
     * 
     * Parameters:
     * evt - {Event} 
     */
    onmouseout: function (evt) {
        this.mousedown = false;
    },
    
    /** 
     * Method: ondblclick
     * Ignore double-clicks, but allowing default browser handling
     * 
     * Parameters:
     * evt - {Event} 
     */
    ondblclick: function (evt) {
        OpenLayers.Event.stop(evt, true);
    },

    CLASS_NAME: "OpenLayers.Popup"
});

OpenLayers.Popup.WIDTH = 200;
OpenLayers.Popup.HEIGHT = 200;
OpenLayers.Popup.COLOR = "white";
OpenLayers.Popup.OPACITY = 1;
OpenLayers.Popup.BORDER = "0px";
/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */


/**
 * @requires OpenLayers/Popup.js
 */

/**
 * Class: OpenLayers.Popup.Anchored
 * 
 * Inherits from:
 *  - <OpenLayers.Popup>
 */
OpenLayers.Popup.Anchored = 
  OpenLayers.Class(OpenLayers.Popup, {

    /** 
     * Property: relativePosition
     * {String} Relative position of the popup ("br", "tr", "tl" or "bl").
     */
    relativePosition: null,
    
    /**
     * APIProperty: keepInMap 
     * {Boolean} If panMapIfOutOfView is false, and this property is true, 
     *     contrain the popup such that it always fits in the available map
     *     space. By default, this is set. If you are creating popups that are
     *     near map edges and not allowing pannning, and especially if you have
     *     a popup which has a fixedRelativePosition, setting this to false may
     *     be a smart thing to do.
     *   
     *     For anchored popups, default is true, since subclasses will
     *     usually want this functionality.
     */
    keepInMap: true,

    /**
     * Property: anchor
     * {Object} Object to which we'll anchor the popup. Must expose a 
     *     'size' (<OpenLayers.Size>) and 'offset' (<OpenLayers.Pixel>).
     */
    anchor: null,

    /** 
    * Constructor: OpenLayers.Popup.Anchored
    * 
    * Parameters:
    * id - {String}
    * lonlat - {<OpenLayers.LonLat>}
    * contentSize - {<OpenLayers.Size>}
    * contentHTML - {String}
    * anchor - {Object} Object which must expose a 'size' <OpenLayers.Size> 
    *     and 'offset' <OpenLayers.Pixel> (generally an <OpenLayers.Icon>).
    * closeBox - {Boolean}
    * closeBoxCallback - {Function} Function to be called on closeBox click.
    */
    initialize:function(id, lonlat, contentSize, contentHTML, anchor, closeBox,
                        closeBoxCallback) {
        var newArguments = [
            id, lonlat, contentSize, contentHTML, closeBox, closeBoxCallback
        ];
        OpenLayers.Popup.prototype.initialize.apply(this, newArguments);

        this.anchor = (anchor != null) ? anchor 
                                       : { size: new OpenLayers.Size(0,0),
                                           offset: new OpenLayers.Pixel(0,0)};
    },

    /**
     * APIMethod: destroy
     */
    destroy: function() {
        this.anchor = null;
        this.relativePosition = null;
        
        OpenLayers.Popup.prototype.destroy.apply(this, arguments);        
    },

    /**
     * APIMethod: show
     * Overridden from Popup since user might hide popup and then show() it 
     *     in a new location (meaning we might want to update the relative
     *     position on the show)
     */
    show: function() {
        this.updatePosition();
        OpenLayers.Popup.prototype.show.apply(this, arguments);
    },

    /**
     * Method: moveTo
     * Since the popup is moving to a new px, it might need also to be moved
     *     relative to where the marker is. We first calculate the new 
     *     relativePosition, and then we calculate the new px where we will 
     *     put the popup, based on the new relative position. 
     * 
     *     If the relativePosition has changed, we must also call 
     *     updateRelativePosition() to make any visual changes to the popup 
     *     which are associated with putting it in a new relativePosition.
     * 
     * Parameters:
     * px - {<OpenLayers.Pixel>}
     */
    moveTo: function(px) {
        var oldRelativePosition = this.relativePosition;
        this.relativePosition = this.calculateRelativePosition(px);
        
        var newPx = this.calculateNewPx(px);
        
        var newArguments = new Array(newPx);        
        OpenLayers.Popup.prototype.moveTo.apply(this, newArguments);
        
        //if this move has caused the popup to change its relative position, 
        // we need to make the appropriate cosmetic changes.
        if (this.relativePosition != oldRelativePosition) {
            this.updateRelativePosition();
        }
    },

    /**
     * APIMethod: setSize
     * 
     * Parameters:
     * contentSize - {<OpenLayers.Size>} the new size for the popup's 
     *     contents div (in pixels).
     */
    setSize:function(contentSize) { 
        OpenLayers.Popup.prototype.setSize.apply(this, arguments);

        if ((this.lonlat) && (this.map)) {
            var px = this.map.getLayerPxFromLonLat(this.lonlat);
            this.moveTo(px);
        }
    },  
    
    /** 
     * Method: calculateRelativePosition
     * 
     * Parameters:
     * px - {<OpenLayers.Pixel>}
     * 
     * Returns:
     * {String} The relative position ("br" "tr" "tl" "bl") at which the popup
     *     should be placed.
     */
    calculateRelativePosition:function(px) {
        var lonlat = this.map.getLonLatFromLayerPx(px);        
        
        var extent = this.map.getExtent();
        var quadrant = extent.determineQuadrant(lonlat);
        
        return OpenLayers.Bounds.oppositeQuadrant(quadrant);
    }, 

    /**
     * Method: updateRelativePosition
     * The popup has been moved to a new relative location, so we may want to 
     *     make some cosmetic adjustments to it. 
     * 
     *     Note that in the classic Anchored popup, there is nothing to do 
     *     here, since the popup looks exactly the same in all four positions.
     *     Subclasses such as Framed, however, will want to do something
     *     special here.
     */
    updateRelativePosition: function() {
        //to be overridden by subclasses
    },

    /** 
     * Method: calculateNewPx
     * 
     * Parameters:
     * px - {<OpenLayers.Pixel>}
     * 
     * Returns:
     * {<OpenLayers.Pixel>} The the new px position of the popup on the screen
     *     relative to the passed-in px.
     */
    calculateNewPx:function(px) {
        var newPx = px.offset(this.anchor.offset);
        
        //use contentSize if size is not already set
        var size = this.size || this.contentSize;

        var top = (this.relativePosition.charAt(0) == 't');
        newPx.y += (top) ? -size.h : this.anchor.size.h;
        
        var left = (this.relativePosition.charAt(1) == 'l');
        newPx.x += (left) ? -size.w : this.anchor.size.w;

        return newPx;   
    },

    CLASS_NAME: "OpenLayers.Popup.Anchored"
});
/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Popup/Anchored.js
 */

/**
 * Class: OpenLayers.Popup.Framed
 * 
 * Inherits from:
 *  - <OpenLayers.Popup.Anchored>
 */
OpenLayers.Popup.Framed =
  OpenLayers.Class(OpenLayers.Popup.Anchored, {

    /**
     * Property: imageSrc
     * {String} location of the image to be used as the popup frame
     */
    imageSrc: null,

    /**
     * Property: imageSize
     * {<OpenLayers.Size>} Size (measured in pixels) of the image located
     *     by the 'imageSrc' property.
     */
    imageSize: null,

    /**
     * APIProperty: isAlphaImage
     * {Boolean} The image has some alpha and thus needs to use the alpha 
     *     image hack. Note that setting this to true will have no noticeable
     *     effect in FF or IE7 browsers, but will all but crush the ie6 
     *     browser. 
     *     Default is false.
     */
    isAlphaImage: false,

    /**
     * Property: positionBlocks
     * {Object} Hash of different position blocks (Object/Hashs). Each block 
     *     will be keyed by a two-character 'relativePosition' 
     *     code string (ie "tl", "tr", "bl", "br"). Block properties are 
     *     'offset', 'padding' (self-explanatory), and finally the 'blocks'
     *     parameter, which is an array of the block objects. 
     * 
     *     Each block object must have 'size', 'anchor', and 'position' 
     *     properties.
     * 
     *     Note that positionBlocks should never be modified at runtime.
     */
    positionBlocks: null,

    /**
     * Property: blocks
     * {Array[Object]} Array of objects, each of which is one "block" of the 
     *     popup. Each block has a 'div' and an 'image' property, both of 
     *     which are DOMElements, and the latter of which is appended to the 
     *     former. These are reused as the popup goes changing positions for
     *     great economy and elegance.
     */
    blocks: null,

    /** 
     * APIProperty: fixedRelativePosition
     * {Boolean} We want the framed popup to work dynamically placed relative
     *     to its anchor but also in just one fixed position. A well designed
     *     framed popup will have the pixels and logic to display itself in 
     *     any of the four relative positions, but (understandably), this will
     *     not be the case for all of them. By setting this property to 'true', 
     *     framed popup will not recalculate for the best placement each time
     *     it's open, but will always open the same way. 
     *     Note that if this is set to true, it is generally advisable to also
     *     set the 'panIntoView' property to true so that the popup can be 
     *     scrolled into view (since it will often be offscreen on open)
     *     Default is false.
     */
    fixedRelativePosition: false,

    /** 
     * Constructor: OpenLayers.Popup.Framed
     * 
     * Parameters:
     * id - {String}
     * lonlat - {<OpenLayers.LonLat>}
     * contentSize - {<OpenLayers.Size>}
     * contentHTML - {String}
     * anchor - {Object} Object to which we'll anchor the popup. Must expose 
     *     a 'size' (<OpenLayers.Size>) and 'offset' (<OpenLayers.Pixel>) 
     *     (Note that this is generally an <OpenLayers.Icon>).
     * closeBox - {Boolean}
     * closeBoxCallback - {Function} Function to be called on closeBox click.
     */
    initialize:function(id, lonlat, contentSize, contentHTML, anchor, closeBox, 
                        closeBoxCallback) {

        OpenLayers.Popup.Anchored.prototype.initialize.apply(this, arguments);

        if (this.fixedRelativePosition) {
            //based on our decided relativePostion, set the current padding
            // this keeps us from getting into trouble 
            this.updateRelativePosition();
            
            //make calculateRelativePosition always return the specified
            // fixed position.
            this.calculateRelativePosition = function(px) {
                return this.relativePosition;
            };
        }

        this.contentDiv.style.position = "absolute";
        this.contentDiv.style.zIndex = 1;

        if (closeBox) {
            this.closeDiv.style.zIndex = 1;
        }

        this.groupDiv.style.position = "absolute";
        this.groupDiv.style.top = "0px";
        this.groupDiv.style.left = "0px";
        this.groupDiv.style.height = "100%";
        this.groupDiv.style.width = "100%";
    },

    /** 
     * APIMethod: destroy
     */
    destroy: function() {
        this.imageSrc = null;
        this.imageSize = null;
        this.isAlphaImage = null;

        this.fixedRelativePosition = false;
        this.positionBlocks = null;

        //remove our blocks
        for(var i = 0; i < this.blocks.length; i++) {
            var block = this.blocks[i];

            if (block.image) {
                block.div.removeChild(block.image);
            }
            block.image = null;

            if (block.div) {
                this.groupDiv.removeChild(block.div);
            }
            block.div = null;
        }
        this.blocks = null;

        OpenLayers.Popup.Anchored.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: setBackgroundColor
     */
    setBackgroundColor:function(color) {
        //does nothing since the framed popup's entire scheme is based on a 
        // an image -- changing the background color makes no sense. 
    },

    /**
     * APIMethod: setBorder
     */
    setBorder:function() {
        //does nothing since the framed popup's entire scheme is based on a 
        // an image -- changing the popup's border makes no sense. 
    },

    /**
     * Method: setOpacity
     * Sets the opacity of the popup.
     * 
     * Parameters:
     * opacity - {float} A value between 0.0 (transparent) and 1.0 (solid).   
     */
    setOpacity:function(opacity) {
        //does nothing since we suppose that we'll never apply an opacity
        // to a framed popup
    },

    /**
     * APIMethod: setSize
     * Overridden here, because we need to update the blocks whenever the size
     *     of the popup has changed.
     * 
     * Parameters:
     * contentSize - {<OpenLayers.Size>} the new size for the popup's 
     *     contents div (in pixels).
     */
    setSize:function(contentSize) { 
        OpenLayers.Popup.Anchored.prototype.setSize.apply(this, arguments);

        this.updateBlocks();
    },

    /**
     * Method: updateRelativePosition
     * When the relative position changes, we need to set the new padding 
     *     BBOX on the popup, reposition the close div, and update the blocks.
     */
    updateRelativePosition: function() {

        //update the padding
        this.padding = this.positionBlocks[this.relativePosition].padding;

        //update the position of our close box to new padding
        if (this.closeDiv) {
            // use the content div's css padding to determine if we should
            //  padd the close div
            var contentDivPadding = this.getContentDivPadding();

            this.closeDiv.style.right = contentDivPadding.right + 
                                        this.padding.right + "px";
            this.closeDiv.style.top = contentDivPadding.top + 
                                      this.padding.top + "px";
        }

        this.updateBlocks();
    },

    /** 
     * Method: calculateNewPx
     * Besides the standard offset as determined by the Anchored class, our 
     *     Framed popups have a special 'offset' property for each of their 
     *     positions, which is used to offset the popup relative to its anchor.
     * 
     * Parameters:
     * px - {<OpenLayers.Pixel>}
     * 
     * Returns:
     * {<OpenLayers.Pixel>} The the new px position of the popup on the screen
     *     relative to the passed-in px.
     */
    calculateNewPx:function(px) {
        var newPx = OpenLayers.Popup.Anchored.prototype.calculateNewPx.apply(
            this, arguments
        );

        newPx = newPx.offset(this.positionBlocks[this.relativePosition].offset);

        return newPx;
    },

    /**
     * Method: createBlocks
     */
    createBlocks: function() {
        this.blocks = [];

        //since all positions contain the same number of blocks, we can 
        // just pick the first position and use its blocks array to create
        // our blocks array
        var firstPosition = null;
        for(var key in this.positionBlocks) {
            firstPosition = key;
            break;
        }
        
        var position = this.positionBlocks[firstPosition];
        for (var i = 0; i < position.blocks.length; i++) {

            var block = {};
            this.blocks.push(block);

            var divId = this.id + '_FrameDecorationDiv_' + i;
            block.div = OpenLayers.Util.createDiv(divId, 
                null, null, null, "absolute", null, "hidden", null
            );

            var imgId = this.id + '_FrameDecorationImg_' + i;
            var imageCreator = 
                (this.isAlphaImage) ? OpenLayers.Util.createAlphaImageDiv
                                    : OpenLayers.Util.createImage;

            block.image = imageCreator(imgId, 
                null, this.imageSize, this.imageSrc, 
                "absolute", null, null, null
            );

            block.div.appendChild(block.image);
            this.groupDiv.appendChild(block.div);
        }
    },

    /**
     * Method: updateBlocks
     * Internal method, called on initialize and when the popup's relative
     *     position has changed. This function takes care of re-positioning
     *     the popup's blocks in their appropropriate places.
     */
    updateBlocks: function() {
        if (!this.blocks) {
            this.createBlocks();
        }
        
        if (this.size && this.relativePosition) {
            var position = this.positionBlocks[this.relativePosition];
            for (var i = 0; i < position.blocks.length; i++) {
    
                var positionBlock = position.blocks[i];
                var block = this.blocks[i];
    
                // adjust sizes
                var l = positionBlock.anchor.left;
                var b = positionBlock.anchor.bottom;
                var r = positionBlock.anchor.right;
                var t = positionBlock.anchor.top;
    
                //note that we use the isNaN() test here because if the 
                // size object is initialized with a "auto" parameter, the 
                // size constructor calls parseFloat() on the string, 
                // which will turn it into NaN
                //
                var w = (isNaN(positionBlock.size.w)) ? this.size.w - (r + l) 
                                                      : positionBlock.size.w;
    
                var h = (isNaN(positionBlock.size.h)) ? this.size.h - (b + t) 
                                                      : positionBlock.size.h;
    
                block.div.style.width = (w < 0 ? 0 : w) + 'px';
                block.div.style.height = (h < 0 ? 0 : h) + 'px';
    
                block.div.style.left = (l != null) ? l + 'px' : '';
                block.div.style.bottom = (b != null) ? b + 'px' : '';
                block.div.style.right = (r != null) ? r + 'px' : '';            
                block.div.style.top = (t != null) ? t + 'px' : '';
    
                block.image.style.left = positionBlock.position.x + 'px';
                block.image.style.top = positionBlock.position.y + 'px';
            }
    
            this.contentDiv.style.left = this.padding.left + "px";
            this.contentDiv.style.top = this.padding.top + "px";
        }
    },

    CLASS_NAME: "OpenLayers.Popup.Framed"
});
/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Popup/Framed.js
 * @requires OpenLayers/Util.js
 * @requires OpenLayers/BaseTypes/Bounds.js
 * @requires OpenLayers/BaseTypes/Pixel.js
 * @requires OpenLayers/BaseTypes/Size.js
 */

/**
 * Class: OpenLayers.Popup.FramedCloud
 * 
 * Inherits from: 
 *  - <OpenLayers.Popup.Framed>
 */
OpenLayers.Popup.FramedCloud = 
  OpenLayers.Class(OpenLayers.Popup.Framed, {

    /** 
     * Property: contentDisplayClass
     * {String} The CSS class of the popup content div.
     */
    contentDisplayClass: "olFramedCloudPopupContent",

    /**
     * APIProperty: autoSize
     * {Boolean} Framed Cloud is autosizing by default.
     */
    autoSize: true,

    /**
     * APIProperty: panMapIfOutOfView
     * {Boolean} Framed Cloud does pan into view by default.
     */
    panMapIfOutOfView: true,

    /**
     * APIProperty: imageSize
     * {<OpenLayers.Size>}
     */
    imageSize: new OpenLayers.Size(1276, 736),

    /**
     * APIProperty: isAlphaImage
     * {Boolean} The FramedCloud does not use an alpha image (in honor of the 
     *     good ie6 folk out there)
     */
    isAlphaImage: false,

    /** 
     * APIProperty: fixedRelativePosition
     * {Boolean} The Framed Cloud popup works in just one fixed position.
     */
    fixedRelativePosition: false,

    /**
     * Property: positionBlocks
     * {Object} Hash of differen position blocks, keyed by relativePosition
     *     two-character code string (ie "tl", "tr", "bl", "br")
     */
    positionBlocks: {
        "tl": {
            'offset': new OpenLayers.Pixel(44, 0),
            'padding': new OpenLayers.Bounds(8, 40, 8, 9),
            'blocks': [
                { // top-left
                    size: new OpenLayers.Size('auto', 'auto'),
                    anchor: new OpenLayers.Bounds(0, 51, 22, 0),
                    position: new OpenLayers.Pixel(0, 0)
                },
                { //top-right
                    size: new OpenLayers.Size(22, 'auto'),
                    anchor: new OpenLayers.Bounds(null, 50, 0, 0),
                    position: new OpenLayers.Pixel(-1238, 0)
                },
                { //bottom-left
                    size: new OpenLayers.Size('auto', 19),
                    anchor: new OpenLayers.Bounds(0, 32, 22, null),
                    position: new OpenLayers.Pixel(0, -631)
                },
                { //bottom-right
                    size: new OpenLayers.Size(22, 18),
                    anchor: new OpenLayers.Bounds(null, 32, 0, null),
                    position: new OpenLayers.Pixel(-1238, -632)
                },
                { // stem
                    size: new OpenLayers.Size(81, 35),
                    anchor: new OpenLayers.Bounds(null, 0, 0, null),
                    position: new OpenLayers.Pixel(0, -688)
                }
            ]
        },
        "tr": {
            'offset': new OpenLayers.Pixel(-45, 0),
            'padding': new OpenLayers.Bounds(8, 40, 8, 9),
            'blocks': [
                { // top-left
                    size: new OpenLayers.Size('auto', 'auto'),
                    anchor: new OpenLayers.Bounds(0, 51, 22, 0),
                    position: new OpenLayers.Pixel(0, 0)
                },
                { //top-right
                    size: new OpenLayers.Size(22, 'auto'),
                    anchor: new OpenLayers.Bounds(null, 50, 0, 0),
                    position: new OpenLayers.Pixel(-1238, 0)
                },
                { //bottom-left
                    size: new OpenLayers.Size('auto', 19),
                    anchor: new OpenLayers.Bounds(0, 32, 22, null),
                    position: new OpenLayers.Pixel(0, -631)
                },
                { //bottom-right
                    size: new OpenLayers.Size(22, 19),
                    anchor: new OpenLayers.Bounds(null, 32, 0, null),
                    position: new OpenLayers.Pixel(-1238, -631)
                },
                { // stem
                    size: new OpenLayers.Size(81, 35),
                    anchor: new OpenLayers.Bounds(0, 0, null, null),
                    position: new OpenLayers.Pixel(-215, -687)
                }
            ]
        },
        "bl": {
            'offset': new OpenLayers.Pixel(45, 0),
            'padding': new OpenLayers.Bounds(8, 9, 8, 40),
            'blocks': [
                { // top-left
                    size: new OpenLayers.Size('auto', 'auto'),
                    anchor: new OpenLayers.Bounds(0, 21, 22, 32),
                    position: new OpenLayers.Pixel(0, 0)
                },
                { //top-right
                    size: new OpenLayers.Size(22, 'auto'),
                    anchor: new OpenLayers.Bounds(null, 21, 0, 32),
                    position: new OpenLayers.Pixel(-1238, 0)
                },
                { //bottom-left
                    size: new OpenLayers.Size('auto', 21),
                    anchor: new OpenLayers.Bounds(0, 0, 22, null),
                    position: new OpenLayers.Pixel(0, -629)
                },
                { //bottom-right
                    size: new OpenLayers.Size(22, 21),
                    anchor: new OpenLayers.Bounds(null, 0, 0, null),
                    position: new OpenLayers.Pixel(-1238, -629)
                },
                { // stem
                    size: new OpenLayers.Size(81, 33),
                    anchor: new OpenLayers.Bounds(null, null, 0, 0),
                    position: new OpenLayers.Pixel(-101, -674)
                }
            ]
        },
        "br": {
            'offset': new OpenLayers.Pixel(-44, 0),
            'padding': new OpenLayers.Bounds(8, 9, 8, 40),
            'blocks': [
                { // top-left
                    size: new OpenLayers.Size('auto', 'auto'),
                    anchor: new OpenLayers.Bounds(0, 21, 22, 32),
                    position: new OpenLayers.Pixel(0, 0)
                },
                { //top-right
                    size: new OpenLayers.Size(22, 'auto'),
                    anchor: new OpenLayers.Bounds(null, 21, 0, 32),
                    position: new OpenLayers.Pixel(-1238, 0)
                },
                { //bottom-left
                    size: new OpenLayers.Size('auto', 21),
                    anchor: new OpenLayers.Bounds(0, 0, 22, null),
                    position: new OpenLayers.Pixel(0, -629)
                },
                { //bottom-right
                    size: new OpenLayers.Size(22, 21),
                    anchor: new OpenLayers.Bounds(null, 0, 0, null),
                    position: new OpenLayers.Pixel(-1238, -629)
                },
                { // stem
                    size: new OpenLayers.Size(81, 33),
                    anchor: new OpenLayers.Bounds(0, null, null, 0),
                    position: new OpenLayers.Pixel(-311, -674)
                }
            ]
        }
    },

    /**
     * APIProperty: minSize
     * {<OpenLayers.Size>}
     */
    minSize: new OpenLayers.Size(105, 10),

    /**
     * APIProperty: maxSize
     * {<OpenLayers.Size>}
     */
    maxSize: new OpenLayers.Size(1200, 660),

    /** 
     * Constructor: OpenLayers.Popup.FramedCloud
     * 
     * Parameters:
     * id - {String}
     * lonlat - {<OpenLayers.LonLat>}
     * contentSize - {<OpenLayers.Size>}
     * contentHTML - {String}
     * anchor - {Object} Object to which we'll anchor the popup. Must expose 
     *     a 'size' (<OpenLayers.Size>) and 'offset' (<OpenLayers.Pixel>) 
     *     (Note that this is generally an <OpenLayers.Icon>).
     * closeBox - {Boolean}
     * closeBoxCallback - {Function} Function to be called on closeBox click.
     */
    initialize:function(id, lonlat, contentSize, contentHTML, anchor, closeBox, 
                        closeBoxCallback) {

        this.imageSrc = OpenLayers.Util.getImageLocation('cloud-popup-relative.png');
        OpenLayers.Popup.Framed.prototype.initialize.apply(this, arguments);
        this.contentDiv.className = this.contentDisplayClass;
    },

    CLASS_NAME: "OpenLayers.Popup.FramedCloud"
});
/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * Note:
 * This work draws heavily from the public domain JSON serializer/deserializer
 *     at http://www.json.org/json.js. Rewritten so that it doesn't modify
 *     basic data prototypes.
 */

/**
 * @requires OpenLayers/Format.js
 */

/**
 * Class: OpenLayers.Format.JSON
 * A parser to read/write JSON safely.  Create a new instance with the
 *     <OpenLayers.Format.JSON> constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Format>
 */
OpenLayers.Format.JSON = OpenLayers.Class(OpenLayers.Format, {
    
    /**
     * APIProperty: indent
     * {String} For "pretty" printing, the indent string will be used once for
     *     each indentation level.
     */
    indent: "    ",
    
    /**
     * APIProperty: space
     * {String} For "pretty" printing, the space string will be used after
     *     the ":" separating a name/value pair.
     */
    space: " ",
    
    /**
     * APIProperty: newline
     * {String} For "pretty" printing, the newline string will be used at the
     *     end of each name/value pair or array item.
     */
    newline: "\n",
    
    /**
     * Property: level
     * {Integer} For "pretty" printing, this is incremented/decremented during
     *     serialization.
     */
    level: 0,

    /**
     * Property: pretty
     * {Boolean} Serialize with extra whitespace for structure.  This is set
     *     by the <write> method.
     */
    pretty: false,

    /**
     * Property: nativeJSON
     * {Boolean} Does the browser support native json?
     */
    nativeJSON: (function() {
        return !!(window.JSON && typeof JSON.parse == "function" && typeof JSON.stringify == "function");
    })(),

    /**
     * Constructor: OpenLayers.Format.JSON
     * Create a new parser for JSON.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */

    /**
     * APIMethod: read
     * Deserialize a json string.
     *
     * Parameters:
     * json - {String} A JSON string
     * filter - {Function} A function which will be called for every key and
     *     value at every level of the final result. Each value will be
     *     replaced by the result of the filter function. This can be used to
     *     reform generic objects into instances of classes, or to transform
     *     date strings into Date objects.
     *     
     * Returns:
     * {Object} An object, array, string, or number .
     */
    read: function(json, filter) {
        var object;
        if (this.nativeJSON) {
            object = JSON.parse(json, filter);
        } else try {
            /**
             * Parsing happens in three stages. In the first stage, we run the
             *     text against a regular expression which looks for non-JSON
             *     characters. We are especially concerned with '()' and 'new'
             *     because they can cause invocation, and '=' because it can
             *     cause mutation. But just to be safe, we will reject all
             *     unexpected characters.
             */
            if (/^[\],:{}\s]*$/.test(json.replace(/\\["\\\/bfnrtu]/g, '@').
                                replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
                                replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                /**
                 * In the second stage we use the eval function to compile the
                 *     text into a JavaScript structure. The '{' operator is
                 *     subject to a syntactic ambiguity in JavaScript - it can
                 *     begin a block or an object literal. We wrap the text in
                 *     parens to eliminate the ambiguity.
                 */
                object = eval('(' + json + ')');

                /**
                 * In the optional third stage, we recursively walk the new
                 *     structure, passing each name/value pair to a filter
                 *     function for possible transformation.
                 */
                if(typeof filter === 'function') {
                    function walk(k, v) {
                        if(v && typeof v === 'object') {
                            for(var i in v) {
                                if(v.hasOwnProperty(i)) {
                                    v[i] = walk(i, v[i]);
                                }
                            }
                        }
                        return filter(k, v);
                    }
                    object = walk('', object);
                }
            }
        } catch(e) {
            // Fall through if the regexp test fails.
        }

        if(this.keepData) {
            this.data = object;
        }

        return object;
    },

    /**
     * APIMethod: write
     * Serialize an object into a JSON string.
     *
     * Parameters:
     * value - {String} The object, array, string, number, boolean or date
     *     to be serialized.
     * pretty - {Boolean} Structure the output with newlines and indentation.
     *     Default is false.
     *
     * Returns:
     * {String} The JSON string representation of the input value.
     */
    write: function(value, pretty) {
        this.pretty = !!pretty;
        var json = null;
        var type = typeof value;
        if(this.serialize[type]) {
            try {
                json = (!this.pretty && this.nativeJSON) ?
                    JSON.stringify(value) :
                    this.serialize[type].apply(this, [value]);
            } catch(err) {
                OpenLayers.Console.error("Trouble serializing: " + err);
            }
        }
        return json;
    },
    
    /**
     * Method: writeIndent
     * Output an indentation string depending on the indentation level.
     *
     * Returns:
     * {String} An appropriate indentation string.
     */
    writeIndent: function() {
        var pieces = [];
        if(this.pretty) {
            for(var i=0; i<this.level; ++i) {
                pieces.push(this.indent);
            }
        }
        return pieces.join('');
    },
    
    /**
     * Method: writeNewline
     * Output a string representing a newline if in pretty printing mode.
     *
     * Returns:
     * {String} A string representing a new line.
     */
    writeNewline: function() {
        return (this.pretty) ? this.newline : '';
    },
    
    /**
     * Method: writeSpace
     * Output a string representing a space if in pretty printing mode.
     *
     * Returns:
     * {String} A space.
     */
    writeSpace: function() {
        return (this.pretty) ? this.space : '';
    },

    /**
     * Property: serialize
     * Object with properties corresponding to the serializable data types.
     *     Property values are functions that do the actual serializing.
     */
    serialize: {
        /**
         * Method: serialize.object
         * Transform an object into a JSON string.
         *
         * Parameters:
         * object - {Object} The object to be serialized.
         * 
         * Returns:
         * {String} A JSON string representing the object.
         */
        'object': function(object) {
            // three special objects that we want to treat differently
            if(object == null) {
                return "null";
            }
            if(object.constructor == Date) {
                return this.serialize.date.apply(this, [object]);
            }
            if(object.constructor == Array) {
                return this.serialize.array.apply(this, [object]);
            }
            var pieces = ['{'];
            this.level += 1;
            var key, keyJSON, valueJSON;
            
            var addComma = false;
            for(key in object) {
                if(object.hasOwnProperty(key)) {
                    // recursive calls need to allow for sub-classing
                    keyJSON = OpenLayers.Format.JSON.prototype.write.apply(this,
                                                    [key, this.pretty]);
                    valueJSON = OpenLayers.Format.JSON.prototype.write.apply(this,
                                                    [object[key], this.pretty]);
                    if(keyJSON != null && valueJSON != null) {
                        if(addComma) {
                            pieces.push(',');
                        }
                        pieces.push(this.writeNewline(), this.writeIndent(),
                                    keyJSON, ':', this.writeSpace(), valueJSON);
                        addComma = true;
                    }
                }
            }
            
            this.level -= 1;
            pieces.push(this.writeNewline(), this.writeIndent(), '}');
            return pieces.join('');
        },
        
        /**
         * Method: serialize.array
         * Transform an array into a JSON string.
         *
         * Parameters:
         * array - {Array} The array to be serialized
         * 
         * Returns:
         * {String} A JSON string representing the array.
         */
        'array': function(array) {
            var json;
            var pieces = ['['];
            this.level += 1;
    
            for(var i=0, len=array.length; i<len; ++i) {
                // recursive calls need to allow for sub-classing
                json = OpenLayers.Format.JSON.prototype.write.apply(this,
                                                    [array[i], this.pretty]);
                if(json != null) {
                    if(i > 0) {
                        pieces.push(',');
                    }
                    pieces.push(this.writeNewline(), this.writeIndent(), json);
                }
            }

            this.level -= 1;    
            pieces.push(this.writeNewline(), this.writeIndent(), ']');
            return pieces.join('');
        },
        
        /**
         * Method: serialize.string
         * Transform a string into a JSON string.
         *
         * Parameters:
         * string - {String} The string to be serialized
         * 
         * Returns:
         * {String} A JSON string representing the string.
         */
        'string': function(string) {
            // If the string contains no control characters, no quote characters, and no
            // backslash characters, then we can simply slap some quotes around it.
            // Otherwise we must also replace the offending characters with safe
            // sequences.    
            var m = {
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"' : '\\"',
                '\\': '\\\\'
            };
            if(/["\\\x00-\x1f]/.test(string)) {
                return '"' + string.replace(/([\x00-\x1f\\"])/g, function(a, b) {
                    var c = m[b];
                    if(c) {
                        return c;
                    }
                    c = b.charCodeAt();
                    return '\\u00' +
                        Math.floor(c / 16).toString(16) +
                        (c % 16).toString(16);
                }) + '"';
            }
            return '"' + string + '"';
        },

        /**
         * Method: serialize.number
         * Transform a number into a JSON string.
         *
         * Parameters:
         * number - {Number} The number to be serialized.
         *
         * Returns:
         * {String} A JSON string representing the number.
         */
        'number': function(number) {
            return isFinite(number) ? String(number) : "null";
        },
        
        /**
         * Method: serialize.boolean
         * Transform a boolean into a JSON string.
         *
         * Parameters:
         * bool - {Boolean} The boolean to be serialized.
         * 
         * Returns:
         * {String} A JSON string representing the boolean.
         */
        'boolean': function(bool) {
            return String(bool);
        },
        
        /**
         * Method: serialize.object
         * Transform a date into a JSON string.
         *
         * Parameters:
         * date - {Date} The date to be serialized.
         * 
         * Returns:
         * {String} A JSON string representing the date.
         */
        'date': function(date) {    
            function format(number) {
                // Format integers to have at least two digits.
                return (number < 10) ? '0' + number : number;
            }
            return '"' + date.getFullYear() + '-' +
                    format(date.getMonth() + 1) + '-' +
                    format(date.getDate()) + 'T' +
                    format(date.getHours()) + ':' +
                    format(date.getMinutes()) + ':' +
                    format(date.getSeconds()) + '"';
        }
    },

    CLASS_NAME: "OpenLayers.Format.JSON" 

});     
/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format/JSON.js
 * @requires OpenLayers/Feature/Vector.js
 * @requires OpenLayers/Geometry/Point.js
 * @requires OpenLayers/Geometry/MultiPoint.js
 * @requires OpenLayers/Geometry/LineString.js
 * @requires OpenLayers/Geometry/MultiLineString.js
 * @requires OpenLayers/Geometry/Polygon.js
 * @requires OpenLayers/Geometry/MultiPolygon.js
 * @requires OpenLayers/Console.js
 */

/**
 * Class: OpenLayers.Format.GeoJSON
 * Read and write GeoJSON. Create a new parser with the
 *     <OpenLayers.Format.GeoJSON> constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Format.JSON>
 */
OpenLayers.Format.GeoJSON = OpenLayers.Class(OpenLayers.Format.JSON, {

    /**
     * APIProperty: ignoreExtraDims
     * {Boolean} Ignore dimensions higher than 2 when reading geometry
     * coordinates.
     */ 
    ignoreExtraDims: false,
    
    /**
     * Constructor: OpenLayers.Format.GeoJSON
     * Create a new parser for GeoJSON.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */

    /**
     * APIMethod: read
     * Deserialize a GeoJSON string.
     *
     * Parameters:
     * json - {String} A GeoJSON string
     * type - {String} Optional string that determines the structure of
     *     the output.  Supported values are "Geometry", "Feature", and
     *     "FeatureCollection".  If absent or null, a default of
     *     "FeatureCollection" is assumed.
     * filter - {Function} A function which will be called for every key and
     *     value at every level of the final result. Each value will be
     *     replaced by the result of the filter function. This can be used to
     *     reform generic objects into instances of classes, or to transform
     *     date strings into Date objects.
     *
     * Returns: 
     * {Object} The return depends on the value of the type argument. If type
     *     is "FeatureCollection" (the default), the return will be an array
     *     of <OpenLayers.Feature.Vector>. If type is "Geometry", the input json
     *     must represent a single geometry, and the return will be an
     *     <OpenLayers.Geometry>.  If type is "Feature", the input json must
     *     represent a single feature, and the return will be an
     *     <OpenLayers.Feature.Vector>.
     */
    read: function(json, type, filter) {
        type = (type) ? type : "FeatureCollection";
        var results = null;
        var obj = null;
        if (typeof json == "string") {
            obj = OpenLayers.Format.JSON.prototype.read.apply(this,
                                                              [json, filter]);
        } else { 
            obj = json;
        }    
        if(!obj) {
            OpenLayers.Console.error("Bad JSON: " + json);
        } else if(typeof(obj.type) != "string") {
            OpenLayers.Console.error("Bad GeoJSON - no type: " + json);
        } else if(this.isValidType(obj, type)) {
            switch(type) {
                case "Geometry":
                    try {
                        results = this.parseGeometry(obj);
                    } catch(err) {
                        OpenLayers.Console.error(err);
                    }
                    break;
                case "Feature":
                    try {
                        results = this.parseFeature(obj);
                        results.type = "Feature";
                    } catch(err) {
                        OpenLayers.Console.error(err);
                    }
                    break;
                case "FeatureCollection":
                    // for type FeatureCollection, we allow input to be any type
                    results = [];
                    switch(obj.type) {
                        case "Feature":
                            try {
                                results.push(this.parseFeature(obj));
                            } catch(err) {
                                results = null;
                                OpenLayers.Console.error(err);
                            }
                            break;
                        case "FeatureCollection":
                            for(var i=0, len=obj.features.length; i<len; ++i) {
                                try {
                                    results.push(this.parseFeature(obj.features[i]));
                                } catch(err) {
                                    results = null;
                                    OpenLayers.Console.error(err);
                                }
                            }
                            break;
                        default:
                            try {
                                var geom = this.parseGeometry(obj);
                                results.push(new OpenLayers.Feature.Vector(geom));
                            } catch(err) {
                                results = null;
                                OpenLayers.Console.error(err);
                            }
                    }
                break;
            }
        }
        return results;
    },
    
    /**
     * Method: isValidType
     * Check if a GeoJSON object is a valid representative of the given type.
     *
     * Returns:
     * {Boolean} The object is valid GeoJSON object of the given type.
     */
    isValidType: function(obj, type) {
        var valid = false;
        switch(type) {
            case "Geometry":
                if(OpenLayers.Util.indexOf(
                    ["Point", "MultiPoint", "LineString", "MultiLineString",
                     "Polygon", "MultiPolygon", "Box", "GeometryCollection"],
                    obj.type) == -1) {
                    // unsupported geometry type
                    OpenLayers.Console.error("Unsupported geometry type: " +
                                              obj.type);
                } else {
                    valid = true;
                }
                break;
            case "FeatureCollection":
                // allow for any type to be converted to a feature collection
                valid = true;
                break;
            default:
                // for Feature types must match
                if(obj.type == type) {
                    valid = true;
                } else {
                    OpenLayers.Console.error("Cannot convert types from " +
                                              obj.type + " to " + type);
                }
        }
        return valid;
    },
    
    /**
     * Method: parseFeature
     * Convert a feature object from GeoJSON into an
     *     <OpenLayers.Feature.Vector>.
     *
     * Parameters:
     * obj - {Object} An object created from a GeoJSON object
     *
     * Returns:
     * {<OpenLayers.Feature.Vector>} A feature.
     */
    parseFeature: function(obj) {
        var feature, geometry, attributes, bbox;
        attributes = (obj.properties) ? obj.properties : {};
        bbox = (obj.geometry && obj.geometry.bbox) || obj.bbox;
        try {
            geometry = this.parseGeometry(obj.geometry);
        } catch(err) {
            // deal with bad geometries
            throw err;
        }
        feature = new OpenLayers.Feature.Vector(geometry, attributes);
        if(bbox) {
            feature.bounds = OpenLayers.Bounds.fromArray(bbox);
        }
        if(obj.id) {
            feature.fid = obj.id;
        }
        return feature;
    },
    
    /**
     * Method: parseGeometry
     * Convert a geometry object from GeoJSON into an <OpenLayers.Geometry>.
     *
     * Parameters:
     * obj - {Object} An object created from a GeoJSON object
     *
     * Returns: 
     * {<OpenLayers.Geometry>} A geometry.
     */
    parseGeometry: function(obj) {
        if (obj == null) {
            return null;
        }
        var geometry, collection = false;
        if(obj.type == "GeometryCollection") {
            if(!(OpenLayers.Util.isArray(obj.geometries))) {
                throw "GeometryCollection must have geometries array: " + obj;
            }
            var numGeom = obj.geometries.length;
            var components = new Array(numGeom);
            for(var i=0; i<numGeom; ++i) {
                components[i] = this.parseGeometry.apply(
                    this, [obj.geometries[i]]
                );
            }
            geometry = new OpenLayers.Geometry.Collection(components);
            collection = true;
        } else {
            if(!(OpenLayers.Util.isArray(obj.coordinates))) {
                throw "Geometry must have coordinates array: " + obj;
            }
            if(!this.parseCoords[obj.type.toLowerCase()]) {
                throw "Unsupported geometry type: " + obj.type;
            }
            try {
                geometry = this.parseCoords[obj.type.toLowerCase()].apply(
                    this, [obj.coordinates]
                );
            } catch(err) {
                // deal with bad coordinates
                throw err;
            }
        }
        // We don't reproject collections because the children are reprojected
        // for us when they are created.
        if (this.internalProjection && this.externalProjection && !collection) {
            geometry.transform(this.externalProjection, 
                               this.internalProjection); 
        }                       
        return geometry;
    },
    
    /**
     * Property: parseCoords
     * Object with properties corresponding to the GeoJSON geometry types.
     *     Property values are functions that do the actual parsing.
     */
    parseCoords: {
        /**
         * Method: parseCoords.point
         * Convert a coordinate array from GeoJSON into an
         *     <OpenLayers.Geometry>.
         *
         * Parameters:
         * array - {Object} The coordinates array from the GeoJSON fragment.
         *
         * Returns:
         * {<OpenLayers.Geometry>} A geometry.
         */
        "point": function(array) {
            if (this.ignoreExtraDims == false && 
                  array.length != 2) {
                    throw "Only 2D points are supported: " + array;
            }
            return new OpenLayers.Geometry.Point(array[0], array[1]);
        },
        
        /**
         * Method: parseCoords.multipoint
         * Convert a coordinate array from GeoJSON into an
         *     <OpenLayers.Geometry>.
         *
         * Parameters:
         * array {Object} The coordinates array from the GeoJSON fragment.
         *
         * Returns:
         * {<OpenLayers.Geometry>} A geometry.
         */
        "multipoint": function(array) {
            var points = [];
            var p = null;
            for(var i=0, len=array.length; i<len; ++i) {
                try {
                    p = this.parseCoords["point"].apply(this, [array[i]]);
                } catch(err) {
                    throw err;
                }
                points.push(p);
            }
            return new OpenLayers.Geometry.MultiPoint(points);
        },

        /**
         * Method: parseCoords.linestring
         * Convert a coordinate array from GeoJSON into an
         *     <OpenLayers.Geometry>.
         *
         * Parameters:
         * array - {Object} The coordinates array from the GeoJSON fragment.
         *
         * Returns:
         * {<OpenLayers.Geometry>} A geometry.
         */
        "linestring": function(array) {
            var points = [];
            var p = null;
            for(var i=0, len=array.length; i<len; ++i) {
                try {
                    p = this.parseCoords["point"].apply(this, [array[i]]);
                } catch(err) {
                    throw err;
                }
                points.push(p);
            }
            return new OpenLayers.Geometry.LineString(points);
        },
        
        /**
         * Method: parseCoords.multilinestring
         * Convert a coordinate array from GeoJSON into an
         *     <OpenLayers.Geometry>.
         *
         * Parameters:
         * array - {Object} The coordinates array from the GeoJSON fragment.
         *
         * Returns:
         * {<OpenLayers.Geometry>} A geometry.
         */
        "multilinestring": function(array) {
            var lines = [];
            var l = null;
            for(var i=0, len=array.length; i<len; ++i) {
                try {
                    l = this.parseCoords["linestring"].apply(this, [array[i]]);
                } catch(err) {
                    throw err;
                }
                lines.push(l);
            }
            return new OpenLayers.Geometry.MultiLineString(lines);
        },
        
        /**
         * Method: parseCoords.polygon
         * Convert a coordinate array from GeoJSON into an
         *     <OpenLayers.Geometry>.
         *
         * Returns:
         * {<OpenLayers.Geometry>} A geometry.
         */
        "polygon": function(array) {
            var rings = [];
            var r, l;
            for(var i=0, len=array.length; i<len; ++i) {
                try {
                    l = this.parseCoords["linestring"].apply(this, [array[i]]);
                } catch(err) {
                    throw err;
                }
                r = new OpenLayers.Geometry.LinearRing(l.components);
                rings.push(r);
            }
            return new OpenLayers.Geometry.Polygon(rings);
        },

        /**
         * Method: parseCoords.multipolygon
         * Convert a coordinate array from GeoJSON into an
         *     <OpenLayers.Geometry>.
         *
         * Parameters:
         * array - {Object} The coordinates array from the GeoJSON fragment.
         *
         * Returns:
         * {<OpenLayers.Geometry>} A geometry.
         */
        "multipolygon": function(array) {
            var polys = [];
            var p = null;
            for(var i=0, len=array.length; i<len; ++i) {
                try {
                    p = this.parseCoords["polygon"].apply(this, [array[i]]);
                } catch(err) {
                    throw err;
                }
                polys.push(p);
            }
            return new OpenLayers.Geometry.MultiPolygon(polys);
        },

        /**
         * Method: parseCoords.box
         * Convert a coordinate array from GeoJSON into an
         *     <OpenLayers.Geometry>.
         *
         * Parameters:
         * array - {Object} The coordinates array from the GeoJSON fragment.
         *
         * Returns:
         * {<OpenLayers.Geometry>} A geometry.
         */
        "box": function(array) {
            if(array.length != 2) {
                throw "GeoJSON box coordinates must have 2 elements";
            }
            return new OpenLayers.Geometry.Polygon([
                new OpenLayers.Geometry.LinearRing([
                    new OpenLayers.Geometry.Point(array[0][0], array[0][1]),
                    new OpenLayers.Geometry.Point(array[1][0], array[0][1]),
                    new OpenLayers.Geometry.Point(array[1][0], array[1][1]),
                    new OpenLayers.Geometry.Point(array[0][0], array[1][1]),
                    new OpenLayers.Geometry.Point(array[0][0], array[0][1])
                ])
            ]);
        }

    },

    /**
     * APIMethod: write
     * Serialize a feature, geometry, array of features into a GeoJSON string.
     *
     * Parameters:
     * obj - {Object} An <OpenLayers.Feature.Vector>, <OpenLayers.Geometry>,
     *     or an array of features.
     * pretty - {Boolean} Structure the output with newlines and indentation.
     *     Default is false.
     *
     * Returns:
     * {String} The GeoJSON string representation of the input geometry,
     *     features, or array of features.
     */
    write: function(obj, pretty) {
        var geojson = {
            "type": null
        };
        if(OpenLayers.Util.isArray(obj)) {
            geojson.type = "FeatureCollection";
            var numFeatures = obj.length;
            geojson.features = new Array(numFeatures);
            for(var i=0; i<numFeatures; ++i) {
                var element = obj[i];
                if(!element instanceof OpenLayers.Feature.Vector) {
                    var msg = "FeatureCollection only supports collections " +
                              "of features: " + element;
                    throw msg;
                }
                geojson.features[i] = this.extract.feature.apply(
                    this, [element]
                );
            }
        } else if (obj.CLASS_NAME.indexOf("OpenLayers.Geometry") == 0) {
            geojson = this.extract.geometry.apply(this, [obj]);
        } else if (obj instanceof OpenLayers.Feature.Vector) {
            geojson = this.extract.feature.apply(this, [obj]);
            if(obj.layer && obj.layer.projection) {
                geojson.crs = this.createCRSObject(obj);
            }
        }
        return OpenLayers.Format.JSON.prototype.write.apply(this,
                                                            [geojson, pretty]);
    },

    /**
     * Method: createCRSObject
     * Create the CRS object for an object.
     *
     * Parameters:
     * object - {<OpenLayers.Feature.Vector>} 
     *
     * Returns:
     * {Object} An object which can be assigned to the crs property
     * of a GeoJSON object.
     */
    createCRSObject: function(object) {
       var proj = object.layer.projection.toString();
       var crs = {};
       if (proj.match(/epsg:/i)) {
           var code = parseInt(proj.substring(proj.indexOf(":") + 1));
           if (code == 4326) {
               crs = {
                   "type": "name",
                   "properties": {
                       "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
                   }
               };
           } else {    
               crs = {
                   "type": "name",
                   "properties": {
                       "name": "EPSG:" + code
                   }
               };
           }    
       }
       return crs;
    },
    
    /**
     * Property: extract
     * Object with properties corresponding to the GeoJSON types.
     *     Property values are functions that do the actual value extraction.
     */
    extract: {
        /**
         * Method: extract.feature
         * Return a partial GeoJSON object representing a single feature.
         *
         * Parameters:
         * feature - {<OpenLayers.Feature.Vector>}
         *
         * Returns:
         * {Object} An object representing the point.
         */
        'feature': function(feature) {
            var geom = this.extract.geometry.apply(this, [feature.geometry]);
            var json = {
                "type": "Feature",
                "properties": feature.attributes,
                "geometry": geom
            };
            if (feature.fid != null) {
                json.id = feature.fid;
            }
            return json;
        },
        
        /**
         * Method: extract.geometry
         * Return a GeoJSON object representing a single geometry.
         *
         * Parameters:
         * geometry - {<OpenLayers.Geometry>}
         *
         * Returns:
         * {Object} An object representing the geometry.
         */
        'geometry': function(geometry) {
            if (geometry == null) {
                return null;
            }
            if (this.internalProjection && this.externalProjection) {
                geometry = geometry.clone();
                geometry.transform(this.internalProjection, 
                                   this.externalProjection);
            }                       
            var geometryType = geometry.CLASS_NAME.split('.')[2];
            var data = this.extract[geometryType.toLowerCase()].apply(this, [geometry]);
            var json;
            if(geometryType == "Collection") {
                json = {
                    "type": "GeometryCollection",
                    "geometries": data
                };
            } else {
                json = {
                    "type": geometryType,
                    "coordinates": data
                };
            }
            
            return json;
        },

        /**
         * Method: extract.point
         * Return an array of coordinates from a point.
         *
         * Parameters:
         * point - {<OpenLayers.Geometry.Point>}
         *
         * Returns: 
         * {Array} An array of coordinates representing the point.
         */
        'point': function(point) {
            return [point.x, point.y];
        },

        /**
         * Method: extract.multipoint
         * Return an array of point coordinates from a multipoint.
         *
         * Parameters:
         * multipoint - {<OpenLayers.Geometry.MultiPoint>}
         *
         * Returns:
         * {Array} An array of point coordinate arrays representing
         *     the multipoint.
         */
        'multipoint': function(multipoint) {
            var array = [];
            for(var i=0, len=multipoint.components.length; i<len; ++i) {
                array.push(this.extract.point.apply(this, [multipoint.components[i]]));
            }
            return array;
        },
        
        /**
         * Method: extract.linestring
         * Return an array of coordinate arrays from a linestring.
         *
         * Parameters:
         * linestring - {<OpenLayers.Geometry.LineString>}
         *
         * Returns:
         * {Array} An array of coordinate arrays representing
         *     the linestring.
         */
        'linestring': function(linestring) {
            var array = [];
            for(var i=0, len=linestring.components.length; i<len; ++i) {
                array.push(this.extract.point.apply(this, [linestring.components[i]]));
            }
            return array;
        },

        /**
         * Method: extract.multilinestring
         * Return an array of linestring arrays from a linestring.
         * 
         * Parameters:
         * multilinestring - {<OpenLayers.Geometry.MultiLineString>}
         * 
         * Returns:
         * {Array} An array of linestring arrays representing
         *     the multilinestring.
         */
        'multilinestring': function(multilinestring) {
            var array = [];
            for(var i=0, len=multilinestring.components.length; i<len; ++i) {
                array.push(this.extract.linestring.apply(this, [multilinestring.components[i]]));
            }
            return array;
        },
        
        /**
         * Method: extract.polygon
         * Return an array of linear ring arrays from a polygon.
         *
         * Parameters:
         * polygon - {<OpenLayers.Geometry.Polygon>}
         * 
         * Returns:
         * {Array} An array of linear ring arrays representing the polygon.
         */
        'polygon': function(polygon) {
            var array = [];
            for(var i=0, len=polygon.components.length; i<len; ++i) {
                array.push(this.extract.linestring.apply(this, [polygon.components[i]]));
            }
            return array;
        },

        /**
         * Method: extract.multipolygon
         * Return an array of polygon arrays from a multipolygon.
         * 
         * Parameters:
         * multipolygon - {<OpenLayers.Geometry.MultiPolygon>}
         * 
         * Returns:
         * {Array} An array of polygon arrays representing
         *     the multipolygon
         */
        'multipolygon': function(multipolygon) {
            var array = [];
            for(var i=0, len=multipolygon.components.length; i<len; ++i) {
                array.push(this.extract.polygon.apply(this, [multipolygon.components[i]]));
            }
            return array;
        },
        
        /**
         * Method: extract.collection
         * Return an array of geometries from a geometry collection.
         * 
         * Parameters:
         * collection - {<OpenLayers.Geometry.Collection>}
         * 
         * Returns:
         * {Array} An array of geometry objects representing the geometry
         *     collection.
         */
        'collection': function(collection) {
            var len = collection.components.length;
            var array = new Array(len);
            for(var i=0; i<len; ++i) {
                array[i] = this.extract.geometry.apply(
                    this, [collection.components[i]]
                );
            }
            return array;
        }
        

    },

    CLASS_NAME: "OpenLayers.Format.GeoJSON" 

});     
/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Format.js
 * @requires OpenLayers/Feature/Vector.js
 */

/**
 * Class: OpenLayers.Format.WKT
 * Class for reading and writing Well-Known Text.  Create a new instance
 * with the <OpenLayers.Format.WKT> constructor.
 * 
 * Inherits from:
 *  - <OpenLayers.Format>
 */
OpenLayers.Format.WKT = OpenLayers.Class(OpenLayers.Format, {
    
    /**
     * Constructor: OpenLayers.Format.WKT
     * Create a new parser for WKT
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *           this instance
     *
     * Returns:
     * {<OpenLayers.Format.WKT>} A new WKT parser.
     */
    initialize: function(options) {
        this.regExes = {
            'typeStr': /^\s*(\w+)\s*\(\s*(.*)\s*\)\s*$/,
            'spaces': /\s+/,
            'parenComma': /\)\s*,\s*\(/,
            'doubleParenComma': /\)\s*\)\s*,\s*\(\s*\(/,  // can't use {2} here
            'trimParens': /^\s*\(?(.*?)\)?\s*$/
        };
        OpenLayers.Format.prototype.initialize.apply(this, [options]);
    },

    /**
     * Method: read
     * Deserialize a WKT string and return a vector feature or an
     * array of vector features.  Supports WKT for POINT, MULTIPOINT,
     * LINESTRING, MULTILINESTRING, POLYGON, MULTIPOLYGON, and
     * GEOMETRYCOLLECTION.
     *
     * Parameters:
     * wkt - {String} A WKT string
     *
     * Returns:
     * {<OpenLayers.Feature.Vector>|Array} A feature or array of features for
     * GEOMETRYCOLLECTION WKT.
     */
    read: function(wkt) {
        var features, type, str;
        wkt = wkt.replace(/[\n\r]/g, " ");
        var matches = this.regExes.typeStr.exec(wkt);
        if(matches) {
            type = matches[1].toLowerCase();
            str = matches[2];
            if(this.parse[type]) {
                features = this.parse[type].apply(this, [str]);
            }
            if (this.internalProjection && this.externalProjection) {
                if (features && 
                    features.CLASS_NAME == "OpenLayers.Feature.Vector") {
                    features.geometry.transform(this.externalProjection,
                                                this.internalProjection);
                } else if (features &&
                           type != "geometrycollection" &&
                           typeof features == "object") {
                    for (var i=0, len=features.length; i<len; i++) {
                        var component = features[i];
                        component.geometry.transform(this.externalProjection,
                                                     this.internalProjection);
                    }
                }
            }
        }    
        return features;
    },

    /**
     * Method: write
     * Serialize a feature or array of features into a WKT string.
     *
     * Parameters:
     * features - {<OpenLayers.Feature.Vector>|Array} A feature or array of
     *            features
     *
     * Returns:
     * {String} The WKT string representation of the input geometries
     */
    write: function(features) {
        var collection, geometry, type, data, isCollection;
        if (features.constructor == Array) {
            collection = features;
            isCollection = true;
        } else {
            collection = [features];
            isCollection = false;
        }
        var pieces = [];
        if (isCollection) {
            pieces.push('GEOMETRYCOLLECTION(');
        }
        for (var i=0, len=collection.length; i<len; ++i) {
            if (isCollection && i>0) {
                pieces.push(',');
            }
            geometry = collection[i].geometry;
            pieces.push(this.extractGeometry(geometry));
        }
        if (isCollection) {
            pieces.push(')');
        }
        return pieces.join('');
    },

    /**
     * Method: extractGeometry
     * Entry point to construct the WKT for a single Geometry object.
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry.Geometry>}
     *
     * Returns:
     * {String} A WKT string of representing the geometry
     */
    extractGeometry: function(geometry) {
        var type = geometry.CLASS_NAME.split('.')[2].toLowerCase();
        if (!this.extract[type]) {
            return null;
        }
        if (this.internalProjection && this.externalProjection) {
            geometry = geometry.clone();
            geometry.transform(this.internalProjection, this.externalProjection);
        }                       
        var wktType = type == 'collection' ? 'GEOMETRYCOLLECTION' : type.toUpperCase();
        var data = wktType + '(' + this.extract[type].apply(this, [geometry]) + ')';
        return data;
    },
    
    /**
     * Object with properties corresponding to the geometry types.
     * Property values are functions that do the actual data extraction.
     */
    extract: {
        /**
         * Return a space delimited string of point coordinates.
         * @param {OpenLayers.Geometry.Point} point
         * @returns {String} A string of coordinates representing the point
         */
        'point': function(point) {
            return point.x + ' ' + point.y;
        },

        /**
         * Return a comma delimited string of point coordinates from a multipoint.
         * @param {OpenLayers.Geometry.MultiPoint} multipoint
         * @returns {String} A string of point coordinate strings representing
         *                  the multipoint
         */
        'multipoint': function(multipoint) {
            var array = [];
            for(var i=0, len=multipoint.components.length; i<len; ++i) {
                array.push('(' +
                           this.extract.point.apply(this, [multipoint.components[i]]) +
                           ')');
            }
            return array.join(',');
        },
        
        /**
         * Return a comma delimited string of point coordinates from a line.
         * @param {OpenLayers.Geometry.LineString} linestring
         * @returns {String} A string of point coordinate strings representing
         *                  the linestring
         */
        'linestring': function(linestring) {
            var array = [];
            for(var i=0, len=linestring.components.length; i<len; ++i) {
                array.push(this.extract.point.apply(this, [linestring.components[i]]));
            }
            return array.join(',');
        },

        /**
         * Return a comma delimited string of linestring strings from a multilinestring.
         * @param {OpenLayers.Geometry.MultiLineString} multilinestring
         * @returns {String} A string of of linestring strings representing
         *                  the multilinestring
         */
        'multilinestring': function(multilinestring) {
            var array = [];
            for(var i=0, len=multilinestring.components.length; i<len; ++i) {
                array.push('(' +
                           this.extract.linestring.apply(this, [multilinestring.components[i]]) +
                           ')');
            }
            return array.join(',');
        },
        
        /**
         * Return a comma delimited string of linear ring arrays from a polygon.
         * @param {OpenLayers.Geometry.Polygon} polygon
         * @returns {String} An array of linear ring arrays representing the polygon
         */
        'polygon': function(polygon) {
            var array = [];
            for(var i=0, len=polygon.components.length; i<len; ++i) {
                array.push('(' +
                           this.extract.linestring.apply(this, [polygon.components[i]]) +
                           ')');
            }
            return array.join(',');
        },

        /**
         * Return an array of polygon arrays from a multipolygon.
         * @param {OpenLayers.Geometry.MultiPolygon} multipolygon
         * @returns {String} An array of polygon arrays representing
         *                  the multipolygon
         */
        'multipolygon': function(multipolygon) {
            var array = [];
            for(var i=0, len=multipolygon.components.length; i<len; ++i) {
                array.push('(' +
                           this.extract.polygon.apply(this, [multipolygon.components[i]]) +
                           ')');
            }
            return array.join(',');
        },

        /**
         * Return the WKT portion between 'GEOMETRYCOLLECTION(' and ')' for an <OpenLayers.Geometry.Collection>
         * @param {OpenLayers.Geometry.Collection} collection
         * @returns {String} internal WKT representation of the collection
         */
        'collection': function(collection) {
            var array = [];
            for(var i=0, len=collection.components.length; i<len; ++i) {
                array.push(this.extractGeometry.apply(this, [collection.components[i]]));
            }
            return array.join(',');
        }

    },

    /**
     * Object with properties corresponding to the geometry types.
     * Property values are functions that do the actual parsing.
     */
    parse: {
        /**
         * Return point feature given a point WKT fragment.
         * @param {String} str A WKT fragment representing the point
         * @returns {OpenLayers.Feature.Vector} A point feature
         * @private
         */
        'point': function(str) {
            var coords = OpenLayers.String.trim(str).split(this.regExes.spaces);
            return new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.Point(coords[0], coords[1])
            );
        },

        /**
         * Return a multipoint feature given a multipoint WKT fragment.
         * @param {String} str A WKT fragment representing the multipoint
         * @returns {OpenLayers.Feature.Vector} A multipoint feature
         * @private
         */
        'multipoint': function(str) {
            var point;
            var points = OpenLayers.String.trim(str).split(',');
            var components = [];
            for(var i=0, len=points.length; i<len; ++i) {
                point = points[i].replace(this.regExes.trimParens, '$1');
                components.push(this.parse.point.apply(this, [point]).geometry);
            }
            return new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.MultiPoint(components)
            );
        },
        
        /**
         * Return a linestring feature given a linestring WKT fragment.
         * @param {String} str A WKT fragment representing the linestring
         * @returns {OpenLayers.Feature.Vector} A linestring feature
         * @private
         */
        'linestring': function(str) {
            var points = OpenLayers.String.trim(str).split(',');
            var components = [];
            for(var i=0, len=points.length; i<len; ++i) {
                components.push(this.parse.point.apply(this, [points[i]]).geometry);
            }
            return new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.LineString(components)
            );
        },

        /**
         * Return a multilinestring feature given a multilinestring WKT fragment.
         * @param {String} str A WKT fragment representing the multilinestring
         * @returns {OpenLayers.Feature.Vector} A multilinestring feature
         * @private
         */
        'multilinestring': function(str) {
            var line;
            var lines = OpenLayers.String.trim(str).split(this.regExes.parenComma);
            var components = [];
            for(var i=0, len=lines.length; i<len; ++i) {
                line = lines[i].replace(this.regExes.trimParens, '$1');
                components.push(this.parse.linestring.apply(this, [line]).geometry);
            }
            return new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.MultiLineString(components)
            );
        },
        
        /**
         * Return a polygon feature given a polygon WKT fragment.
         * @param {String} str A WKT fragment representing the polygon
         * @returns {OpenLayers.Feature.Vector} A polygon feature
         * @private
         */
        'polygon': function(str) {
            var ring, linestring, linearring;
            var rings = OpenLayers.String.trim(str).split(this.regExes.parenComma);
            var components = [];
            for(var i=0, len=rings.length; i<len; ++i) {
                ring = rings[i].replace(this.regExes.trimParens, '$1');
                linestring = this.parse.linestring.apply(this, [ring]).geometry;
                linearring = new OpenLayers.Geometry.LinearRing(linestring.components);
                components.push(linearring);
            }
            return new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.Polygon(components)
            );
        },

        /**
         * Return a multipolygon feature given a multipolygon WKT fragment.
         * @param {String} str A WKT fragment representing the multipolygon
         * @returns {OpenLayers.Feature.Vector} A multipolygon feature
         * @private
         */
        'multipolygon': function(str) {
            var polygon;
            var polygons = OpenLayers.String.trim(str).split(this.regExes.doubleParenComma);
            var components = [];
            for(var i=0, len=polygons.length; i<len; ++i) {
                polygon = polygons[i].replace(this.regExes.trimParens, '$1');
                components.push(this.parse.polygon.apply(this, [polygon]).geometry);
            }
            return new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.MultiPolygon(components)
            );
        },

        /**
         * Return an array of features given a geometrycollection WKT fragment.
         * @param {String} str A WKT fragment representing the geometrycollection
         * @returns {Array} An array of OpenLayers.Feature.Vector
         * @private
         */
        'geometrycollection': function(str) {
            // separate components of the collection with |
            str = str.replace(/,\s*([A-Za-z])/g, '|$1');
            var wktArray = OpenLayers.String.trim(str).split('|');
            var components = [];
            for(var i=0, len=wktArray.length; i<len; ++i) {
                components.push(OpenLayers.Format.WKT.prototype.read.apply(this,[wktArray[i]]));
            }
            return components;
        }

    },

    CLASS_NAME: "OpenLayers.Format.WKT" 
});     
/**
 * Copyright (c) 2008-2009 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/** api: (define)
 *  module = GeoExt.ux
 *  class = GeoNamesSearchCombo
 *  base_link = `Ext.form.ComboBox <http://dev.sencha.com/deploy/dev/docs/?class=Ext.form.ComboBox>`_
 */

Ext.namespace("GeoExt.ux");

GeoExt.ux.GeoNamesSearchCombo = Ext.extend(Ext.form.ComboBox, {
    /** api: config[map]
     *  ``OpenLayers.Map or Object``  A configured map or a configuration object
     *  for the map constructor, required only if :attr:`zoom` is set to
     *  value greater than or equal to 0.
     */
    /** private: property[map]
     *  ``OpenLayers.Map``  The map object.
     */
    map: null,

    layerName: null,
    
    /** api: config[width]
     *  See http://www.dev.sencha.com/deploy/dev/docs/source/BoxComponent.html#cfg-Ext.BoxComponent-width,
     *  default value is 350.
     */
    width: 350,

    /** api: config[listWidth]
     *  See http://www.dev.sencha.com/deploy/dev/docs/source/Combo.html#cfg-Ext.form.ComboBox-listWidth,
     *  default value is 350.
     */
    listWidth: 350,

    /** api: config[loadingText]
     *  See http://www.dev.sencha.com/deploy/dev/docs/source/Combo.html#cfg-Ext.form.ComboBox-loadingText,
     *  default value is "Search in Geonames...".
     */
    loadingText: 'Search in Geonames...',

    /** api: config[emptyText]
     *  See http://www.dev.sencha.com/deploy/dev/docs/source/TextField.html#cfg-Ext.form.TextField-emptyText,
     *  default value is "Search location in Geonames".
     */
    emptyText: 'Search location in Geonames',

    /** api: config[zoom]
     *  ``Number`` Zoom level for recentering the map after search, if set to
     *  a negative number the map isn't recentered, defaults to 8.
     */
    /** private: property[zoom]
     *  ``Number``
     */
    zoom: 8,

    /** api: config[minChars]
     *  ``Number`` Minimum number of characters to be typed before
     *  search occurs, defaults to 1.
     */
    minChars: 1,

    /** api: config[queryDelay]
     *  ``Number`` Delay before the search occurs, defaults to 50 ms.
     */
    queryDelay: 50,

    /** api: config[maxRows]
     *  `String` The maximum number of rows in the responses, defaults to 20,
     *  maximum allowed value is 1000.
     *  See: http://www.geonames.org/export/geonames-search.html
     */
    /** private: property[maxRows]
     *  ``String``
     */
    maxRows: '20',

    /** api: config[tpl]
     *  ``Ext.XTemplate or String`` Template for presenting the result in the
     *  list (see http://www.dev.sencha.com/deploy/dev/docs/output/Ext.XTemplate.html),
     *  if not set a default value is provided.
     */
    tpl: '<tpl for="."><div class="x-combo-list-item"><h5>{name}<br></h5>{fcodeName} - {countryName}</div></tpl>',

    /** api: config[lang]
     *  ``String`` Place name and country name will be returned in the specified
     *  language. Default is English (en). See: http://www.geonames.org/export/geonames-search.html
     */
    /** private: property[lang]
     *  ``String``
     */
    lang: 'en',

    /** api: config[countryString]
     *  ``String`` Country in which to make a GeoNames search, default is all countries.
     *  Providing several countries can be done like: countryString: country=FR&country=GP
     *  See: http://www.geonames.org/export/geonames-search.html
     */
    /** private: property[countryString]
     *  ``String``
     */
    countryString: '',

    /** api: config[continentCode]
     *  ``String`` Restricts the search for toponym of the given continent,
     *  default is all continents.
     *  See: http://www.geonames.org/export/geonames-search.html
     */
    /** private: property[continentCode]
     *  ``String``
     */
    continentCode: '',
    
    /** api: config[adminCode1]
     *  ``String`` Code of administrative subdivision, default is all
     *  administrative subdivisions.
     *  See: http://www.geonames.org/export/geonames-search.html
     */
    /** private: property[adminCode1]
     *  ``String``
     */
    adminCode1: '',

    /** api: config[adminCode2]
     *  ``String`` Code of administrative subdivision, default is all administrative
     *  subdivisions.
     *  See: http://www.geonames.org/export/geonames-search.html
     */
    /** private: property[adminCode2]
     *  ``String``
     */
    adminCode2: '',

    /** api: config[adminCode3]
     *  ``String`` Code of administrative subdivision, default is all administrative
     *  subdivisions.
     *  See: http://www.geonames.org/export/geonames-search.html
     */
    /** private: property[adminCode3]
     *  ``String``
     */
    adminCode3: '',

    /** api: config[featureClassString]
     *  ``String`` Feature classes in which to make a GeoNames search, default is all
     *  feature classes.
     *  Providing several feature classes can be done with
     *  ``featureClassString: "featureClass=P&featureClass=A"``
     *  See: http://www.geonames.org/export/geonames-search.html
     */
    /** private: property[featureClassString]
     *  ``String``
     */
    featureClassString: '',

    /** api: config[featureCodeString]
     *  ``String`` Feature code in which to make a GeoNames search, default is all
     *  feature codes.
     *  Providing several feature codes can be done with
     *  ``featureCodeString: "featureCode=PPLC&featureCode=PPLX"``
     *  See: http://www.geonames.org/export/geonames-search.html
     */
    /** private: property[featureCodeString]
     *  ``String``
     */
    featureCodeString: '',

    /** api: config[tag]
     *  ``String`` Search for toponyms tagged with the specified tag, default
     *  is all tags.
     *  See: http://www.geonames.org/export/geonames-search.html
     */
    /** private: property[tag]
     *  ``String``
     */
    tag: '',

    /** api: config[charset]
     *  `String` Defines the encoding used for the document returned by
     *  the web service, defaults to 'UTF8'.
     *  See: http://www.geonames.org/export/geonames-search.html
     */
    /** private: property[charset]
     *  ``String``
     */
    charset: 'UTF8',

    /** private: property[hideTrigger]
     *  Hide trigger of the combo.
     */
    hideTrigger: true,

    /** private: property[displayField]
     *  Display field name
     */
    displayField: 'name',

    /** private: property[forceSelection]
     *  Force selection.
     */
    forceSelection: true,

    /** private: property[queryParam]
     *  Query parameter.
     */
    queryParam: 'name_startsWith',

    /** private: property[url]
     *  Url of the GeoNames service: http://www.GeoNames.org/export/GeoNames-search.html
     */
    url: 'http://ws.geonames.org/searchJSON?',

    /** private: constructor
     */
    initComponent: function() {
        GeoExt.ux.GeoNamesSearchCombo.superclass.initComponent.apply(this, arguments);

        var urlAppendString = '';

        if (this.countryString.length > 0) {
            urlAppendString = urlAppendString + this.countryString;      
        }

        if (this.featureClassString.length > 0) {
            urlAppendString = urlAppendString + this.featureClassString;
        }

        if (this.featureCodeString.length > 0) {
            urlAppendString = urlAppendString + this.featureCodeString;
        }
	
        this.store = new Ext.data.Store({
            proxy: new Ext.data.ScriptTagProxy({
                url: this.url + urlAppendString,
                method: 'GET'
            }),
            baseParams: {
                maxRows: this.maxRows,
                lang: this.lang,
                continentCode: this.continentCode,
                adminCode1: this.adminCode1,
                adminCode2: this.adminCode2,
                adminCode3: this.adminCode3,
                tag: this.tag,
                charset: this.charset
            },
            reader: new Ext.data.JsonReader({
                idProperty: 'geonameId',
                root: "geonames",
                totalProperty: "totalResultsCount",
                fields: [
                    {
                        name: 'geonameId'
                    },
                    {
                        name: 'countryName'
                    },
                    {
                        name: 'lng'
                    },
                    {
                        name: 'lat'
                    },
                    {
                        name: 'name'
                    },
                    {
                        name: 'fcodeName'
                    },
                    {
                        name: 'adminCode1'
                    },
                    {
                        name: 'fclName'
                    },
                    {
                        name: 'countryCode'
                    },
                    {
                        name: 'fcl'
                    },
                    {
                        name: 'fcode'
                    },
                    {
                        name: 'population'
                    },
                    {
                        name: 'adminName1'
                    }
                ]
            })
        });

        if(this.zoom > 0) {
            this.on("select", function(combo, record, index) {
                var position = new OpenLayers.LonLat(
                    record.data.lng, record.data.lat
                );
                position.transform(
                    new OpenLayers.Projection("EPSG:4326"),
                    this.map.getProjectionObject()
                );
                this.map.setCenter(position, this.zoom);
		
		record.data.type = 'search';
		var feature = new OpenLayers.Feature.Vector(
		    new OpenLayers.Geometry.Point(position.lon, position.lat),
		    record.data);
		layers = this.map.getLayersByName(this.layerName);
		layers[0].addFeatures(feature);
		console.log(feature);
		
            }, this);
        }
    }
});

/** api: xtype = gxux_geonamessearchcombo */
Ext.reg('gxux_geonamessearchcombo', GeoExt.ux.GeoNamesSearchCombo);
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

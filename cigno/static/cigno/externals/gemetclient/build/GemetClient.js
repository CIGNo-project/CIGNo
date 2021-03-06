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
this.setLang(lastLang);}};HS.initLangs();HS.Lang["cze"]["Home"]="Výchozí";HS.Lang["cze"]["Search"]="Hledat";HS.Lang["cze"]["BT"]="Širší termíny";HS.Lang["cze"]["NT"]="Užší termíny";HS.Lang["cze"]["RT"]="Příbuzné termíny";HS.Lang["cze"]["Use"]="Použít";HS.Lang["cze"]["Themes"]="Témata";HS.Lang["cze"]["Groups"]="Skupiny";HS.Lang["cze"]["Warning"]="Výstraha";HS.Lang["cze"]["characters required"]="znaků vyžadováno";HS.Lang["cze"]["Top concepts"]="Výchozí témata";HS.Lang["cze"]["Found"]="Nalezeno";HS.Lang["cze"]["INSPIRE themes"]="INSPIRE - témata";HS.Lang["cze"]['GEMET top concepts']="GEMET - základní koncepty";HS.Lang["eng"]["BT"]="Broader terms";HS.Lang["eng"]["NT"]="Narrower terms";HS.Lang["eng"]["RT"]="Related terms";
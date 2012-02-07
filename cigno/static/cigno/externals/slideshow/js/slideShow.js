tls = [];
tls['bt.rewind'] = 'Anterior';
tls['bt.next'] = 'Proximo';

var lionSlideShow = function(params) { this.init(params); };
lionSlideShow.prototype = {
	params: null,
	interval: 5,
	items: [],
	slideNext: null,
	slidePreview: null,
	currentSlide: -1,
	running: false,
	timeout: null,
	nameElements: {item: 'item', title: 'title', content: 'content', btrewind: 'btrewind', btnext: 'btnext', commons: 'commons',  linkage: 'linkage', thumbnail: 'thumbnail', background: 'background', renderCls: 'slide-render' },
	btRewind: null,
	btNext: null,
	tplImg1: null,
	tplImg2: null,
	tplContent: null,
	width: 500,
	height: 300,
	
	init: function(params) {
		this.params = params;
		
		if(this.params.width)
			this.width = this.params.width;
			
		if(this.params.height)
			this.height = this.params.height;
		
		// the method for execute
		this.doRead();
		this.xTemplate();
		
		if(params.autoStart){
			this.start();
		}
	},
	
	/**
	 * Read the dom for get the infos
	 */
	doRead: function() {
		var app = Ext.get(this.params.applyTo);
		var firstEl = app.first();
		var items = firstEl.select('.' + this.nameElements.item);
		items.each(function(el, t, index) {
			this.items[index] = {
				title: 			el.child('.' 	+ this.nameElements.title),
				content: 		el.child('.' 	+ this.nameElements.content),
				linkage: 		el.child('.' 		+ this.nameElements.linkage),
				thumbnail: 		el.child('.' 	+ this.nameElements.thumbnail),
				background: 		el.child('.' 	+ this.nameElements.background)};
		}, this);
		//ul.remove();
		firstEl.setStyle('display', 'none');
	},
	
	/*
	// Template
	<div class="render">
		<img class="img-1" />
		<img class="img-2"/>
		
		<div class="content">
			<h2><a hfer="">titulo</a></h2>
			<p>asdadsadsa</p>
		</div>
	</div>
	*/
	xTemplate: function() {
		var dh = Ext.DomHelper;
		
		var lionSlideShow = dh.append(this.params.applyTo, {tag: 'div', cls: 'lionSlideShow'},true);
		
		lionSlideShow.setStyle('width',this.width + 'px');
		lionSlideShow.setStyle('height',this.height + 'px');
		lionSlideShow.setStyle('position','relative');
		
		this.tplImg1 = dh.append(lionSlideShow, {tag: 'img', cls: 'image-1'}, true);
		this.tplImg2 = dh.append(lionSlideShow, {tag: 'img', cls: 'image-2'}, true);
		
		this.tplContent = dh.append(lionSlideShow, {tag: 'div', cls: this.nameElements.content}, true);
		this.tplContent.setStyle('width',this.width);
		
		this.tplCommon = dh.append(lionSlideShow, {tag: 'div', cls: this.nameElements.commons}, true);
		this.tplCommon.setOpacity(0);
	
		this.btRewind = dh.append(this.tplCommon, {tag: 'div', cls: this.nameElements.btrewind, children: {tag: 'span', html: tls['bt.rewind']}}, true);
		this.btNext = dh.append(this.tplCommon, {tag: 'div', cls: this.nameElements.btnext, children: {tag: 'span', html: tls['bt.next']}}, true);
		
		this.btRewind.setStyle('cursor','pointer');
		this.btRewind.setStyle('height',this.height + 'px');
		
		this.btNext.setStyle('cursor','pointer');
		this.btNext.setStyle('height',this.height + 'px');
		
		this.btRewind.on({
			click: {
				fn: this.rewind,
				scope: this
			}
		});
		
		this.btNext.on({
			click: {
				fn: this.next,
				scope: this
			}
		});
		
	},
	
	_next: function() {
		var index = this.currentSlide + 1;
		if (index > (this.items.length - 1)) index = 0;
		this.set(index);
	},
	
	_rewind: function() {
		var index = this.currentSlide - 1;
		if (index < 0) index = this.items.length - 1;
		this.set(index);
	},
	
	next: function() {
		this._next();
		this.stop(); this.start(true);
	},
	
	rewind: function() {
		this._rewind();
		this.stop(); this.start(true);
	},
	
	set: function(index) {
		this.currentSlide = index;
	},
	
	
	doUpdate: function() {
		var img1 = this.tplImg1;
		var img2 = this.tplImg2;
		var content = this.tplContent;
		var dh = Ext.DomHelper;
		content.update('');
		img2.setStyle('cursor','auto');	
		
		if(this.items[this.currentSlide].title) {
			var titleH2 = dh.append(content,{tag: 'h2'});

			if(this.items[this.currentSlide].linkage){
				var linkage = this.items[this.currentSlide].linkage;
				dh.append(titleH2,{tag: 'a', href: linkage.dom.href, html: this.items[this.currentSlide].title.dom.innerHTML});
				this.tplImg2.setStyle('cursor','pointer');
				this.tplImg2.on({
					click: {
						fn: function() {
							if(linkage.dom.target == 'self' || !linkage.dom.target) {
								document.location.href = this.items[this.currentSlide].linkage.dom.href
							} else {
								window.open(this.items[this.currentSlide].linkage.dom.href);
							}
						}
						, scope: this
					}
				})

			} else {
				titleH2.innerHTML = this.items[this.currentSlide].title.dom.innerHTML;
			}

		}

		if(this.items[this.currentSlide].content){
			var con = dh.append(content,{tag: 'p', html: this.items[this.currentSlide].content.dom.innerHTML});
		}

		img1.dom.src = img2.dom.src;
		img2.setOpacity(0);
		img1.setOpacity(1);
		
		if(this.items[this.currentSlide].background) 
			img2.dom.src = this.items[this.currentSlide].background.dom.src;
		
		img2.setOpacity(1, true);
		img1.setOpacity(0, true);
		
		this.tplCommon.on({
			mouseover: {
				fn: function(e,t,o) {
					this.tplCommon.setOpacity(0.8,true);
				}
				, scope: this
			},
			
			mouseout: {
				fn: function(e,t,o) {
					this.tplCommon.setOpacity(0,true);
				}
				, scope: this
			}
		});
		
	},
	
	start: function(manual) {
		this.running = true;
		this.run(manual);
	},
	
	stop: function() {
		this.running = false; 
		clearTimeout(this.timeout);
	},
	
	run: function(manual) {
		var bind = this;
		if(this.running) {
			if(!manual){ this._next(); }
			this.doUpdate();
			this.timeout = setTimeout(function(){ bind.run(); }, (1000 * this.interval));
		}
	}	
}

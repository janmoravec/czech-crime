/**
*	
*	wrapper kolem places api pluginu ( http://ubilabs.github.com/geocomplete/ )
*	@opts - { id - id inputu se zadavanim mist,
*			  mapId - id canvasu s mapou, plugin umi je automaticky zameri }
*	
*	autor: zdenek.hynek@gmail.com
*/var AutoComplete=function(e){this.callbacks={};this.opts=e;this.plugin=null;this.element=$(".autoCompleteBox");this.origHeight=this.element.find(".content").outerHeight();var t=this;this.element.find(".hideBtn").on("click",function(){var e=$(this);t.element.find(".content").slideToggle(300);$(".contact").hide();e.toggleClass("hideBtnDown");e.parent().toggleClass("noBorder");var n=t.origHeight,r=e.hasClass("hideBtnDown")?n:-n;t.collapsed=r>0?!0:!1;Homepage.updateLayout(r,t)})};AutoComplete.prototype={init:function(){var e=this;this.plugin=$("#"+this.opts.autoCompleteId).geocomplete().bind("geocode:result",function(t,n){e.onGeocodeResult(t,n)}).bind("geocode:error",function(t,n){e.onGeocodeError(t,n)}).bind("geocode:multiple",function(t,n){e.onGeocodeMultiple(t,n)})},onGeocodeResult:function(e,t){if(this.callbacks.hasOwnProperty("onGeocodeResult")){var n=t.geometry.location,r=t.geometry.viewport;this.callbacks.onGeocodeResult.apply(this,[n,r])}},onGeocodeError:function(e,t){console.log("AutoComplete.js: geocoding ERROR: "+t)},onGeocodeMultiple:function(e,t){console.log("AutoComplete.js: geocoding Multiple: "+t.length+" results found")}};
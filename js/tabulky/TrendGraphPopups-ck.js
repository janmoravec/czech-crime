var TrendGraphPopups={init:function(e){this.$valuePopup=e.find(".value");this.$valueSolvPopup=e.find(".value-solv");this.$datePopup=e.find(".date")},appear:function(e,t,n,r,i,s){var o=i[0]-r[0],u=40;this.$valuePopup.show();this.$valuePopup.find("p").text(e);this.$valuePopup.css({top:r[0]-this.$valuePopup.height(),left:r[1]-this.$valuePopup.width()/2});if(t!=e){this.$valueSolvPopup.show();this.$valueSolvPopup.find("p").text(t);if(o>=u){this.$valueSolvPopup.removeClass("down");this.$valueSolvPopup.css({top:i[0]-this.$valueSolvPopup.height(),left:i[1]-this.$valueSolvPopup.width()/2})}else{this.$valueSolvPopup.addClass("down");this.$valueSolvPopup.css({top:i[0]+this.$valueSolvPopup.height()/2,left:i[1]-this.$valueSolvPopup.width()/2})}}else this.$valueSolvPopup.hide();this.$datePopup.show();var a=this.parseDateText(n);this.$datePopup.find("p").text(a);this.$datePopup.css({top:s[0]+this.$valuePopup.height()-10,left:s[1]-this.$datePopup.width()/2})},parseDateText:function(e){var t="-",n=e.split(t),r=parseInt(n[0]),i=DataUtil.getMonthFromIndex(r),s=parseInt(n[1]),o=i+" "+s;return o},hide:function(){this.$datePopup.hide();this.$valuePopup.hide();this.$valueSolvPopup.hide()}};
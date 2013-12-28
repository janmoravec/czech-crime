$(document).ready(function() {
    
    var mapaBtn = $( "#map" ),
        mapaBtns = $( "#map, .logo" ),
        compareBtn = $( "#compare" ),
        tableBtn = $( "#table" ),
        porovnaniPage = $( "#porovnaniPage" ),
        tabulkyPage = $( "#tabulkyPage" ),
        homepageTimeline = $( ".homepageTimeline" ),
        homepageLegendMain = $( ".homepageLegendMain" ),
        homepageInfoBox = $( ".homepageInfoBox" );

    compareBtn.click(function(evt){
       switchToPorovnani( this, Application.selectedUnit );
       _gaq.push(["_trackEvent", "mainMenuCompareBtn", "",Application.currentKey()]);
    });

    mapaBtns.on( "click", function(evt) {
        switchToMapa();
        _gaq.push(["_trackEvent", "mainMenuMapBtn", "",Application.currentKey() ]);
    });

    tableBtn.on( "click", function(evt) {
        switchToTabulky();
        _gaq.push(["_trackEvent", "mainMenuTableBtn", "", Application.currentKey() ]);
    });

    //bind "Porovnat s jinym" button
    $(".homepageInfoBox .compareBtn").on( "click", function() {
        switchToPorovnani( compareBtn, Application.selectedUnit );
        _gaq.push(["_trackEvent", "compareBtnHomepage", Application.currentKey() ]);
    });

    $('.logIn').hide();
    $('.registration').hide();
    $('.userInfo').hide();
    $('.contact').hide();
    $('#login').click(function(){$('.logIn').toggle();$(this).toggleClass('activeLogin');});
    $('#newUser').click(function(){$('.logIn').toggle();$('.registration').toggle();});
    $('#forgetPass').click(function(){$('.forgetPasContent').toggle();});
    $('#userinfo').click(function(){$('.userInfo').toggle();});

    $('.close-registration').click(function(){$('.registration').hide();$('#login').toggleClass('activeLogin');});
    $('.close-userInfo').click(function(){$('.userInfo').hide();$('login').toggleClass('activeLogin');});
    
    $('.contactBtn').click( function(){ ContactForm.show(); });
    
    $(".zoomIn").on("click",function( evt ){
  		evt.preventDefault();

      var zoomed = Map.zoomIn();
      
  		//if( zoomed ) $(".btn").css( {top:"-=" + 10} );
      if( zoomed ) ZoomControl.updateToMap( Map.map.getZoom() );
       _gaq.push(["_trackEvent", "mapZoomIn", Application.currentKey() ]);
  	});

  	$(".zoomOut").on("click",function( evt ){
  		evt.preventDefault();

      var zoomed = Map.zoomOut();
      //if( zoomed ) $(".btn").css( {top:"+=" + 10} );
      if( zoomed ) ZoomControl.updateToMap( Map.map.getZoom() );
       _gaq.push(["_trackEvent", "mapZoomOut", Application.currentKey() ]);
  	});
});




  
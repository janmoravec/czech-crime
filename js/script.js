/* Author:
	zdenek.hynek@gmail.com
*/

function getElementsByClass( searchClass, domNode, tagName) { 
    if (domNode == null) domNode = document;
    if (tagName == null) tagName = '*';
    var el = new Array();
    var tags = domNode.getElementsByTagName(tagName);
    var tcl = " "+searchClass+" ";
    for(i=0,j=0; i<tags.length; i++) { 
        var test = " " + tags[i].className + " ";
        if (test.indexOf(tcl) != -1) 
            el[j++] = tags[i];
    } 
    return el;
}


(function(){
	
	Application.init();

    //workaround to prevent mozilla from scrolling with spacebar - https://bugzilla.mozilla.org/show_bug.cgi?id=295020
    $(window).keydown( function(e) {

        if(e.keyCode == 32 && e.target.nodeName != "INPUT" ) e.preventDefault();

    });
	
    var testInHash = getURLParameter( "test" );
    if( testInHash > 0 ) {
        console.log( "run test" );
        Tester.init();
    }
    
})();




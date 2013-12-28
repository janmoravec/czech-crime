var DataUtil = {
	
	checkDataSanity: function( data ) {
		
		//check if solved not higher than commited
		var sane = true,
			com = data.FoundSum,
			solv = data.SolvedSum;
		
		if( com == 0 ) {
			if( com < solv ) {
				sane = false;
			}
		}
		
		return sane;
	},

	checkCorrectData: function( data ) {
		//check if not returned "data nejsou k dispozici"
		var correct = true;
		if( isNaN( data.index ) ) correct = false;

		return correct;
	},

	formatIndex: function( number ) {
		return Math.round( number * 10 )/10;
	},

	getMonthFromIndex: function( month ) {
            
            switch( month ){
                case 1:
                    index = texts["Leden"];
                    break;
                case 2:
                    index = texts["Únor"];
                    break;
            	case 3:
                    index = texts["Březen"];
                    break;
                case 4:
                    index = texts["Duben"];
                    break;
                case 5:
                    index = texts["Květen"];
                    break;
                case 6:
                    index = texts["Červen"];
                    break;
                case 7:
                    index = texts["Červenec"];
                    break;
                case 8:
                    index = texts["Srpen"];
                    break;
                case 9:
                    index = texts["Září"];
                    break;
                case 10:
                    index = texts["Říjen"];
                    break;
                case 11:
                    index = texts["Listopad"];
                    break;
	            case 12:
                    index = texts["Prosinec"];
                    break;
            }
            return index;
	},

	addSpaces: function( nStr ) {
	    nStr += '';
	    var x = nStr.split('.');
	    var x1 = x[0];
	    var x2 = x.length > 1 ? '.' + x[1] : '';
	    var rgx = /(\d+)(\d{3})/;
	    while (rgx.test(x1)) {
	        x1 = x1.replace(rgx, '$1' + ' ' + '$2');
	    }
	    return x1 + x2;
	},

	getColorForCrimeType: function( crimeType ) {
		var colors = ["#444","#555"];

		switch( crimeType ) {
			case "101-106":
				//colors = ["#e3f6be","#ed1f092"];
				colors = ["#dc55a9","#e788c3"];
				break;
			case "201":
				//colors = ["#c6e0ae","#aed28b"];
				colors = ["#b8529e","#cd86bb"];
				break;
			case "141,142,143,151,161,171,173,181,611,612,614":
				//colors = ["#afcbaa","#8db485"];
				colors = ["#925092","#b385b3"];
				break;
			case "131,132":
				colors = ["#6c4d87","#9883ab"];
				//colors = ["#96b4a4","#69937d"];
				break;
			case "371,373":
				colors = ["#47497c","#7f80a4"];
				//colors = ["#7e9fa1","#467678"];
				break;
			case "372":
				//colors = ["#65889b","#235570"];
				colors = ["#214671","#647e9c"];
				break;
			case "431":
				colors = ["#235570","#65889b"];
				break;
			case "433,434":
				//colors = ["#7f80a4","#47497c"];
				colors = ["#467678","#7e9fa1"];
				break;
			case "435":
				//colors = ["#9883ab","#6c4d87"];
				colors = ["#69937d","#96b4a4"];
				break;
			case "635,641,642,643":
				//colors = ["#b385b3","#925092"];
				colors = ["#8db485","#afcbaa"];
				break;
			case "771":
				//colors = ["#cd86bb","#b8529e"];
				colors = ["#aed28b","#c6e0ae"];
				break;
			case "101-903":
				colors = ["#444444","#555555"];
				break;
			case "-999":
				//colors = ["#555555","#333333"];
				colors = ["#d1f092","#e3f6be"];
				break;
			default:
				//colors = ["#e788c3","#dc55a9"];
				colors = ["#ffde00","#ffeb66"];
				break;
		}

		return colors;
	},

	formatTitle: function( text ) {
		
		text = text.replace( "OOP ", "" );
		text = text.replace( "MOP ", "" );
		text = text.replace( "OŽP ", "" );
		text = text.replace( "ÚO ", "" );
		text = text.replace( "OŘP ", "" );
		//text = text.replace( "KŘP ", "" );
		return text;

	},

	shortenText: function( string, repl, limit ) {
    	
    	if( string ) {
    		
    		if( string.length > limit ) {
	      
	      		return string.substr( 0, limit ) + repl; 
	    
		    } else {
		    
		      return string;
		    
		    }
    	
    	}
	
  	}

}
class AreaLookup:

	#dictionary with all the values
	areas = {}
	START_LINE = 0

	def __init__( self, sheet ):

		#populate dictionary
		numRows = sheet.nrows
	
		for rowIndex in range( self.START_LINE, numRows ):
			row = sheet.row( rowIndex )
			
			#get identifier of areaLevel the area belongs to
			areaLevel = self.getCodeAreaLevel( row[ 0 ].value )
			#print str( row[0].value ) + "-" + str( areaLevel )
 			
			#put area name as key, and area code as value
			self.areas[ row[ 1 ].value ] = [ row[ 0 ].value, areaLevel ]
			

	def getAreaCodeByName( self, name ):
		areaObject = self.areas.get( name, -1 )
		if areaObject != -1:
			return areaObject[ 0 ]
		else:
			return -1

	def getCodeAreaLevel( self, code ):
		
		#set 0,1,2 or 3 depending on length of code

		#get rid of whitespace
		code = str( code ).strip()

		#check for special code of Letiste districts
		if code.find( "x" ) == -1:
			length = len( str( code ) )
			intCode = int( float( code ) )

			#set default level to the lowest
			areaLevel = 3

			if length == 4 :
				#can be either district or county
				
				#if county, it ends with two zeros - divisible by hundred
				moduloDiv = intCode % 100
				if moduloDiv != 0:
					#print str( intCode ) + " - " + str( moduloDiv )
					#is the whole country
					areaLevel = 2
				else:
					#is county
					areaLevel = 1
			elif length == 2:
				#is whole country
				areaLevel = 0
		else:
			areaLevel = -1

		return areaLevel

	def generate( self ):

		rows = []
		for areaName, areaObject in self.areas.iteritems():
			areaCode = areaObject[ 0 ]
			areaLevel = areaObject[ 1 ]
			rows.append( [ unicode( str(areaCode).strip() ), unicode( areaName ), unicode( areaLevel ), unicode( 1000 ), "contact form" ])
			
		return rows



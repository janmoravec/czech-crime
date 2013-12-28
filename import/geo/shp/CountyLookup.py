class CountyLookup:

	#dictionary with all the values
	areas = {}

	def __init__( self, sheet ):

		#populate dictionary
		numRows = sheet.nrows
		START_LINE = 6

		for rowIndex in range( START_LINE, numRows ):
			row = sheet.row( rowIndex )
			#put area name as key, and area code as value
			#print row[ 0 ].value 
			self.areas[ row[ 0 ].value ] = row[ 1 ].value

	def getNameByCode( self, code ):

		#use only first six letters from code
		#shortCode = code[:6]

		#print "code" + str( code )
		#print "shortCode" + str( shortCode )

		return self.areas.get( code, -1 )
		#return self.areas.get( shortCode, -1 )

	def generate( self ):

		rows = []
		for areaName, areaCode in self.areas.iteritems():
			rows.append( [ unicode( areaCode ), unicode( areaName ) ])
			
		return rows



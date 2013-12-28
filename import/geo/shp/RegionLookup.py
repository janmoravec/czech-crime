class RegionLookup:

	#dictionary with all the values
	areas = {}

	def __init__( self, sheet ):

		#populate dictionary
		numRows = sheet.nrows
		
		for rowIndex in range( numRows ):
			row = sheet.row( rowIndex )
			#put area name as key, and area code as value
			self.areas[ row[ 0 ].value ] = row[ 1 ].value

	def getNameByCode( self, code ):

		#use only first six letters from code
		shortCode = code[:5]

		#print "code" + str( code )
		#print "shortCode" + str( shortCode )

		return self.areas.get( shortCode, -1 )

	def generate( self ):

		rows = []
		for areaName, areaCode in self.areas.iteritems():
			rows.append( [ unicode( areaCode ), unicode( areaName ) ])
			
		return rows



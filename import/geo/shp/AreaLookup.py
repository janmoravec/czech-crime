class AreaLookup:

	#dictionary with all the values
	areas = {}

	def __init__( self, sheet ):

		#populate dictionary
		numRows = sheet.nrows
	
		for rowIndex in range( numRows ):
			row = sheet.row( rowIndex )
			
			#create key as concenation of place name and region name
			key = row[ 0 ].value + "-" + row[ 1 ].value
			
			#put area name as key, and area code as value
			self.areas[ key ] = row[ 3 ].value

	def getParentByName( self, name ):
		return self.areas.get( name, -1 )

	def generate( self ):

		rows = []
		for areaName, areaCode in self.areas.iteritems():
			rows.append( [ unicode( areaCode ), unicode( areaName ) ])
			
		return rows



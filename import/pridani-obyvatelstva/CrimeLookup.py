class CrimeLookup:

	START_LINE = 9
	#headers of next page
	SKIP_LINES = [ 61, 62, 63, 64, 122, 123, 124, 125, 180, 181, 182, 183, 231, 232 ]

	#list with all the values
	crimes = []

	def __init__( self, sheet ):

		#populate list
		numRows = sheet.nrows
	
		for rowIndex in range( self.START_LINE, numRows ):
			#skip header lines
			if rowIndex not in self.SKIP_LINES:
				row = sheet.row( rowIndex )
				self.crimes.append( [ str( row[ 1 ].value ), row[ 2 ].value ] )
		
	def generate( self ):

		rows = []
		for crime in self.crimes:
			rows.append( [ crime[0], crime[1] ] )
			
		return rows



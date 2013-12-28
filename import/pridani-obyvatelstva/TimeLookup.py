class TimeLookup:

	#dictionary with all the values
	times = {}
	
	def __init__( self, sheet ):

		#populate dictionary
		numRows = sheet.nrows
		rowId = 0;
	
		for rowIndex in range( numRows ):
			row = sheet.row( rowIndex )
			#create key
			year = int( row[ 0 ].value )
			month = int( row[ 1 ].value )
			key = str( year ) + "-" + str( month )

			self.times[ key ] = [ rowId, year, month ]
			rowId += 1

	def getTimeIdByYearAndMonth( self, year, month ):
		key = str( year ) + "-" + str( month )
		return self.times.get( key, -1 )[ 0 ]

	def generate( self ):
		rows = []
		for rowIndex in self.times:
			row = self.times[ rowIndex ]
			rows.append( [ str( row[0] ), str( row[1] ), str( row[2] ) ] )
			
		return rows
		



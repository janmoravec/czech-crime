from OopRecord import OopRecord

class OopLookup:

	#dictionary with all the values
	oops = {}
	START_LINE = 5

	def __init__( self, sheet ):

		numRows = sheet.nrows

		#populate dictionary
		for rowIndex in range( self.START_LINE, numRows ):
			row = sheet.row( rowIndex )

			oopRecord = OopRecord( row )
			self.oops[ oopRecord.getKey() ] = oopRecord

	def getOop( self, name, county ):
		return self.oops.get( unicode( name ) +"-"+unicode( county ), None )
	


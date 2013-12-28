#goes through zsj_pocet_obyv-number and create zsj records and add population
from ZsjRecord import ZsjRecord

class ZsjLookup:

	#dictionary with all the values
	zsjs = {}
	START_LINE = 1

	def __init__( self, sheet ):

		#populate dictionary
		numRows = sheet.nrows
	
		for rowIndex in range( self.START_LINE, numRows ):
			row = sheet.row( rowIndex )
			newRecord = ZsjRecord( row )

			if not self.zsjExists( newRecord.zsj_code ):
				self.zsjs[ newRecord.zsj_code ] = newRecord
			else:
				#zsj exists, row is only fr zsj_part, just add population
				currentRecord = self.zsjs[ newRecord.zsj_code ]
				currentRecord.addPopulation( newRecord.usual_pop, newRecord.perm_pop )

	def zsjExists( self, code ):
		record = self.getZsjByCode( code )
		if record != -1:
			return True
		else:
			return False

	def getZsjByCode( self, code ):
		return self.zsjs.get( code, -1 )



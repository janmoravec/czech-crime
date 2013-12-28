#goes through zsj_pocet_obyv-number and create zsj records and add population
from OopRecord import OopRecord

class OopLookup:

	#dictionary with all the values
	zsjs = {}
	START_LINE = 5

	def __init__( self, sheet ):

		#populate dictionary
		numRows = sheet.nrows
	
		for rowIndex in range( self.START_LINE, numRows ):
			row = sheet.row( rowIndex )
			newRecord = ZsjRecord( row )

			if not self.zsjExists( record.code ):
				zsjs[ record.code ] = record
			else:
				#zsj exists, row is only fr zsj_part, just add population
				currentRecord = zsjs[ record.code ]
				currentRecord.addPopulation( record.usual_pop, perm_pop )

	def zsjExists( self, code ):
		record = zsjs.get( code, -1 )
		if record != -1:
			return True
		else:
			return False
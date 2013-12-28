#goes through zsj_pocet_obyv-number and create zsj records and add population
from ZsjRecord import ZsjRecord

class ZsjOopLookup:

	#dictionary with all the values
	zsjs = {}
	
	def __init__( self, csvReader ):

		#populate dictionary
		for row in csvReader:
			key = row[ 0 ]
			self.zsjs[ key ] = row[ 1 ]

	def getOopByZsj( self, code ):
		return self.zsjs.get( code, -1 )



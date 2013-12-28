from OopRecord import OopRecord

class OopLookup:

	#dictionary with all the values
	oops = {}
	START_LINE = 1

	def __init__( self, reader ):

		#populate dictionary
		
		for row in reader:
			#skip lines with no digit
			if row[0].isdigit():
				oopRecord = OopRecord( row )
				self.oops[ oopRecord.name ] = oopRecord

			

	def getOopByName( self, name ):
		return self.oops.get( name, None )
	
	def addPopulationToOopByName( self, name, population ):
		oopRecord = self.getOopByName( name )
		if oopRecord:
			oopRecord.population = oopRecord.population + population



class OopRecord:
	
	code = ""
	name = ""
	population = 0
	
	#class constructor
	def __init__( self, row ):
		self.code = row[ 0 ]
		self.name = row[ 1 ].decode( "utf-8" )

	def generate( self ):
		return [ unicode( self.code ), unicode( self.name ), unicode( self.population ) ]
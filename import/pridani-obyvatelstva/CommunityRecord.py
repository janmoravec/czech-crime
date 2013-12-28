class CommunityRecord:
	
	name = ""
	okres = ""
	kraj = ""
	oop = ""
	population = 0
	
	#class constructor
	def __init__( self, row ):
		self.name = row[ 0 ].value
		self.okres = row[ 1 ].value 
		self.kraj = row[ 2 ].value 
		self.oop = row[ 3 ].value 
		
	def generate( self ):
		return [ unicode( self.name ), unicode( self.okres ), unicode( self.kraj ), unicode( self.oop ), unicode( self.population ) ]
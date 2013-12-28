class OopRecord:
	
	code = ""
	name = ""
	county = ""
	region = ""
	oop = ""
	oop_lower_case = ""
	
	#class constructor
	def __init__( self, row ):
		#self.code = row[ 0 ]
		self.name = row[ 0 ].value
		self.county = row[ 1 ].value 
		self.region = row[ 2 ].value 
		self.oop = row[ 3 ].value 
		self.oop_lower_case = row[ 7 ].value

	def getKey( self ):
		return unicode( self.name ) + "-" + unicode( self.county )# + "-" + unicode( self.region )

	def generate( self ):
		return [ unicode( self.oop ) ]

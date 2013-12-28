class ShapeRecord:
	
	id = ""
	code = ""
	name = ""
	laun_code = ""
	zsjRecord = ""
	oopRecord = ""
	
	#class constructor
	def __init__( self, row ):
		
		self.id = row[ 0 ].value
		self.code = row[ 1 ].value
		self.name = row[ 2 ].value
		self.laun_code = row[ 3 ].value

	def getKey( self ):
		
		return unicode( self.code )

	def generate( self ):
		
		returnList = [ unicode( self.id ), unicode( self.code ), unicode( self.name ), unicode( self.laun_code ) ]

		if self.zsjRecord:
			returnList = returnList + self.zsjRecord.generate() 
			if self.oopRecord:
				returnList = returnList + self.oopRecord.generate()

		return returnList
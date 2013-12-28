class ZsjRecord:

	town_code = 0
	town = ""
	town_part_code = 0
	town_part = ""
	zsj_code = 0
	zsj = 0
	#zsj_part_code = int( row[ 6 ].value )
	#zsj_part = row[ 7 ].value
	usual_pop = 0
	perm_pop = 0
	
	region_code = 0
	region = ""
	county_code = 0
	county = ""
	district_code = 0
	district = ""

	def __init__( self, row ):

		self.town_code = int( row[ 0 ].value )
		self.town = row[ 1 ].value
		self.town_part_code = int( row[ 2 ].value )
		self.town_part = row[ 3 ].value
		self.zsj_code = int( row[ 4 ].value )
		self.zsj = row[ 5 ].value
		#self.zsj_part_code = int( row[ 6 ].value )
		#self.zsj_part = row[ 7 ].value
		try:
			self.usual_pop = int( row[ 8 ].value )
		except ValueError:
			self.usual_pop = 0

		try:
			self.perm_pop = int( row[ 9 ].value )
		except ValueError:
			self.perm_pop = 0

		self.region_code = row[ 10 ].value
		self.region = row[ 11 ].value
		self.county_code = row[ 12 ].value
		self.county = row[ 13 ].value
		self.district_code = row[ 14 ].value
		self.district = row[ 15 ].value

	def addPopulation( self, usual_pop, perm_pop ):

		self.usual_pop = self.usual_pop + usual_pop
		self.perm_pop = self.perm_pop + perm_pop

	def generate( self ):

		return [ unicode( self.town_code ), unicode( self.town ), unicode( self.town_part_code ), unicode( self.town_part ), unicode( self.zsj_code ), unicode( self.zsj ), unicode( self.usual_pop ), unicode( self.perm_pop ), unicode( self.region_code ), unicode( self.region ), unicode( self.county_code ), unicode( self.county ), unicode( self.district_code ), unicode( self.district ) ]


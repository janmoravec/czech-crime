class CrimeDataRecord:
	
	code = ""
	name = ""
	found = 0
	foundEnd = 0 
	foundChecked = 0
	solved = 0

	#solvedPerc will be computed during generate
	#solvedPerc = 0

	solvedAdditionally = 0
	commitedDrugged = 0
	commitedAlcohol = 0
	commitedRecidivst = 0
	commitedUnder15 = 0
	comitted15and17 = 0
	comittedUnder18 = 0
	chargedTotal = 0
	chargedRecidivist = 0
	chargedUnder15 = 0
	charged15and17 = 0
	chargedWomen = 0
	damageTotal = 0
	damageFound = 0

	hasNonZeroValues = False

	#class constructor
	def __init__( self, row, isOOPSheet ):
		
		#data record might be initilaize without anything to compute custom categories or district crimedatasheet or else
		if row == False:
			return

		#populate object properties
		
		#crime code needs to be converted from 102.0 to 102, 
		#sometimes its 105-110 and int() would throw and error
		#in that case just store value without modification
		try:
			self.code = int( row[ 1 ].value )
		except ValueError:
			self.code = row[ 1 ].value

		self.name = row[ 2 ].value
		self.found = int( row[ 3 ].value )
		self.foundEnd = int( row[ 4 ].value )
		self.foundChecked = int( row[ 5 ].value )
		self.solved = int( row[ 6 ].value )
		
		#solvedPerc will be computed during generate
		#self.solvedPerc = row[ 7 ] .value
		if isOOPSheet:		
			self.solvedAdditionally = int( row[ 8 ].value )
			self.commitedDrugged = int( row[ 9 ].value )
			self.commitedAlcohol = int( row[ 10 ].value )
			self.commitedRecidivst = int( row[ 11 ].value )
			self.commitedUnder15 = int( row[ 12 ].value )
			self.comitted15and17 = int( row[ 13 ].value )
			self.comittedUnder18 = int( row[ 14 ].value )
			self.chargedTotal = int( row[ 15 ].value)
			self.chargedRecidivist = int( row[ 16 ].value )
			self.chargedUnder15 = int( row[ 17 ].value )
			self.charged15and17 = int( row[ 18 ].value )
			self.chargedWomen = int( row[ 19 ].value )
			self.damageTotal = row[ 20 ].value
			self.damageFound = row[ 21 ].value
		else:
			# country/county sheet has one row missing
			self.solvedAdditionally = int( row[ 7 ].value )
			self.commitedDrugged = int( row[ 8 ].value )
			self.commitedAlcohol = int( row[ 9 ].value )
			self.commitedRecidivst = int( row[ 10 ].value )
			self.commitedUnder15 = int( row[ 11 ].value )
			self.comitted15and17 = int( row[ 12 ].value )
			self.comittedUnder18 = int( row[ 13 ].value )
			self.chargedTotal = int( row[ 14 ].value)
			self.chargedRecidivist = int( row[ 15 ].value )
			self.chargedUnder15 = int( row[ 16 ].value )
			self.charged15and17 = int( row[ 17 ].value )
			self.chargedWomen = int( row[ 18 ].value )
			self.damageTotal = row[ 19 ].value
			self.damageFound = row[ 20 ].value
		if self.found > 0:
			self.hasNonZeroValues = True

	def generate( self ):
		
		#compute solved perc, cannot take directly from spritesheet as it wouldn't add for when adding more records together
		solvedPerc = 0
		if( self.found > 0 and self.solved > 0):
			#need to make one of the division number a float, otherwise will be truncated - http://stackoverflow.com/questions/2958684/python-division
			solvedPerc =  ( float( self.solved ) / self.found  ) * 100

		#print str( self.found ) + "," + str( self.solved ) + "," + str( solvedPerc )

		return [ unicode( self.code ), unicode( self.found ), unicode( self.foundEnd ), unicode( self.foundChecked ), unicode( self.solved ), unicode( solvedPerc ), unicode( self.solvedAdditionally ), unicode( self.commitedDrugged ), unicode( self.commitedAlcohol ), unicode( self.commitedRecidivst ), unicode( self.commitedUnder15 ), unicode( self.comitted15and17 ), unicode( self.comittedUnder18 ), unicode( self.chargedTotal ), unicode( self.chargedRecidivist ), unicode( self.chargedUnder15 ), unicode( self.charged15and17 ), unicode( self.chargedWomen ), unicode( self.damageTotal ), unicode( self.damageFound ) ]

	def addRecord( self, record, appendCode = True ):
		
		if appendCode :
			if self.code != "":
				self.code = str( self.code ) + ","

			self.code = str( self.code ) + str( record.code )

		self.found = self.found + record.found
		self.foundEnd = self.foundEnd + record.foundEnd
		self.foundChecked = self.foundChecked + record.foundChecked
		self.solved = self.solved + record.solved
		self.solvedAdditionally = self.solvedAdditionally + record.solvedAdditionally
		self.commitedDrugged = self.commitedDrugged + record.commitedDrugged
		self.commitedAlcohol = self.commitedAlcohol + record.commitedAlcohol
		self.commitedRecidivst = self.commitedRecidivst + record.commitedRecidivst
		self.commitedUnder15 = self.commitedUnder15 + record.commitedUnder15
		self.comitted15and17 = self.comitted15and17 + record.comitted15and17
		self.comittedUnder18 = self.comittedUnder18 + record.comittedUnder18
		self.chargedTotal = self.chargedTotal + record.chargedTotal
		self.chargedRecidivist = self.chargedRecidivist + record.chargedRecidivist
		self.chargedUnder15 = self.chargedUnder15 + record.chargedUnder15
		self.charged15and17 = self.charged15and17 + record.charged15and17
		self.chargedWomen = self.chargedWomen + record.chargedWomen
		self.damageTotal = self.damageTotal + record.damageTotal
		self.damageFound = self.damageFound + record.damageFound	









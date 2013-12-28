class ZSJCodeLookup:

	#dictionary with all the values
	communities = {}
	START_LINE = 5

	def __init__( self, sheet ):

		#populate dictionary
		numRows = sheet.nrows
	
		for rowIndex in range( self.START_LINE, numRows ):
			row = sheet.row( rowIndex )
			communityRecord = CommunityRecord( row )
			self.communities[ row[ 0 ].value ] = communityRecord
			

	def getCommunityByName( self, name ):
		return self.communities.get( name, None )
	
	def addPopulationToCommunityByName( self, name, population ):
		communityRecord = self.getCommunityByName( name )
		if communityRecord:
			communityRecord.population = communityRecord.population + population



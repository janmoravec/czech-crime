import unidecode

class AreaLookup:

	#dictionary with all the values
	areas = {}
	START_LINE = 0

	def __init__( self, csvReader ):

		#populate dictionary
		for row in csvReader:
			#key = unidecode.unidecode( row[ 1 ].lower() )
			key = row[ 5 ].decode( "utf-8" ).encode('ascii', 'ignore').lower()
			key = key.replace( "\"","" )
			self.areas[ key ] = row

		#for key, value in self.areas.iteritems() :
		#	print key, value

	def getArea( self, name ):
		name = name.encode('ascii', 'ignore').lower()
		return self.areas.get( name, -1 )
	


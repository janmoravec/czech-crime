from ShapeRecord import ShapeRecord

class ShapeLookup:

	#dictionary with all the values
	shapes = {}
	START_LINE = 1

	def __init__( self, sheet, zsjLookup, oopLookup, zsjOopLookup, areaLookup ):

		numRows = sheet.nrows

		#populate dictionary
		for rowIndex in range( self.START_LINE, numRows ):
			row = sheet.row( rowIndex )
			shapeRecord = ShapeRecord( row )
			self.shapes[ shapeRecord.getKey() ] = shapeRecord

			zsjRecord = zsjLookup.getZsjByCode( shapeRecord.id )
			if zsjRecord != -1:
				shapeRecord.zsjRecord = zsjRecord
				oopRecord = oopLookup.getOop( zsjRecord.town, zsjRecord.county )
				if oopRecord:
					shapeRecord.oopRecord = oopRecord
					areaCode = areaLookup.getArea( oopRecord.oop_lower_case )
					if areaCode == -1:
						print oopRecord.oop_lower_case
				#else:
					#try additional lookup
					#print "trying additional lookup: " + str( int( shapeRecord.id ) )
					#oopRecord = zsjOopLookup.getOopByZsj( str( int( shapeRecord.id ) ) )
					#if oopRecord == -1:
					#	print str( int( shapeRecord.id ) ) + "," + unicode( zsjRecord.zsj ) + "," + unicode( zsjRecord.town ) + "," + unicode( zsjRecord.county ) + "," + unicode( zsjRecord.region ) + "," + unicode( zsjRecord.district ) + ",OOP " + unicode( zsjRecord.district )

	def generate( self ):

		records = []
		for recordKey in self.shapes:
			records.append( self.shapes[ recordKey ].generate() )

		return records

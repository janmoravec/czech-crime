import csv
from UnicodeWriter import UnicodeWriter

class ZeroDeleter:

	@staticmethod
	def removeZeroRowsFromArray( origFile, newFile ):

		resultArr = []
		origFileReader = csv.reader( origFile )
		writer = UnicodeWriter( newFile )

		for row in origFileReader:
		
			#check if there is any value
			hasValue = False
			numColumns = len( row )
			for i in range( numColumns ):
				if i > 3 and i < ( numColumns - 1 ):
					value = float( row[i] )
					if value != 0:
						hasValue = True
						break

			if hasValue:
				writer.writerow( row )
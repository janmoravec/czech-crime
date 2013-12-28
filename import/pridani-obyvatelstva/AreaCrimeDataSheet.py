from CrimeDataRecord import CrimeDataRecord
import re

class AreaCrimeDataSheet:

	START_LINE = 9
	#headers of next page
	SKIP_LINES = [ 61, 62, 63, 64, 122, 123, 124, 125, 180, 181, 182, 183, 231, 232 ]

	name = ""
	records = []

	hasNonZeroValues = False

	def __init__( self, sheet, omitZeroValues ):
		
		self.records = []

		#get area name from spreadsheet
		#check if there's is value on sixts row ( would be basic unit )
		self.name = sheet.row( 5 )[2].value 
		#if not try the fifth row
		if len( self.name ) == 0 :
			self.name = sheet.row( 4 )[2].value
		#if not try the fifth row
		if len( self.name ) == 0 :
			self.name = sheet.row( 3 )[2].value
	
		#get num of rows
		numRows = sheet.nrows

		#print "===generateing new sheet===="
		for rowIndex in range( self.START_LINE, numRows ):
			#skip header lines
			row = sheet.row( rowIndex )
			
			#check if line is releavant, there should be number or string type of 110-230
			value = row[1].value
			#replace hypnen
			value = re.sub(r'-?\-+', "0", unicode(value))
			#replace dot
			value = re.sub(r'-?\.+', "0", unicode(value))

			if value.isdigit():
			#if rowIndex not in self.SKIP_LINES:
				#print rowIndex
				dataRecord = CrimeDataRecord( sheet.row( rowIndex ) )
				#print omitZeroValues
				if not omitZeroValues or dataRecord.hasNonZeroValues:
					self.records.append( dataRecord )
		
		
	def generate( self ):

		numRecords = len( self.records )
		generatedRecords = []
		
		for recordIndex in range( numRecords ):
			record = self.records[ recordIndex ]
			generatedRecord = record.generate()
			generatedRecords.append( generatedRecord )
			

		return generatedRecords
			
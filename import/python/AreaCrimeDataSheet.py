from CrimeDataRecord import CrimeDataRecord
import re
import xlrd

class AreaCrimeDataSheet:

	START_LINE = 9

	#sheets for country and counties are formatted differently, need flag to pass differently
	isOOPSheet = True
	
	code = 0
	name = ""
	records = []
	recordsByCrimeCode = []
	timeId = 0

	hasNonZeroValues = False

	def __init__( self, sheet, timeId, omitZeroValues ):
		
		#is oop sheet ( country/counties sheets have first line empty )
		b1Cell = sheet.row(0)[1]
		if b1Cell.ctype == xlrd.XL_CELL_EMPTY:
			#b1 cell is empty
			self.isOOPSheet = False
			self.START_LINE = 8

		self.records = []
		self.recordsByCrimeCode = {}

		self.timeId = timeId

		#save code (get rid of first character "a" letter)
		if self.isOOPSheet:
			self.code = sheet.name[1:]
		elif sheet.name == "a_I______":
			#special case for country spreadsheet
			self.code = "0"
		else:
			#for county spreadsheet, need to get from _I19 to 1900
			sheetName = sheet.name[3:]
			sheetName = sheetName.replace("____","") + "00"
			self.code = sheetName

		#get area name from spreadsheet
		#check if there's is value on sixts row ( would be basic unit )
		if self.isOOPSheet:
			self.name = sheet.row( 5 )[2].value 
		else:
			self.name = sheet.row( 4 )[2].value 

		#get num of rows
		numRows = sheet.nrows

		#print "===generating new sheet===="
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
				dataRecord = CrimeDataRecord( sheet.row( rowIndex ), self.isOOPSheet )
				self.recordsByCrimeCode[ dataRecord.code ] = dataRecord
				#print omitZeroValues
				if not omitZeroValues or dataRecord.hasNonZeroValues:
					self.records.append( dataRecord )
				
		#add custom categories values
		#3. Fyzicke utoky (TSK 141, 142, 143, 151, 161, 171, 173, 181, 611, 612, 614)
		#in stylesheet for checking: D109+D107+D106+D35+D33+D31+D30+D29+D28+D27+D26
		categoriesToSum = [ 141, 142, 143, 151, 161, 171, 173, 181, 611, 612, 614 ]
		self.addCustomCategorie( categoriesToSum )

		#4. Loupeze (TSK 131, 132)
		#in stylesheet for checking: D24+D25
		categoriesToSum = [ 131, 132 ]
		self.addCustomCategorie( categoriesToSum )

		#5. Vloupani do obydli (TSK 371, 373)
		#in stylesheet for checking: D77+D78
		categoriesToSum = [ 371, 373 ]
		self.addCustomCategorie( categoriesToSum )

		#8. Kradeze veci z automobilu (TSK 433, 434)
		#in stylesheet for checking: D88+D89
		categoriesToSum = [ 433, 434 ]
		self.addCustomCategorie( categoriesToSum )

		#10. Vyroba, drzeni a distribuce drog (TSK 635, 641, 642, 643)
		#in stylesheet for checking: D114+D119+D120+D121
		categoriesToSum = [ 635, 641, 642, 643 ]
		self.addCustomCategorie( categoriesToSum )

		#compute one for whole district


	def addCustomCategorie( self, categoriesIds ):
		sumDataRecord = CrimeDataRecord( False, False )
		for categorieIndex in categoriesIds:
			recordToAdd = self.recordsByCrimeCode.get( categorieIndex, -1 )

			#check if record exists, if it had zero values, it was not added to the recordsByCrimeCode
			if recordToAdd != -1:
				sumDataRecord.addRecord( recordToAdd )

		self.records.append( sumDataRecord )
		
	def generate( self ):

		numRecords = len( self.records )
		generatedRecords = []
		
		for recordIndex in range( numRecords ):
			record = self.records[ recordIndex ]
			generatedRecord = record.generate()
			
			#add area code
			generatedRecord.insert( 0, self.code )
			generatedRecord.insert( 0, str( self.timeId ) )
			#add blank column for autoincrement field
			generatedRecord.insert( 0, " " )
			#add blacnk column for instertedAt column
			generatedRecord.insert( len( generatedRecord ), " " )

			generatedRecords.append( generatedRecord )
		
		#print generatedRecords
		return generatedRecords

	def clear( self ):

		self.recordsByCrimeCode = []
		self.records = []
			
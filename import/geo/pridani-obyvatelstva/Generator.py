import xlrd
import csv

from os import listdir
from os.path import isfile, join
from AreaLookup import AreaLookup 
from CrimeLookup import CrimeLookup 
from TimeLookup import TimeLookup 
from AreaCrimeDataSheet import AreaCrimeDataSheet
from UnicodeWriter import UnicodeWriter

class Generator() :

	START_YEAR = 2010
	START_MONTH = 01

	END_YEAR = 2010
	END_MONTH = 04

	year = START_YEAR
	month = START_MONTH
	onCompleteCallback = ""

	COLUMN_NAMES = ["id","time","area","crime","found","found-end","found-total","solved","solved-perc","solved-additionally","commited-drugged","commited-alcohol","commited-recidivst","commited-under-15","comitted-15-17","comitted-under-18","charged-total","charged-recidivist","charged-under-15","charged-15-17","charged-women","damage-total","damage-found" ];

	areaLookup = ""
	crimeLookup = ""
	timeLookup = ""
	writer = ""
	areaWriter = ""
	crimeWriter = ""
	timeWriter = ""
	recordId = 1
	files = []

	generateAreaLookup = True
	generateCrimeLookup = False
	generateTimeLookup = False
	generateCrimeData = True

	def __init__( self, year, month, omitZeroValues, onCompleteCallback ) :

		#null everything
		self.areaLookup = ""
		self.crimeLookup = ""
		self.timeLookup = ""
		self.writer = ""
		self.areaWriter = ""
		self.crimeWriter = ""
		self.timeWriter = ""
		self.recordId = 1
		self.files = []

		self.year = year
		self.month = month
		self.omitZeroValues = omitZeroValues
		self.onCompleteCallback = onCompleteCallback

		#1) a) generate area lookup
		with xlrd.open_workbook( 'areaLookup.xls' ) as wb:
			sh = wb.sheet_by_index( 0 )
			self.areaLookup = AreaLookup( sh );

		#b) time lookup
		with xlrd.open_workbook( 'timeLookup.xls' ) as wb:
			sh = wb.sheet_by_index( 0 )
			self.timeLookup = TimeLookup( sh );

		#2) generate lookups

		# area lookup
		if self.generateAreaLookup :
			
			with open('../generated/AreaLookup.csv', 'wb') as f:
				
				rows = self.areaLookup.generate()
				numRows = len( rows )
				
				self.areaWriter = UnicodeWriter( f )
				for rowIndex in range( numRows ):
					row = rows[ rowIndex ]
					self.areaWriter.writerow( row )

		# crime lookup
		if self.generateCrimeLookup :
			
			with xlrd.open_workbook( '../files/a______.xls', 'wb') as wb:
				sh = wb.sheet_by_index( 0 )
				self.crimeLookup = CrimeLookup( sh );

				with open('../generated/CrimeLookup.csv', 'wb') as f:
					
					rows = self.crimeLookup.generate()
					numRows = len( rows )
					
					self.crimeWriter = UnicodeWriter( f )
					for rowIndex in range( numRows ):
						row = rows[ rowIndex ]
						#replace dot zero
						#row[0] = row[0].replace( ".0","" )

						self.crimeWriter.writerow( [ row[0],row[1] ] )
					
		# time lookup 
		if self.generateTimeLookup :
			
			with open('../generated/TimeLookup.csv', 'wb') as f:
				
				rows = self.timeLookup.generate()
				numRows = len( rows )
				
				self.timeWriter = UnicodeWriter( f )
				for rowIndex in range( numRows ):
					row = rows[ rowIndex ]
					self.timeWriter.writerow( row )


		#3) go to folders and go through all folder and process all files
			#itirate through all files 

		if self.generateCrimeData :

			

			#-files
				#-2003
					#-1
					#-2
					#-...
				#-2004
					#-...

			directory = "../files"

			#itirate through all year folders
			yearFolders = listdir( directory )

			for yearFolder in yearFolders:
				
				#check if is year we're interested in
				#if ( int( yearFolder ) >= self.START_YEAR ) and ( int( yearFolder ) < self.END_YEAR ) :
				if str( yearFolder ) == str( self.year ) :
				
					#itirate through all month folders
					monthsFolders = listdir( directory + "/" + yearFolder )

					for monthFolder in monthsFolders:

						if str( monthFolder ) == str( self.month ) :
							#itirate through files in month folder
							files = listdir( directory + "/" + yearFolder + "/" + monthFolder )
							
							#get time period id
							periodId = self.timeLookup.getTimeIdByYearAndMonth( int( yearFolder ), int( monthFolder ) )
							
							for file in files:
								#check only for excel files
								if ".xls" in file or ".xlsx" in file:
									#omit files with underscore
									if not "__L" in file and not "__R" in file and not "__X" in file:
										url = directory + "/" + "/" + yearFolder + "/" + monthFolder + "/" + file 
										self.files.append( self.processFile( url, periodId ) )
			
			#4) write to csv file
			fileName = str( self.year ) + ":" +str( self.month )
			if not self.omitZeroValues :
				fileName = fileName + ":with-zeros"

			with open('../generated/crimeData-' + fileName + '.csv', 'wb') as f:
				print "start writing file"
				self.writer = UnicodeWriter( f )
				
				#write header
				#self.writer.writerow( self.COLUMN_NAMES )
				
				#write rest of the content
				numFiles = len( self.files )
				for fileIndex in range( numFiles ):
					
					fileRecords = self.files[ fileIndex ]
					
					#loop through record
					numRowsInFile = len( fileRecords )
					for fileRecordIndex in range( numRowsInFile ):
						#get file rows and month and year from here
						row = fileRecords[ fileRecordIndex ]
						
						self.writer.writerow( row )


				#complete callback
				self.onCompleteCallback()


	def processFile( self, fileUrl, timeId ):
		
		#print "======= processing file: " + fileUrl + " ========== "
		with xlrd.open_workbook( fileUrl ) as wb:
			
			numSheets = wb.nsheets
			fileRecords = []
			
			for sheetIndex in range( numSheets ):
				
				#print "========= processing sheet " + str( sheetIndex ) + " ========="

				sheet = wb.sheet_by_index( sheetIndex )
				areaSheet = AreaCrimeDataSheet( sheet, self.omitZeroValues )

				#testing correct naming
				areaName = areaSheet.name
				areaCode = self.areaLookup.getAreaCodeByName( areaName )

				if areaCode == -1:
					print unicode( areaName )
				
				#print unicode( areaName )
				#print unicode( areaCode ) + "," + unicode( areaName ) 

				#go through all records and add area ( and time for now )
				generatedRecords = areaSheet.generate()
				lenRecords = len( generatedRecords )
				
				for recordIndex in range( lenRecords ):

					#get single record
					record = generatedRecords[ recordIndex ]

					#print "========= processing single record " + str( recordIndex ) + " ========="
					#add time and area, do not add id

					record.insert( 0, str( areaCode ) )
					record.insert( 0, str( timeId ) )
					#record.insert( 0, str( self.recordId ) )

					#increment variable value
					self.recordId += 1

				fileRecords.extend( generatedRecords )
			return fileRecords

if __name__ ==  "__main__" :
	Generator( "2010", "01" )



####################



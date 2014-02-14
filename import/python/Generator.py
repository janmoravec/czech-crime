# -*- coding: utf-8 -*-

import xlrd
import csv

from os import listdir
from os.path import isfile, join
from copy import copy
from AreaLookup import AreaLookup 
from CrimeLookup import CrimeLookup 
from TimeLookup import TimeLookup 
from AreaCrimeDataSheet import AreaCrimeDataSheet
from UnicodeWriter import UnicodeWriter
from DistrictCrimeDataSheet import DistrictCrimeDataSheet
from Logger import Logger

class Generator() :

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
	districtCrimeDataSheetsByCode = {}
	districtCrimeDataSheets = []

	#store areasheets with keys, so we can find them retrospectively to add another areasheet
	areaSheets = {}

	generateAreaLookup = False
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

		# crime lookup - is generated manually
		if self.generateCrimeLookup :
			
			with xlrd.open_workbook( '../files/a______.xls', 'wb') as wb:
				sh = wb.sheet_by_index( 0 )
				self.crimeLookup = CrimeLookup( sh );

				with open('../generated/CrimeLookup.csv', 'wb') as f:
					
					rows = self.crimeLookup.generate()
					numRows = len( rows )
					
		#			self.crimeWriter = UnicodeWriter( f )
		#			for rowIndex in range( numRows ):
		#				row = rows[ rowIndex ]
						#replace dot zero
						#row[0] = row[0].replace( ".0","" )

		#				self.crimeWriter.writerow( [ row[0],row[1] ] )
					
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
				if str( yearFolder ) == str( self.year ) :
				
					#itirate through all month folders
					monthsFolders = listdir( directory + "/" + yearFolder )

					for monthFolder in monthsFolders:

						#check if is month we're interested in
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
										
										#temp constrain to generate just one file
										#if "a0011__" in file :
										url = directory + "/" + yearFolder + "/" + monthFolder + "/" + file 
										
										#create district sheet
										districtSheet = self.processFile( url, periodId )
										#temp
										if districtSheet:
											self.districtCrimeDataSheetsByCode[ districtSheet.code ] = districtSheet

										#self.files.append( self.processFile( url, periodId ) )
			
			#4) add Letiste to respective districts 
			transports = [ { "from": "x004110", "to": "0011" }, 
						 { "from": "x064160", "to": "0602" },
						 { "from": "x074170", "to": "0704" },
						 { "from": "x174150", "to": "1706" },
						 { "from": "x194130", "to": "1903" },
						 #add train stations
						 { "from": "x060050", "to": "0602" },
						 { "from": "x070050", "to": "0707" } ]

			lenTransports = len( transports )
			for transportIndex in range( lenTransports ) :
				transport = transports[ transportIndex ]
				baseDistrictSheet = self.districtCrimeDataSheetsByCode[ transport[ "to" ] ]
				addingDistrictSheet = self.districtCrimeDataSheetsByCode[ transport[ "from" ] ]
				baseDistrictSheet.addDistrictCrimeDataSheet( addingDistrictSheet )

			#5) generate all files from district crime data
			rows = self.generate()
			
			#don't need all the objects any more
			self.clear()

			#6) write to csv file
			fileName = str( self.year ) + ":" +str("01-")+str( self.month )
			if not self.omitZeroValues :
				fileName = fileName + ":with-zeros"

			with open('../generated/crimeData-' + fileName + '.csv', 'wb') as f:
				print "start writing file " + unicode( fileName )
				self.writer = UnicodeWriter( f )
				
				#write header
				#self.writer.writerow( self.COLUMN_NAMES )
				
				#write rest of the content
				numRows = len( rows )
				for rowIndex in range( numRows ):
					
					row = rows[ rowIndex ]
					#print rows
					self.writer.writerow( row )

				#complete callback
				if self.onCompleteCallback : self.onCompleteCallback()


	def addRecordArray( self, sourceArr, arrToAdd ):
		sourceLen = len( sourceArr )
		if sourceLen > 0:
			for i in range( sourceLen ):
				#first three columns just identifies record
				if i > 2:
					sourceArr[i] = str( float( sourceArr[i] ) + float( arrToAdd[i] ) )
		else:
			sourceArr = copy( arrToAdd )
		return sourceArr

	def processFile( self, fileUrl, timeId ):
		
		#print "======= processing file: " + fileUrl + " ========== "
		
		with xlrd.open_workbook( fileUrl ) as wb:
			
			numSheets = wb.nsheets
			
			fileRecords = []
			sheetRecords = []

			districtName = wb.sheet_by_index(0).row(4)[2].value
			areaName = wb.sheet_by_index(0).row(5)[2].value
			districtCode = str( self.areaLookup.getAreaCodeByName( districtName ) )
			
			#if Letiste or train station, need to add next row to make it more specific
			firstSheetName = wb.sheet_by_index(0).name
			if districtCode == "-1" or firstSheetName == "a060050" or firstSheetName == "a070050":
				#print "getting district code"
				districtName = districtName + "-" + areaName
				districtCode = str( self.areaLookup.getAreaCodeByName( districtName ) )

			#data records for districts
			districtCrimeDataSheet = DistrictCrimeDataSheet( districtCode, districtName, timeId )
			self.districtCrimeDataSheets.append( districtCrimeDataSheet )
			#self.districtCrimeDataSheetsByCode[ districtCode ] = districtCrimeDataSheet

			print unicode( districtName ) + " - " + unicode( districtCode )

			if districtCode == -1:
				print districtCode
				print districtName

			for sheetIndex in range( numSheets ):
				
				#print "========= processing sheet " + str( sheetIndex ) + " ========="
				sheet = wb.sheet_by_index( sheetIndex )
				areaSheet = AreaCrimeDataSheet( sheet, timeId, self.omitZeroValues )
				districtCrimeDataSheet.addAreaCrimeDataSheet( areaSheet )

				#testing correct naming
				areaName = areaSheet.name
				#taking code straight from name of the sheet
				areaCode = areaSheet.code
				
				if areaCode == -1:
					Logger.throwError( "Unknown Area: " + unicode( areaCode ) + "," + unicode( areaName ) )
				
				#print unicode( areaName )
				print unicode( areaCode ) + "," + unicode( areaName ) 

				#generatedRecords = areaSheet.generate()
				#print generatedRecords
				#lenRecords = len( generatedRecords )

				#for recordIndex in range( lenRecords ):
					#get single record
				##	record = generatedRecords[ recordIndex ]
					#print "========= processing single record " + str( recordIndex ) + " ========="
				#	record.insert( 0, str( timeId ) )
					#increment variable value
				#	self.recordId += 1
				
				#fileRecords.extend( generatedRecords )

			#fileRecords.extend( districtCrimeDataSheet.generate() )

			#return fileRecords
			return districtCrimeDataSheet


	def generate( self ):
		
		#print "======= generating ======="
		files = []
		lenDistrictSheet = len( self.districtCrimeDataSheets )

		for sheetIndex in range( lenDistrictSheet ):
		#for districtSheetIndex in self.districtCrimeDataSheetsByCode:
			#print "========= new district ========== " + unicode( sheetIndex )
			
			districtSheet = self.districtCrimeDataSheets[ sheetIndex ] #self.districtCrimeDataSheetsByCode[ districtSheetIndex ]
			files.extend( districtSheet.generate() )

		return files

	def clear( self ):
		self.districtCrimeDataSheets = []
		self.districtCrimeDataSheetsByCode.clear()

if __name__ ==  "__main__" :
	Generator( "2010", "01" )



####################



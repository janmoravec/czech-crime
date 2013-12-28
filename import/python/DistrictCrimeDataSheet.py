from copy import copy
from CrimeDataRecord import CrimeDataRecord

class DistrictCrimeDataSheet:

	code = 0
	records = []
	recordsByCrimeCode = {}
	#areaCrimeSheets = {}
	areaCrimeSheets = []

	def __init__( self, code, name, timeId ):
		
		if self.code > -1:
			self.code = code
		else:
			#if not code, use name instead
			self.code = name

		self.timeId = timeId

		self.records = []
		self.recordsByCrimeCode = {}
		#areaCrimeSheets = {}
		self.areaCrimeSheets = []

	def addAreaCrimeDataSheet( self, areaCrimeDataSheetToAdd ):
		
		#add area crime sheet to dictionary
		self.areaCrimeSheets.append( areaCrimeDataSheetToAdd ) 
		
		recordsToAdd = areaCrimeDataSheetToAdd.records
		lenRecords = len( recordsToAdd )
		
		#go through all records in added arecrimedatasheet and it to district crimedatasheet
		for recordToAddIndex in range( lenRecords ):
			
			recordToAdd = recordsToAdd[ recordToAddIndex ]
			crimeCode = recordToAdd.code

			#check if record for crime code already exists
			if not crimeCode in self.recordsByCrimeCode :

				self.recordsByCrimeCode[ crimeCode ] = CrimeDataRecord( False, False )
				self.recordsByCrimeCode[ crimeCode ].code = crimeCode
				self.records.append( self.recordsByCrimeCode[ crimeCode ] )

			self.recordsByCrimeCode[ crimeCode ].addRecord( recordToAdd, False )

	def addDistrictCrimeDataSheet( self, districtCrimeDataSheetToAdd ):
		
		#go through total records, do not add anything to individual areacrimedatasheets
		lenRecords = len( self.records )
		
		#go through all records in added arecrimedatasheet and it to district crimedatasheet
		for recordToAddIndex in range( lenRecords ):
			
			record1 = self.records[ recordToAddIndex ]
			record2 = districtCrimeDataSheetToAdd.records[ recordToAddIndex ]

			record1.addRecord( record2, False )

	def generate( self ):

		generatedRecords = []
		recordsLen = len( self.records )
		
		#print "going through indidiviual areas: " + unicode( self.code )

		#go through records of individual areas
		areaRecordsLen = len( self.areaCrimeSheets )
		#for areaIndex in self.areaCrimeSheets:
		for areaIndex in range( areaRecordsLen ):
			areaCrimeSheet = self.areaCrimeSheets[ areaIndex ]
			#print "area: " + unicode( areaCrimeSheet.code ) + " - " + unicode( areaCrimeSheet.name )
			generatedRecords.extend( areaCrimeSheet.generate() )
			areaCrimeSheet.clear()

		#go through all district recordsm, don't do if it is a last file with counties, as the whole country is on first sheet and don't need to compute district total for this file
		if self.code != "0.0":
			for recordIndex in range( recordsLen ): 
				
				record = self.records[ recordIndex ]
				#record = self.recordsByCrimeCode[ recordIndex ]
				generatedRecord = record.generate()

				#add area code
				generatedRecord.insert( 0, self.code )
				generatedRecord.insert( 0, str( self.timeId ) )
				#add blank column for autoincrement field
				generatedRecord.insert( 0, " " )
				#add blacnk column for instertedAt column
				generatedRecord.insert( len( generatedRecord ), " " )
				generatedRecords.append( generatedRecord )
		
		return generatedRecords


import xlrd
import csv

from os import listdir
from os.path import isfile, join
from AreaLookup import AreaLookup 
from CountyLookup import CountyLookup 
from RegionLookup import RegionLookup 
from UnicodeWriter import UnicodeWriter

#columnNames = ["Id","Vykazovane_zjisteno_mvcr","Vykazovane_objasneno_mvcr","FK_Crime_Lookup","FK_Area_Lookup","FK_Time_Range","Vykazovane_zjisteno_mesic","Vykazovane_objasneno_mesic","FK_District_Lookup"]

#columnsOrderForCSV
#id,time,area,crime,found,found-end,found-total,solved,solved-perc,solved-additionally,commited-drugged,commited-alcohol,commited-recidivst,commited-under-15,comitted-15-17,comitted-under-18,charged-total,charged-recidivist,charged-under-15,charged-15-17,charged-women,damage-total,damage-found

class Generator() :

	COLUMN_NAMES = ["id","time","area","crime","found","found-end","found-total","solved","solved-perc","solved-additionally","commited-drugged","commited-alcohol","commited-recidivst","commited-under-15","comitted-15-17","comitted-under-18","charged-total","charged-recidivist","charged-under-15","charged-15-17","charged-women","damage-total","damage-found" ];

	areaLookup = ""
	countyLookup = ""
	crimeLookup = ""
	writer = ""
	areaWriter = ""
	crimeWriter = ""
	recordId = 1
	files = []

	generateAreaLookup = True
	generateCrimeLookup = False
	generateCrimeData = False

	def __init__( self ) :

		#1) generate area lookup
		with xlrd.open_workbook( 'OOP_dislokace.xlsx', encoding_override="cp1251" ) as wb:
			sh = wb.sheet_by_index( 0 )
			self.areaLookup = AreaLookup( sh );

		with xlrd.open_workbook( 'kraje_ciselnik-stary.xls' ) as wb:
			sh = wb.sheet_by_index( 0 )
			self.regionLookup = RegionLookup( sh );

		with xlrd.open_workbook( 'okresy_ciselnik.xls' ) as wb:
			sh = wb.sheet_by_index( 0 )
			self.countyLookup = CountyLookup( sh );


		#

		with xlrd.open_workbook( 'SPH_OBEC.xls' ) as wb:
			
			with open('obce.csv', 'wb') as f:

				sh = wb.sheet_by_index( 0 )
				numRows = sh.nrows
				print wb.encoding
				
				writer = UnicodeWriter( f )
				for rowIndex in range(numRows):

					if rowIndex > 0 :

						placeId = sh.row( rowIndex )[0].value
						placeName = sh.row( rowIndex )[5].value
						nuts = sh.row( rowIndex )[1].value
						
						#regionName = self.regionLookup.getNameByCode( nuts )
						countyName = self.countyLookup.getNameByCode( nuts )
						keyName = unicode( placeName ) + "-" + unicode( countyName )
						#oopName = self.countyLookup.getNameByCode( nuts )
						oopName = self.areaLookup.getParentByName( keyName )

						if oopName == -1:
							#print sh.row( rowIndex )
							print unicode( placeName ) + "," + unicode( nuts ) + "," + unicode( keyName ) + "," + unicode( oopName )
						
						writer.writerow( [ str( int(placeId) ), unicode( oopName ) ] )

if __name__ ==  "__main__" :
	Generator()

quit()


####################



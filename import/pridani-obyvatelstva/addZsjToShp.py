import xlrd
import csv

from ZsjLookup import ZsjLookup 
from OopLookup import OopLookup 
from ShapeLookup import ShapeLookup 
from ZsjOopLookup import ZsjOopLookup 
from AreaLookup import AreaLookup 
from UnicodeWriter import UnicodeWriter

shapeCodes = {}
zsjLookup = ""
oopLookup = ""
shapeLookup = ""
zsjOopLookup = ""
areaLookup = ""


#1) create zsjLookup
with xlrd.open_workbook( 'ZSJ_pocet_obyv-number-code.xlsx' ) as wb:
	sheet = wb.sheet_by_index( 0 )
	zsjLookup = ZsjLookup( sheet )

#2) create oopLookup
with xlrd.open_workbook( "OOP_dislokace.xlsx" ) as wb:
	sheet = wb.sheet_by_index( 0 )
	global oopLookup
	oopLookup = OopLookup( sheet )

#3) create additional lookup
with open('ZSJ-MOP.csv', 'rb') as csvfile:
	csvReader = csv.reader(csvfile, delimiter=',', quotechar='|')
	zsjOopLookup = ZsjOopLookup( csvReader ) 

#4) create areaLookup
with open('areas.csv', 'rb') as csvfile:
	csvReader = csv.reader(csvfile, delimiter=',', quotechar='|')
	areaLookup = AreaLookup( csvReader ) 

#5) create shapeLookup
with xlrd.open_workbook( 'SHAPE - atributy.xls' ) as wb:
	sheet = wb.sheet_by_index( 0 )
	numRows = sheet.nrows

	global zsjLookup
	global oopLookup
	global zsjOopLookup

	shapeLookup = ShapeLookup( sheet, zsjLookup, oopLookup, zsjOopLookup, areaLookup )

	#for rowIndex in range( 1, numRows ):
		#row = sheet.row( rowIndex )
		#get zsj record
		#code = int( row[0].value )
		#zsjRecord = zsjLookup.getZsjByCode( code )

		#if zsjRecord != -1:
			
			#shapeLookup.zsjRecord = zsjRecord
			#oopRecord = oopLookup.getOop( zsjRecord.town, zsjRecord.county )
			#if oopRecord:
				#shapeLookup.oopRecord = oopRecord

			#print oopRecord
			#if not oopRecord: 
			#	print zsjRecord.town + "," + zsjRecord.zsj + "," + zsjRecord.county + "," + zsjRecord.region


#5) 
with open('shape-with-zsj.csv', 'wb') as f:
	print "start writing file"
	writer = UnicodeWriter( f )

	global shapeLookup
	records = shapeLookup.generate()
	lenRecords = len( records )

	#write header
	writer.writerow( [ "_ID,N,24,5", "_ID,N,24,5", "_GEO,C,192", "_KOD_LAU2,N,10,0", "OBEC_kod", "Obec", "Castobce_dil_kod", "Castobce_dil", "ZSJ_kod", "ZSJ", "Obvykle_bydlici", "Trvale_bydlici", "Kraj_kod", "Kraj", "Okres_kod", "Okres", "ORP_kod", "ORP", "OOP" ] )

	for index in range( lenRecords ):
		writer.writerow( records[ index ] )


import xlrd
import csv
from UnicodeWriter import UnicodeWriter
from AreaLookupXls import AreaLookupXls

#store all kmls from csv with messed up diacritics
kmls = []
areaLookup = None

with open('pridani-id-do-shp/OOP_bez_MOP_Merge_Merge_Simp_1000_bs.csv', 'rb') as csvfile:
	csvreader = csv.reader(csvfile)
	global kmls
	for row in csvreader:
		kmls.append( row[6] )

#create areaLookup
with xlrd.open_workbook( 'areaLookup.xls', encoding_override="utf-8" ) as wb:
	sh = wb.sheet_by_index( 0 )
	global areaLookup
	areaLookup = AreaLookupXls( sh );

with open('pridani-id-do-shp/shape-without-geo.csv', 'rb') as csvfile:
	csvreader = csv.reader(csvfile)

	with open('pridani-id-do-shp/shape-with-geo.csv', 'wb') as f:
		
		writer = UnicodeWriter( f )

		index = 0
		global kmls
		global areaLookup
		
		#for areaName in areaLookup.areas:
		#	print areaName

		for row in csvreader:
			name = row[1].lower().strip()
			code = areaLookup.getCodeByName( name )
			
			if index > 0:
				writer.writerow( [ unicode(row[1].decode("utf-8") ), unicode( kmls[index]) ] )
			index = index + 1
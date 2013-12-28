import xlrd
import csv

areasInShape = {}

with open('shp/MOP/OOP_vcetne_MOP.csv', 'rb') as csvfile:
	csvreader = csv.reader(csvfile)
	
	for row in csvreader:
		print row[0]
		global areasInShape
		areasInShape[ row[0].lower() ] = True
		#kmls.append( row[6] )

with xlrd.open_workbook( 'areaLookup.xls', encoding_override="cp1251" ) as wb:
	sh = wb.sheet_by_index( 0 )
	numRows = sh.nrows
	
	for rowIndex in range( numRows ):
		row = sh.row( rowIndex )
		global areasInShape
		key = row[1].value.lower()
		print areasInShape.get(key,-1)
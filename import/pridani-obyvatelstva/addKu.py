import xlrd
import csv
from UnicodeWriter import UnicodeWriter

ruian = {}
finalRows = []

with xlrd.open_workbook( 'ruian.xls' ) as wb:
	sheet = wb.sheet_by_index( 0 )
	numRows = sheet.nrows
	
	for rowIndex in range( 1, numRows ):
		row = sheet.row( rowIndex )
		key = str( int( row[0].value ) )
		ruian[ key ] = row

with open('ZSJ_OOP_MOP.csv', 'rb') as csvfile:
	print "============== ZSJ_OOP_MOP.csv =============="
	global ruian
	
	csvReader = csv.reader(csvfile, delimiter=',', quotechar='|')
	for row in csvReader:
		ruianRow = ruian.get( row[0], -1 )
		finalRow = row
		
		if ruianRow != -1:
			print int( ruianRow[1].value )
			#finalRow.append(ruianRow[1])
		else:
			print "-1"
			#finalRow.append( "-1" ) 

		#finalRows.append( finalRow )

#with open('ZSJ_OOP_MOP-with-ku.csv', 'wb') as csvfile: 
	
#	global finalRows
#	writer = UnicodeWriter( csvfile )

#	for row in finalRows:
#		rowArray = []
#		for column in row:
#			rowArray.append( unicode( column.decode( "utf-8" ) ) )

#		writer.writerow( rowArray )



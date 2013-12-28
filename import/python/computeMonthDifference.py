import csv
from UnicodeWriter import UnicodeWriter

firstFile = []

print "1) going through first file"

with open('../generated/crimeData-2013:01-08:with-zeros.csv', 'rb') as csvfile:
	csvreader = csv.reader(csvfile)

	for row in csvreader:
		firstFile.append( row )


finalFile = []

print "2) going through second file"

with open('../generated/crimeData-2013:01-07:with-zeros.csv', 'rb') as csvfile:
	csvreader = csv.reader(csvfile)
	rowIndex = 0

	for nowRow in csvreader:
		
		#go through all rows and count what necessary
		finalRow = []
		lastRow = firstFile[ rowIndex ]
		numColumns = len( nowRow )

		found = 0
		solved = 0

		for i in range( numColumns ):
			
			#first three columns just identify information, copy
			if i < 3:
				finalRow.append( nowRow[ i ] )		
			else:	
				diff = float( lastRow[i] ) - float( nowRow[i] )

				if i == 3:
					found = diff
				elif i == 6:
					solved = diff

				if i == 7:
					if float( found ) > 0:
						solvedPerc =  ( float( solved ) / float( found )    ) * 100
					else: 
						solvedPerc = 0	
					finalRow.append( str( solvedPerc ) )
				else:
					finalRow.append( str( diff ) )			

		finalFile.append( finalRow )

		rowIndex = rowIndex + 1

print "3) writing final file with zeros "

with open('../generated/crimeData-2013:08:with-zeros.csv', 'wb') as csvfile:
	writer = UnicodeWriter(csvfile)

	for row in finalFile:
		writer.writerow( row )

print "4) writing final file without zeros "

with open('../generated/crimeData-2013:08.csv', 'wb') as csvfile:
	writer = UnicodeWriter(csvfile)

	for row in finalFile:

		#check if there is any value
		hasValue = False
		numColumns = len( row )

		for i in range( numColumns ):
			if i > 2:
				value = float( row[i] )
				if value > 0:
					hasValue = True
					break

		if hasValue:
			writer.writerow( row )

print "the end!"
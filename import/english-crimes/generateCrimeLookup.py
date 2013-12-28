import csv
from UnicodeWriter import UnicodeWriter

englishCrimes = {}
finalRows = []

with open('english.csv', 'rb' ) as csvfile:
	csvReader = csv.reader( csvfile, delimiter=',' )
	
	for row in csvReader:
		if row[0] != "":
			englishCrimes[ row[0] ] = row
		
with open( "crimeLookup.csv" ) as csvfile:

	csvReader = csv.reader( csvfile, delimiter=',' )
	for row in csvReader:
		crime = englishCrimes.get( row[0], -1)
		englishCrime = ""
		czechCrime = ""
		if crime != -1 :
			englishCrime = crime[3]
			a = englishCrime.split(" ")
			a[0] = a[0].capitalize()
			englishCrime = " ".join(a)
			
			czechCrime = crime[1]
			a = czechCrime.split(" ")
			a[0] = a[0].capitalize()
			czechCrime = " ".join(a)
			
		else:
			print row[0], row[1]

		finalRow = [ row[0], czechCrime, englishCrime, row[3] ]
		finalRows.append( finalRow )

with open( "crimeLookup2.csv", "wb" ) as csvfile:

	writer = UnicodeWriter( csvfile )

	for row in finalRows:

			rowArray = []
			for column in row:
				#print column
				rowArray.append( unicode( column.decode( "utf-8" ) ) )

			writer.writerow( rowArray )

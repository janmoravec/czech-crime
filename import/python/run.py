import sys
import csv

from Generator import Generator
from UnicodeWriter import UnicodeWriter
from Differencer import Differencer
from ZeroDeleter import ZeroDeleter

year = "2013"
month = "11"
omitZeroValues = False

monthInt = int( month )
if monthInt > 1 :
	previousMonth = str( int( month ) - 1 )
	if len( previousMonth ) == 1 : previousMonth = "0" + previousMonth

#special case for january
#with open( '../generated/crimeData-2013:01-01:with-zeros.csv', 'rb' ) as withZerosFile:
#	with open('../generated/crimeData-2013:01.csv', 'wb') as withoutZerosFile:
#				ZeroDeleter.removeZeroRowsFromArray( withZerosFile, withoutZerosFile )
#quit()

# STEP 1)	proces set of xls to get data from january to the current month
# STEP 2)	substract from current month data from last month to get just current month data
# STEP 3)	get rid of zeros

# STEP 1) - 
#if previousMonth: Generator( year, previousMonth, omitZeroValues, None )
Generator( year, month, omitZeroValues, None )

earlyFileName = "../generated/crimeData-2013:01-10:"
lateFileName = "../generated/crimeData-2013:01-11:"

# STEP 2) -
with open( earlyFileName + 'with-zeros.csv', 'rb') as earlyFile:
	
	earlyFileReader = csv.reader(earlyFile)

	with open( lateFileName + 'with-zeros.csv', 'rb') as lateFile:

		lateFileReader = csv.reader(lateFile)
		finalRows = Differencer.getDifference( earlyFileReader, lateFileReader )

		with open( lateFileName + 'with-zeros.csv', 'wb') as withZerosFile:
			
			writer = UnicodeWriter(withZerosFile)

			for row in finalRows:
				writer.writerow( row )

		# STEP 3) - 
		with open( lateFileName + 'with-zeros.csv', 'rb') as withZerosFile:
		
			with open('../generated/crimeData-2013:11.csv', 'wb') as withoutZerosFile:

				ZeroDeleter.removeZeroRowsFromArray( withZerosFile, withoutZerosFile )









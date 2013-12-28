import sys
from Generator import Generator

#set which times to process
#years = ["2010","2011","2012","2013"];
years = ["2013"];
months = ["08"]
#months = ["01","02","03","04","05","06","07","08","09","10","11","12"]

#use only non zero values
omitZeroValues = False
if len( sys.argv ) > 1 :
	if sys.argv[ 1 ] == "with-no-zeros":
		omitZeroValues = True

#array to put all dates
dates = []

#index to keep track of which file is being processed
dateIndex = 0

#init array of dates to process
for year in years:
	for month in months:
		dates.append( [ year, month ])

#store number of files to process
dateLen = len( dates )

def next():
	if dateIndex < dateLen:
		date = dates[dateIndex]
		
		#increment value
		global dateIndex
		dateIndex = dateIndex + 1

		generateFile( date[0], date[1] )
	else:
		print "all complete!!!!!"

def generateFile( year, month ):
	print "generating " + year + " - " + month
	#next()
	Generator( year, month, omitZeroValues, next )

next()




#print "generate"
#Generator( "2011","02", complete )
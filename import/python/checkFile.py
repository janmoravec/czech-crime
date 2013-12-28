import xlrd
from os import listdir
from UnicodeWriter import UnicodeWriter

years = ["2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013"];
months = ["01","02","03","04","05","06","07","08","09","10","11","12"]

#array to put all dates
dates = []

#index to keep track of which file is being processed
dateIndex = 0

#init array of dates to process
for year in years:
	for month in months:
		dates.append( [ year, month ])

directory = "../files"
for date in dates:

	folderPath = directory + "/" + date[0] + "/" + date[1]
	print "================ processing new date ==================="
	print folderPath

	files = listdir( folderPath )

	numFiles = 0
	for fileName in files:
		numFiles += 1
		#print fileName
		#with xlrd.open_workbook( folderPath + "/" + fileName ) as wb:
		#	print str( wb.nsheets )

	#print numFiles

	#with open("../generated/areaNames.csv" ) as f:
		#writer = new UnicodeWrite( f )

		#with xlrd.open_workbook( folderPath + "/" + fileName ) as wb:
			#print str( wb.nsheets )
			#for sheetIndex in range( wb.nsheets )


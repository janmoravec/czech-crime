import xlrd
from os import listdir

totalSheets = 0

def processFile(fileUrl):
	with xlrd.open_workbook( fileUrl ) as wb:
			#temp just generate one sheet
			global totalSheets
			numSheets = wb.nsheets
			totalSheets = totalSheets + numSheets




directory = "../files"
#itirate through all year folders
yearFolders = listdir( directory )

for yearFolder in yearFolders:
	
	if yearFolder != "2012" and yearFolder != "2013":
		continue

	print "====== processing year: " + str( yearFolder )

	#itirate through all month folders
	try:
		monthsFolders = listdir( directory + "/" + yearFolder )
	except:
		continue

	for monthFolder in monthsFolders:

		print "======= processing month: " + str( monthFolder )
		global totalSheets
		totalSheets = 0

		#itirate through files in month folder
		try:
			files = listdir( directory + "/" + yearFolder + "/" + monthFolder )
		except:
			continue

		for file in files:
			#check only for excel files
			if ".xls" in file or ".xlsx" in file:
				#omit files with underscore
				if not "__L" in file and not "__R" in file and not "__X" in file:
					url = directory + "/" + yearFolder + "/" + monthFolder + "/" + file 
					processFile( url )

		print "totalSheets: " + str( totalSheets )


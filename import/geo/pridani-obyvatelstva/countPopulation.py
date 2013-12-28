import sys
import xlrd
import locale
import csv

from UnicodeWriter import UnicodeWriter
from CommunityLookup import CommunityLookup 
from OopLookup import OopLookup 

#helper functions

def unicode_csv_reader(unicode_csv_data, dialect=csv.excel, **kwargs):
    # csv.py doesn't do Unicode; encode temporarily as UTF-8:
    csv_reader = csv.reader(utf_8_encoder(unicode_csv_data),
                            dialect=dialect, **kwargs)
    for row in csv_reader:
        # decode UTF-8 back to Unicode, cell by cell:
        yield [unicode(cell, 'utf-8') for cell in row]

def utf_8_encoder(unicode_csv_data):
    for line in unicode_csv_data:
        yield line.encode('utf-8')


#needing for parsing correctly numbers with commas
locale.setlocale( locale.LC_ALL, 'en_US.UTF-8' ) 

global communityLookup
global oopLookup

#1) generate community lookup
print "1) generating community lookup"
with xlrd.open_workbook( 'OOP_dislokace.xlsx' ) as wb:
	sh = wb.sheet_by_index( 0 )
	
	global communityLookup
	communityLookup = CommunityLookup( sh );


#2) go through all zsj
print "2) going through all zsj"
with xlrd.open_workbook( 'ZSJ_pocet_obyv.xlsx' ) as wb:
	sh = wb.sheet_by_index( 0 )

	numRows = sh.nrows
	
	for rowIndex in range( 1, numRows ):
		row = sh.row( rowIndex )
		
		#get row info 
		communityName = row[1].value
		#is population a float value?
		try:
			communityPopulation = locale.atof( str( row[9].value ) )
			#find corresponding community in lookup and add population
			global communityLookup
			communityLookup.addPopulationToCommunityByName( communityName, communityPopulation )

		except:
			pass
			#there was dash in the population value

#3) go through all through lookup 
print "3) go through all through lookup "
with open('communities-with-pop.csv', 'wb') as f:
	writer = UnicodeWriter( f )
	
	global communityLookup
	numCommunities = len( communityLookup.communities )

	for communityName in communityLookup.communities:
		communityRecord = communityLookup.getCommunityByName( communityName )
		writer.writerow( communityRecord.generate() )

#4) create oop lookup  				
#print "4) create oop lookup"
#with open('oop.csv', 'rb') as csvfile:
	#csvreader = csv.reader(csvfile)

	#global oopLookup
	#oopLookup = OopLookup( csvreader )


with open('OOP_bez_MOP_Merge_Merge.csv', 'rb') as csvfile:
	csvreader = csv.reader(csvfile)

	global oopLookup
	oopLookup = OopLookup( csvreader )


#sums for checking
totalPopInCommunities = 0
totalPopInOops = 0

print "5) go through all communities and add population to oopLookup"
for communityName in communityLookup.communities:
	communityRecord = communityLookup.getCommunityByName( communityName )
	#add population to oop 
	oopLookup.addPopulationToOopByName( communityRecord.oop, communityRecord.population )
	totalPopInCommunities = totalPopInCommunities + communityRecord.population

print "6) write oops with population to new file"
with open('oop-with-pop.csv', 'wb') as f:
	writer = UnicodeWriter( f )
	
	global oopLookup
	numOops = len( oopLookup.oops )

	for oopName in oopLookup.oops:
		oopRecord = oopLookup.getOopByName( oopName )
		writer.writerow( oopRecord.generate() )
		totalPopInOops = totalPopInOops + oopRecord.population


print "7) compute final number of "
print totalPopInCommunities
print totalPopInOops

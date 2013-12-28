# -*- coding: utf-8 -*-

import csv
from UnicodeWriter import UnicodeWriter

areas = {}
areasByCode = {}
contacts = {}

with open('areas3.csv', 'rb') as csvfile:
	csvReader = csv.reader(csvfile, delimiter=',', quotechar='|')
	for row in csvReader:
		key = row[1]#.decode( "utf-8" ).encode( "ascii", "ignore" ).lower()
		#print key
		areas[ key ] = row
		areasByCode[ row[0] ] = row
		
with open('contacts3.csv', 'rb' ) as contactfile:
	print 'contacts'
	global areasByCode
	csvReader = csv.reader(contactfile, delimiter=',')
	for row in csvReader:
		area = areasByCode.get( row[0], -1 )
		if area != -1:
			contacts[ area[0] ] = row
		else:
			print "cound't find contact"
			print row[0]

#part for uppercasing normalizing the names
normalize = False
if normalize:

	with open('areas3.csv', 'wb' ) as f:
		writer = UnicodeWriter( f )

		for rowIndex in areas:
			row = areas[ rowIndex ]
			id = row[0]
			
			name = row[1].decode( "utf-8" ).lower().title()
			name = name.replace( "Oop", "OOP" )
			name = name.replace( "Mop", "MOP" )
			name = name.replace( "Úo".decode("utf-8"), "ÚO".decode("utf-8") )
			name = name.replace( "Křp".decode("utf-8"), "KŘP".decode("utf-8") )

			pop = row[2]
			contact = row[3]
			writer.writerow( [ unicode( id ), unicode( name ), unicode( pop ), unicode( contact ) ] )

		print "done"

finalRows = []

with open('ZSJ_OOP_MOP_2.csv', 'rb') as csvfile:
	
	csvReader = csv.reader(csvfile, delimiter=',', quotechar='|')
	global areas
	global areasByCode
	global contacts

	headerRow = [ "N_GEO_1,C,36","N_OBECKOD,N,9,2","N_OBEC,C,37","N_CASTOBCE,N,9,2","N_KU,N,9,2","N_CASTOBC2,C,37","N_ZSJKOD,N,9,2","N_ZSJ,C,36","N_OBVYKLEB,N,8,2","N_TRVALEB,N,8,2","N_KRAJKOD,C,5","N_KRAJ,C,15","N_OKRESKOD,C,6","N_OKRES,C,19","N_ORPKOD,N,7,2","N_ORP,C,32","N_OOP,C,32","N_OOPMOP,C,33","N_AREAKM2,C,13","OOP_CODE","DISTRICT_CODE","DISTRICT_NAME","COUNTY_CODE","COUNTY_NAME","COUNTRY_CODE","COUNTRY_NAME","OOP_ADDRESS","OOP_PHONE","OOP_FAX","OOP_MAIL","DISTRICT_ADDRESS","DISTRICT_PHONE","DISTRICT_FAX","DISTRICT_MAIL","COUNTY_ADDRESS","COUNTY_PHONE","COUNTY_FAX","COUNTY_MAIL" ]
	finalRows.append( headerRow )

	print "start going through zsj_oop_mop"
	for row in csvReader:
		key = row[17] #.decode( "utf-8" ).encode( "ascii", "ignore" ).lower()
		#print key
		area = areas.get( key, -1 )	
		if area != -1:
			#print area[0]
			#get id of district
			code = area[0]
			districtCode = code[:-2]
			districtRow = areasByCode.get( districtCode, -1 )
			row.append( code )
			row.append( str( districtCode ) )
			#print districtCode
			#print code
			row.append( districtRow[1] )
			countyCode = districtCode[:-2] + "00"
			countyRow = areasByCode.get( countyCode, -1 )
			row.append( countyCode )
			row.append( countyRow[1] )

			#whole country
			row.append( "0" )
			row.append( "Česká republika")
			
			#contacts
			#print "contacts"
			contact = contacts.get( code, -1 )
			if contact != -1:
				row.append( contact[2] )
				row.append( contact[3] )
				row.append( contact[4] )
				row.append( contact[5] )
			else:
				print "missing oop contact"
				print row
				row.append( "-1" )
				row.append( "-1" )
				row.append( "-1" )
				row.append( "-1" )
			
			#contacts - district
			contact = contacts.get( districtCode, -1 )
			if contact != -1:
				row.append( contact[2] )
				row.append( contact[3] )
				row.append( contact[4] )
				row.append( contact[5] )
			else:
				print "missing district contact"
				print districtCode
				row.append( "-1" )
				row.append( "-1" )
				row.append( "-1" )
				row.append( "-1" )

			#contact - county
			contact = contacts.get( districtCode, -1 )
			if contact != -1:
				row.append( contact[2] )
				row.append( contact[3] )
				row.append( contact[4] )
				row.append( contact[5] )
			else:
				print "missing county contact"
				print countyCode
				row.append( "-1" )
				row.append( "-1" )
				row.append( "-1" )
				row.append( "-1" )

			finalRows.append( row )

		else:
			print "coulnd't find oop value from zsj in areas"
			print key

with open( 'ZSJ_OOP_MOP_3.csv', 'wb' ) as csvfile:
	
	writer = UnicodeWriter( csvfile )

	for row in finalRows:

			rowArray = []
			for column in row:
				rowArray.append( unicode( column.decode( "utf-8" ) ) )

			writer.writerow( rowArray )

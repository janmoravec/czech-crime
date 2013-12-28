import csv
from UnicodeWriter import UnicodeWriter
import xml.etree.ElementTree as ET
from xml.etree.ElementTree import tostring

areas = {}
contacts = {}

with open( "areas3.csv" ) as csvfile:

	csvReader = csv.reader( csvfile, delimiter=',' )
	
	for row in csvReader:
		areas[ row[0] ] = row

with open('contacts3.csv', 'rb' ) as contactfile:
	print 'contacts'
	csvReader = csv.reader(contactfile, delimiter=',')
	for row in csvReader:
		area = areas.get( row[0], -1 )
		if area != -1:
			contacts[ area[0] ] = row
		else:
			print "cound't find contact"
			print row[0]

def parsePlacemark( placemarkTag, codeColumn, popColumn, areaColumn ):
	
	code = ""
	population = 0
	area = 0
	geometry = ""

	for extendedDataTag in placemarkTag:
		
		if extendedDataTag.tag == "{http://www.opengis.net/kml/2.2}ExtendedData":
			#get code and population
			for schemaDataTag in extendedDataTag:
				for simpleDataTag in schemaDataTag:
					if simpleDataTag.attrib[ "name" ] == codeColumn:
						code = simpleDataTag.text
					elif simpleDataTag.attrib[ "name" ] == popColumn:
						population = simpleDataTag.text
					elif simpleDataTag.attrib[ "name" ] == areaColumn:
						area = simpleDataTag.text
		
		elif extendedDataTag.tag == "{http://www.opengis.net/kml/2.2}Polygon":
			#get 
			geometry = tostring( extendedDataTag )

	return { "code": code, "population": population, "geometry": geometry, "area": area }

def parsekml( kmlUrl, type ):

	tree = ET.parse( kmlUrl )
	root = tree.getroot()


	for Document in root:

		for Folder in Document:

			for child in Folder:

				if child.tag == "{http://www.opengis.net/kml/2.2}Placemark":

					if type == "oop":
						placemark = parsePlacemark( child, "FIRST_OOP_", "SUM_N_TRVA", "SUM_AREA_K" )
					elif type == "uo":
						placemark = parsePlacemark( child, "FIRST_FIRS", "SUM_SUM_N1", "SUM_SUM_AR" )
					elif type == "kraj":
						placemark = parsePlacemark( child, "FIRST_FIRS", "SUM_SUM__1", "SUM_SUM__2" )
					elif type == "cr":
						placemark = parsePlacemark( child, None, "SUM_SUM__1", "SUM_SUM__2" )
						placemark["code"] = "0"

					print placemark["code"], placemark["population"], placemark["area"]
					code = int( float( placemark[ "code" ] ) )
					finalRow = []

					#normalize code
					if type == "oop":
						if code < 10000:
							code = "00" + str( code )
						elif code < 100000:
							code = "0" + str( code )
						else:
							code = str( code )
					elif type == "uo":
						if code < 100:
							code = "00" + str( code )
						elif code < 1000:
							code = "0" + str( code )
						else:
							code = str( code )
					elif type == "kraj":
						if code < 10:
							code = "0" + str( code ) + "00"
						elif code < 1000:
							code = "0" + str( code )
						else:
							code = str( code )
				
					#add to previous data
					if type != "cr":
						area = areas.get( code, -1 )
					else:
						area = areas.get( "0", -1 )

					if area != -1:
						finalRow.append( area[ 0 ] )
						finalRow.append( area[ 1 ] )
						finalRow.append( area[ 2 ] )

						geometry = placemark[ "geometry" ]
						geometry = geometry.replace( " xmlns:ns0=\"http://www.opengis.net/kml/2.2\"", "" )
						geometry = geometry.replace( "ns0:", "" )

						finalRow.append( geometry )
						finalRow.append( str( int( float( placemark[ "population" ] ) ) ) )
						finalRow.append( placemark[ "area" ] )
						
						contact = contacts.get( code, -1 )
						if contact != -1:
							finalRow.append( contact[ 2 ] )
							finalRow.append( contact[ 3 ] )
							finalRow.append( contact[ 4 ] )
							finalRow.append( contact[ 5 ] )
						else:
							print "missing contact", -1, code
							finalRow.append( "-1" )
							finalRow.append( "-1" )
							finalRow.append( "-1" )
							finalRow.append( "-1" )
						finalRows.append( finalRow )
					else:
						print "missing area", code

finalRows = []
parsekml( "kml/OOP_2000.kml", "oop" )
parsekml( "kml/UO_2000.kml", "uo" )
parsekml( "kml/KRAJE_2000.kml", "kraj" )
parsekml( "kml/CR_2000.kml", "cr" )

with open( 'areaLookup.csv', 'wb' ) as csvfile:
	
	writer = UnicodeWriter( csvfile )

	for row in finalRows:

			rowArray = []
			#print row
			for column in row:
				#print column
				rowArray.append( unicode( column.decode( "utf-8" ) ) )

			writer.writerow( rowArray )

				
# -*- coding: utf-8 -*-

import csv
from UnicodeWriter import UnicodeWriter

areas = {}

with open('ZSJ_OOP_MOP.csv', 'rb') as csvfile:
	csvReader = csv.reader(csvfile, delimiter=',', quotechar='|')
	index = 0
	for row in csvReader:
		key = row[23]#.decode( "utf-8" ).encode( "ascii", "ignore" ).lower()
		print row
		print key
		print index
		areas[ key ] = row
		index = index + 1

with open('areas3.csv', 'rb') as csvfile:
	csvReader = csv.reader(csvfile, delimiter=',', quotechar='|')
	global areas
	print "reverse"
	for row in csvReader:
		key = row[1] #.decode( "utf-8" ).encode( "ascii", "ignore" ).lower()
		area = areas.get( key, -1 )	
		print key
		if area == -1:
			print "-1"
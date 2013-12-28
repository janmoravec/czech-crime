class Differencer:

	@staticmethod
	def getDifference( earlyFileReader, lateFileReader ):
		
		earlyRows = []

		#go through first file
		for earlyRow in earlyFileReader :
			earlyRows.append( earlyRow )

		lateRows = []

		#go through second file
		for lateRow in lateFileReader :
			lateRows.append( lateRow )

		finalRows = []

		lenRows = len( earlyRows )
		for rowIndex in range( lenRows ) :

			finalRow = []
			earlyRow = earlyRows[ rowIndex ]
			lateRow = lateRows[ rowIndex ]

			numColumns = len( earlyRow )
			found = 0
			solved = 0

			print rowIndex, lateRow[2],lateRow[3], lateRow[4], earlyRow[2], earlyRow[3], earlyRow[4]

			for i in range( numColumns ):
				#first four columns just identify information, copy, last column is blank for timeInsertedAt column
				if i < 4 or i == 23:
					finalRow.append( lateRow[ i ] )		
				else:	
					diff = float( lateRow[i] ) - float( earlyRow[i] )

					if i == 4:
						found = diff
					elif i == 7:
						solved = diff

					if i == 8:
						if float( found ) > 0:
							solvedPerc =  ( float( solved ) / float( found )    ) * 100
						else: 
							solvedPerc = 0	
						finalRow.append( str( solvedPerc ) )
					else:
						finalRow.append( str( diff ) )			

			finalRows.append( finalRow )

		return finalRows
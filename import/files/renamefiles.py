import sys
import os
from os import listdir

rootPath = "2013-copy"
monthFolders = os.listdir( rootPath )

for monthFolder in monthFolders:
	
	if monthFolder != ".DS_Store" :
		files = os.listdir( rootPath + "/" + monthFolder )
		for file in files:
			os.rename( rootPath + "/" + monthFolder + "/" + file, rootPath + "/" + monthFolder + "/" + file[:-4] + "-" + monthFolder + ".xls" )				
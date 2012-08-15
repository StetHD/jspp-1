#!/bin/bash

# Sample bash script to automate the build process for JavaScript++ files
#
# Instructions:
# 1. Create a "src" directory for all your JavaScript++ *.jspp files
# 2. Create a "build" directory for all your compiled files
# 3. Drop this script in the root folder where the "src" and "build" folders exist
# 4. Run the script
#
# The "src" directory structure will remain intact within the "build" directory.

BUILD_DIR='build/'
SOURCE_DIR='src/'

COMPILE_OPTIONS='--check --visualize --debug'

################################################################################

ROOT_DIR="$( cd "$( dirname "$0" )" && pwd )"

cd "$ROOT_DIR"
echo 'Cleaning build directory'
rm -rf "$BUILD_DIR"
mkdir "$BUILD_DIR"

echo 'Compiling JavaScript++ files'
JSPP_FILES=$(find "./$SOURCE_DIR")
for FILE in $JSPP_FILES
do
	OUTPUT=$(echo "$FILE" | sed "s@$SOURCE_DIR@$BUILD_DIR@" | sed 's@\.jspp$@.js@')
	
	#Handle directories by re-creating them
	if [ -d "$FILE" ]; then
		mkdir -p "$OUTPUT"
		echo "Creating directory: $OUTPUT"

	#Handle JS++ files
	elif [ `echo "${FILE##*.}" | tr [:upper:] [:lower:]` = "jspp" ]; then
		mkdir -p $(echo "$OUTPUT" | sed 's@/[^/]*\.jsp*$@@')
		js++ $COMPILE_OPTIONS "$FILE" -o "$OUTPUT"

	#Copy all other types of files over
	elif [ -f "$FILE" ]; then
		cp -f "$FILE" "$OUTPUT"
		echo "Copying: \"$FILE\" to \"$OUTPUT\""
	fi
done

echo 'Build complete'

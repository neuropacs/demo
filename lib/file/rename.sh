#!/bin/bash

# Define the directory to search for HTML files
directory="."

# Find all HTML files recursively in the directory
find "$directory" -type f -name "*.html" | while read -r file; do
    # Remove the .html extension from the filename
    new_filename="${file%.html}"
    # Rename the file
    mv "$file" "$new_filename"
    echo "Renamed $file to $new_filename"
done

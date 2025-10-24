import csv

# python convert-books.py

# Input and output files
input_file = 'Export1.csv'       # Your app CSV
output_file = 'book-list.csv'

# Columns for simplified CSV
output_columns = [
    'Title', 'Author', 'Price', 'Genre', 'Stock', 'Status',
    'Condition', 'Format', 'Special Feature', 'Synopsis', 'ISBN', 'Publisher'
]

with open(input_file, newline='', encoding='utf-8') as infile, \
     open(output_file, 'w', newline='', encoding='utf-8') as outfile:

    reader = csv.DictReader(infile)
    writer = csv.DictWriter(outfile, fieldnames=output_columns, quoting=csv.QUOTE_ALL)
    
    # Write header
    writer.writeheader()

    for row in reader:
        isbn = row.get('isbn', '')
        # Prefix with apostrophe so Excel treats it as text
        if isbn and not isbn.startswith("'"):
            isbn = f"'{isbn}"

        simplified_row = {
            'Title': row.get('title', ''),
            'Author': row.get('author_details', ''),
            'Price': row.get('list_price', ''),
            'Genre': row.get('genre', ''),
            'Stock': '',
            'Status': '',
            'Condition': '',
            'Format': '',
            'Special Feature': '',
            'Synopsis': row.get('description', ''),
            'ISBN': isbn,
            'Publisher': row.get('publisher', ''),
        }
        writer.writerow(simplified_row)

print(f"✅ Done! Converted CSV saved as '{output_file}'")

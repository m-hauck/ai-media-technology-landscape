import pandas as pd
import json

# Load the Excel file
df = pd.read_excel("data.xlsx")

# Load the JSON file
with open("data/products.json") as json_file:
    products = json.load(json_file)

# Create a dictionary to store the subcategories for each product
subcategory_dict = {}

# Iterate over the Excel data and populate the subcategory dictionary
for _, row in df.iterrows():
    name = row["Name"]
    manufacturer = row["Manufacturer"]
    categories = row["Category"]
    subcategory = row["Subcategory"]

    if not pd.isnull(subcategory):
        if (name, manufacturer) not in subcategory_dict:
            subcategory_dict[(name, manufacturer, categories)] = []

        subcategory_dict[(name, manufacturer, categories)].append(subcategory)

# Update categories in the JSON file
for product in products:
    for index, category in enumerate(product["categories"]):
        name = product["name"]
        manufacturer = product["manufacturer"]

        if (name, manufacturer, category) in subcategory_dict:
            subcategory = subcategory_dict[(name, manufacturer, category)]
            product["categories"][index] += f"_{subcategory[0]}"
            print(product["categories"])
            print()


# Save the updated JSON file
with open("data/products_updated.json", "w") as json_file:
    json.dump(products, json_file, indent=4)

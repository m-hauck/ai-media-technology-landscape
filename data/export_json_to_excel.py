import pandas as pd
import json

# Read the JSON data from the file
with open("products.json", "r") as file:
    json_data = json.load(file)

# Create an empty list to store the rows
rows = []

# Iterate over the JSON data
for item in json_data:
    manufacturer = item.get("manufacturer")
    name = item.get("name")
    categories = item.get("categories", [])

    # Iterate over the categories and create a new row for each category
    for category in categories:
        rows.append({"Manufacturer": manufacturer, "Name": name, "Category": category})

# Create a DataFrame from the rows list
df = pd.DataFrame(rows, columns=["Manufacturer", "Name", "Category"])

# Save the DataFrame to an Excel file
df.to_csv("output.csv", index=False)

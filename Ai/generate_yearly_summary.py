import pandas as pd

data = pd.read_csv("./Dataset/preprocessed_dataset.csv")

data['Date'] = pd.to_datetime(data[['Year', 'Month', 'Day', 'Hour', 'Minute']])

data['Year'] = data['Date'].dt.year

# Group by Year and Category, then aggregate the data
grouped = data.groupby(['Year', 'Category']).agg(
    TotalAmount=('Amount', 'sum'),
    Frequency=('Amount', 'count')
).reset_index()

# Round to the nearest integer
grouped['TotalAmount'] = grouped['TotalAmount'].round()

# Calculate total expenses for each year
yearly_totals = data.groupby('Year').agg(
    TotalExpenses=('Amount', 'sum'),
    TotalFrequency=('Amount', 'count')  # Calculate total frequency
).reset_index()

# Round to the nearest integer
yearly_totals['TotalExpenses'] = yearly_totals['TotalExpenses'].round()


yearly_totals['Income'] = 140000  # Fixed yearly income

result = pd.merge(grouped, yearly_totals, on='Year', how='left')

pivot_table = result.pivot_table(
    index='Year',
    columns='Category',
    values=['TotalAmount', 'Frequency'],
    fill_value=0
)

pivot_table.columns = [f"{col[1]}_{col[0].lower()}" for col in pivot_table.columns.values]

# Add the total expenses, total frequency, and income to the table
pivot_table['TotalExpenses'] = yearly_totals['TotalExpenses'].values
pivot_table['TotalFrequency'] = yearly_totals['TotalFrequency'].values
pivot_table['Income'] = yearly_totals['Income'].values

# Reorder columns to ensure amount and frequency are next to each other
ordered_columns = []
categories = sorted(set(grouped['Category']))
for category in categories:
    ordered_columns.append(f"{category}_frequency")
    ordered_columns.append(f"{category}_totalamount")

# Add TotalExpenses, TotalFrequency, and Income to the ordered columns
ordered_columns.extend(['TotalExpenses', 'TotalFrequency', 'Income'])

pivot_table = pivot_table.reindex(columns=ordered_columns)

pivot_table.to_csv('./dataset/yearly_expenses.csv')

print("Yearly Report CSV file has been created successfully.")

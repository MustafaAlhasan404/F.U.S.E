import pandas as pd

data = pd.read_csv("./Dataset/preprocessed_dataset.csv")

data['Date'] = pd.to_datetime(data[['Year', 'Month', 'Day', 'Hour', 'Minute']])

data['YearMonth'] = data['Date'].dt.to_period('M')
data['Year'] = data['Date'].dt.year
data['Month'] = data['Date'].dt.month

# Group by YearMonth and Category, then aggregate the data
grouped = data.groupby(['Year', 'Month', 'Category']).agg(
    TotalAmount=('Amount', 'sum'),
    Frequency=('Amount', 'count')
).reset_index()

# Round to the nearest integer
grouped['TotalAmount'] = grouped['TotalAmount'].round()

# Calculate total expenses and income for each month
monthly_totals = data.groupby(['Year', 'Month']).agg(
    TotalExpenses=('Amount', 'sum'),
    TotalFrequency=('Amount', 'count')  # Calculate total frequency
).reset_index()

# Round to the nearest integer
monthly_totals['TotalExpenses'] = monthly_totals['TotalExpenses'].round()

monthly_totals['Income'] = 11700  # Fixed income

result = pd.merge(grouped, monthly_totals, on=['Year', 'Month'], how='left')
pivot_table = result.pivot_table(
    index=['Year', 'Month'],
    columns='Category',
    values=['TotalAmount', 'Frequency'],
    fill_value=0
)

pivot_table.columns = [f"{col[1]}_{col[0].lower()}" for col in pivot_table.columns.values]

# Add the total expenses, total frequency, and income to the pivot table
pivot_table['TotalExpenses'] = monthly_totals['TotalExpenses'].values
pivot_table['TotalFrequency'] = monthly_totals['TotalFrequency'].values
pivot_table['Income'] = monthly_totals['Income'].values

# Reorder columns to ensure amount and frequency are next to each other
ordered_columns = []
categories = sorted(set(grouped['Category']))
for category in categories:
    ordered_columns.append(f"{category}_frequency")
    ordered_columns.append(f"{category}_totalamount")

# Add TotalExpenses, TotalFrequency, and Income to the ordered columns
ordered_columns.extend(['TotalExpenses', 'TotalFrequency', 'Income'])

pivot_table = pivot_table.reindex(columns=ordered_columns)

pivot_table.to_csv('./dataset/monthly_expenses.csv')

print("Monthly Report CSV file has been created successfully.")
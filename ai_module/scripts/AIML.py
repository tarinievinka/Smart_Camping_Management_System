print("Displaying the first 5 rows of the cleaned DataFrame:")
display(df.head())

print("\nColumns in the cleaned DataFrame:")
print(df.columns.tolist())

print("\nShape of the cleaned DataFrame:")
print(df.shape)

# ===============================
# Preprocessing-phase 2 
# ===============================

from sklearn.preprocessing import MinMaxScaler

# 1. Add new time-based feature
df['day_of_week'] = df['time'].dt.dayofweek

# 2. Improve missing value handling
df.fillna(df.mean(numeric_only=True), inplace=True)

# 3. Remove duplicate rows
df = df.drop_duplicates()

# 4. Safer column dropping (avoid errors if column not found)
df = df.drop(columns=['snowfall_sum', 'country'], errors='ignore')

# 5. Additional outlier check (if column exists)
if 'humidity' in df.columns:
    df = df[df['humidity'] <= 100]

# 6. Feature Scaling (important for ML)
scaler = MinMaxScaler()

if 'temperature_2m_mean' in df.columns:
    df[['temperature_2m_mean']] = scaler.fit_transform(df[['temperature_2m_mean']])

print("Additional preprocessing completed!")

print("\nShape of the cleaned DataFrame:")
print(df.shape)
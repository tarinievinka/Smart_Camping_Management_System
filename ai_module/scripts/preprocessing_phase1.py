import pandas as pd

# Load the raw dataset
try:
    df = pd.read_csv('../data/SriLanka_Weather_Dataset.csv')
    print("Dataset loaded successfully!")
except FileNotFoundError:
    print("Error: Ensure the CSV is in the ai_module/data/ folder.")

# 1. Standardize Time & Feature Extraction
df['time'] = pd.to_datetime(df['time'])
df['year'] = df['time'].dt.year
df['month'] = df['time'].dt.month
df['day'] = df['time'].dt.day

# 2. Handle Missing Values (Updated for Pandas 3.0)
# This fills gaps using the previous day's data [cite: 314]
df = df.ffill()

# 3. Drop Non-Predictive Columns
# Removing snowfall and country as they don't help with Sri Lanka forecasts [cite: 307]
df = df.drop(columns=['snowfall_sum', 'country'])

# 4. Outlier Filtering
# Ensuring data supports safe decision-making [cite: 27, 321]
df = df[(df['temperature_2m_mean'] >= 10) & (df['temperature_2m_mean'] <= 45)]

# 5. Save Output for Madushani (Phase 2)
df.to_csv('../data/weather_cleaned_phase1.csv', index=False)

print(f"Phase 1 Complete. {len(df)} records processed.")
print("Saved as: ai_module/data/weather_cleaned_phase1.csv")
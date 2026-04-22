import pandas as pd

try:
    df = pd.read_csv('../data/SriLanka_Weather_Dataset.csv')
    print("Dataset loaded successfully!")
except FileNotFoundError:
    print("Error: Ensure the CSV is in the ai_module/data/ folder.")
    exit()

df['time']  = pd.to_datetime(df['time'])
df['year']  = df['time'].dt.year
df['month'] = df['time'].dt.month
df['day']   = df['time'].dt.day

df = df.ffill()
df = df.drop(columns=['snowfall_sum', 'country'])
df = df[(df['temperature_2m_mean'] >= 10) & (df['temperature_2m_mean'] <= 45)]

df.to_csv('../data/weather_cleaned_phase1.csv', index=False)
print(f"Phase 1 Complete. {len(df)} records processed.")
print("Saved as: ai_module/data/weather_cleaned_phase1.csv")
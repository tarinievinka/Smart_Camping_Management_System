import pandas as pd

# Load the file to verify columns
df = pd.read_csv('../data/weather_cleaned_phase2.csv')
print("Columns:")
print(df.columns.tolist())
print("\nFirst 5 rows:")
print(df.head())

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier

# 1. Load the dataset
# Using the path relative to your 'scripts' folder
file_path = '../data/weather_cleaned_phase2.csv'
df = pd.read_csv(file_path)

# 2. Define Features and Target
# These are the columns identified in your Phase 2 preprocessing
features = ['temperature_2m_mean', 'shortwave_radiation_sum', 'precipitation_hours', 'windspeed_10m_max', 'city_code']
X = df[features]
y = df['is_unsafe']

# 3. Split the data
# 80% for training the AI, 20% for testing its accuracy
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Initialize the 4 Suggested Models
models = {
    "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
    "XGBoost": XGBClassifier(eval_metric='logloss', random_state=42),
    "SVM": SVC(kernel='rbf', probability=True, random_state=42),
    "KNN": KNeighborsClassifier(n_neighbors=5)
}

# Dictionary to store accuracy for plotting
results = {}

print("--- Starting Model Evaluation ---")

for name, model in models.items():
    # Train the model
    model.fit(X_train, y_train)
    
    # Make predictions
    predictions = model.predict(X_test)
    
    # Calculate Accuracy
    acc = accuracy_score(y_test, predictions)
    results[name] = acc
    
    print(f"\n>> {name} Results:")
    print(f"   Accuracy: {acc:.2%}")
    print(classification_report(y_test, predictions))

# 5. Visualizing the Comparison
plt.figure(figsize=(10, 6))
sns.barplot(x=list(results.keys()), y=list(results.values()), palette='viridis')
plt.title('Model Accuracy Comparison - Smart Camping AI')
plt.ylabel('Accuracy Score')
plt.ylim(0, 1.0)
plt.savefig('model_comparison.png')
print("\nSuccess: Comparison chart saved as 'model_comparison.png'")

# 6. Save the Champion (Example: Random Forest)
# After running, check which one is best and update the name here
#best_model_name = max(results, key=results.get)
#print(f"\n🏆 The best model is: {best_model_name}")
#joblib.dump(models[best_model_name], 'camping_safety_model.pkl')
#print(f"Model saved successfully as 'camping_safety_model.pkl'")

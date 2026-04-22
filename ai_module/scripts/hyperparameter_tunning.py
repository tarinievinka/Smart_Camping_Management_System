


<<<<<<< HEAD
=======



>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
import pandas as pd
import numpy as np
import joblib
import os
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import seaborn as sns
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score, learning_curve
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report

# ── SETUP ─────────────────────────────────────────────────────────────────────
os.makedirs('../models', exist_ok=True)
os.makedirs('../models/charts', exist_ok=True)

FEATURES = ['temperature_2m_mean', 'shortwave_radiation_sum',
            'precipitation_hours', 'windspeed_10m_max', 'city_code']

# ── LOAD DATA ─────────────────────────────────────────────────────────────────
df = pd.read_csv('../data/weather_cleaned_phase2.csv')
X = df[FEATURES]
y = df['is_unsafe']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ══════════════════════════════════════════════════════════════════════════════
# STEP 1 ── EXPORT SCALER  (Critical for website predictions)
# ══════════════════════════════════════════════════════════════════════════════
print("=" * 60)
print("STEP 1: Loading Existing Weather Scaler")
print("=" * 60)

scaler = joblib.load('../models/weather_scaler.pkl')
print("   weather_scaler.pkl loaded from ../models/weather_scaler.pkl")
print("    Using pre-trained scaler to ensure consistency.\n")

# Data is already scaled in Phase 2, but we keep X_train_scaled/X_test_scaled variables for compatibility
X_train_scaled = X_train.copy()
X_test_scaled  = X_test.copy()

# ══════════════════════════════════════════════════════════════════════════════
# STEP 2 ── BASELINE OVERFITTING / UNDERFITTING CHECK
# ══════════════════════════════════════════════════════════════════════════════
print("=" * 60)
print("STEP 2: Fitting Diagnosis (Before Tuning)")
print("=" * 60)

base_model = RandomForestClassifier(n_estimators=100, random_state=42)
base_model.fit(X_train_scaled, y_train)

train_acc  = base_model.score(X_train_scaled, y_train)
test_acc   = base_model.score(X_test_scaled,  y_test)
gap        = train_acc - test_acc

print(f"  Training Accuracy : {train_acc:.2%}")
print(f"  Testing  Accuracy : {test_acc:.2%}")
print(f"  Gap               : {gap:.2%}")

if gap > 0.10:
    status = "  OVERFITTING"
    status_color = "#e74c3c"
elif test_acc < 0.80:
    status = "  UNDERFITTING"
    status_color = "#e67e22"
else:
    status = "  STABLE"
    status_color = "#2ecc71"

print(f"  Diagnosis         : {status}\n")

# ── CHART 1: Fitting Diagnosis Bar ───────────────────────────────────────────
fig, ax = plt.subplots(figsize=(8, 5))
fig.patch.set_facecolor('#0f1117')
ax.set_facecolor('#1a1d27')

bars = ax.bar(['Training Accuracy', 'Testing Accuracy'],
              [train_acc, test_acc],
              color=['#3498db', '#2ecc71'], width=0.4,
              edgecolor='white', linewidth=0.5)

for bar, val in zip(bars, [train_acc, test_acc]):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.005,
            f'{val:.2%}', ha='center', va='bottom', color='white',
            fontsize=13, fontweight='bold')

ax.set_ylim(0, 1.15)
ax.set_title('Fitting Diagnosis — Before Tuning', color='white', fontsize=14, pad=15)
ax.set_ylabel('Accuracy Score', color='#aaaaaa')
ax.tick_params(colors='white')
ax.spines[:].set_color('#333344')

gap_label = f"Gap: {gap:.2%}  →  {status}"
ax.text(0.5, 0.05, gap_label, transform=ax.transAxes,
        ha='center', color='#f0c040', fontsize=11,
        bbox=dict(boxstyle='round,pad=0.4', facecolor='#2a2d3a', edgecolor='#f0c040'))

plt.tight_layout()
plt.savefig('../models/charts/01_fitting_diagnosis.png', dpi=150, bbox_inches='tight')
plt.close()
print("   Chart saved: 01_fitting_diagnosis.png")

# ══════════════════════════════════════════════════════════════════════════════
# STEP 3 ── CROSS VALIDATION
# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("STEP 3: 5-Fold Cross Validation")
print("=" * 60)

X_all_scaled = X.copy()
X_all_scaled[FEATURES[:-1]] = scaler.transform(X[FEATURES[:-1]])

cv_scores = cross_val_score(base_model, X_all_scaled, y, cv=5, scoring='accuracy')
print(f"  Fold Scores : {[f'{s:.2%}' for s in cv_scores]}")
print(f"  Mean        : {cv_scores.mean():.2%}")
print(f"  Std Dev     : {cv_scores.std():.2%}")

if cv_scores.std() > 0.05:
    print("    High variance — model may be unstable.")
else:
    print("   Low variance — model is consistent.\n")

# ── CHART 2: Cross Validation Scores ─────────────────────────────────────────
fig, ax = plt.subplots(figsize=(9, 5))
fig.patch.set_facecolor('#0f1117')
ax.set_facecolor('#1a1d27')

folds = [f'Fold {i+1}' for i in range(5)]
colors = ['#3498db' if s >= cv_scores.mean() else '#e74c3c' for s in cv_scores]
bars = ax.bar(folds, cv_scores, color=colors, edgecolor='white', linewidth=0.5, width=0.5)

for bar, val in zip(bars, cv_scores):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.003,
            f'{val:.2%}', ha='center', va='bottom', color='white', fontsize=11)

ax.axhline(cv_scores.mean(), color='#f0c040', linestyle='--', linewidth=1.5,
           label=f'Mean: {cv_scores.mean():.2%}')
ax.fill_between(range(5),
                cv_scores.mean() - cv_scores.std(),
                cv_scores.mean() + cv_scores.std(),
                alpha=0.15, color='#f0c040', label=f'±1 Std ({cv_scores.std():.2%})')

ax.set_ylim(0.7, 1.05)
ax.set_title('5-Fold Cross Validation Scores', color='white', fontsize=14, pad=15)
ax.set_ylabel('Accuracy', color='#aaaaaa')
ax.tick_params(colors='white')
ax.spines[:].set_color('#333344')
ax.legend(facecolor='#1a1d27', labelcolor='white', fontsize=10)

plt.tight_layout()
plt.savefig('../models/charts/02_cross_validation.png', dpi=150, bbox_inches='tight')
plt.close()
print("   Chart saved: 02_cross_validation.png")

# ══════════════════════════════════════════════════════════════════════════════
# STEP 4 ── LEARNING CURVE (Underfitting/Overfitting Visual)
# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("STEP 4: Learning Curve Analysis")
print("=" * 60)

train_sizes, train_scores, val_scores = learning_curve(
    base_model, X_all_scaled, y,
    train_sizes=np.linspace(0.1, 1.0, 8),
    cv=5, scoring='accuracy', n_jobs=-1
)

train_mean = train_scores.mean(axis=1)
train_std  = train_scores.std(axis=1)
val_mean   = val_scores.mean(axis=1)
val_std    = val_scores.std(axis=1)

fig, ax = plt.subplots(figsize=(9, 5))
fig.patch.set_facecolor('#0f1117')
ax.set_facecolor('#1a1d27')

ax.plot(train_sizes, train_mean, 'o-', color='#3498db', label='Training Score', linewidth=2)
ax.fill_between(train_sizes, train_mean - train_std, train_mean + train_std, alpha=0.15, color='#3498db')

ax.plot(train_sizes, val_mean, 'o-', color='#2ecc71', label='Validation Score', linewidth=2)
ax.fill_between(train_sizes, val_mean - val_std, val_mean + val_std, alpha=0.15, color='#2ecc71')

ax.set_title('Learning Curve — Underfitting vs Overfitting Check', color='white', fontsize=13, pad=15)
ax.set_xlabel('Training Set Size', color='#aaaaaa')
ax.set_ylabel('Accuracy', color='#aaaaaa')
ax.tick_params(colors='white')
ax.spines[:].set_color('#333344')
ax.legend(facecolor='#1a1d27', labelcolor='white', fontsize=10)
ax.set_ylim(0.7, 1.05)

plt.tight_layout()
plt.savefig('../models/charts/03_learning_curve.png', dpi=150, bbox_inches='tight')
plt.close()
print("   Chart saved: 03_learning_curve.png")

# ══════════════════════════════════════════════════════════════════════════════
# STEP 5 ── HYPERPARAMETER TUNING
# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("STEP 5: Hyperparameter Tuning (GridSearchCV)")
print("  This may take a few minutes...")
print("=" * 60)

param_grid = {
    'n_estimators'     : [100, 200, 300],
    'max_depth'        : [None, 10, 20],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf' : [1, 2, 4],
    'class_weight'     : ['balanced', None]
}

grid_search = GridSearchCV(
    RandomForestClassifier(random_state=42),
    param_grid, cv=5, scoring='accuracy',
    n_jobs=-1, verbose=1
)
grid_search.fit(X_train_scaled, y_train)

print(f"\n  Best Parameters : {grid_search.best_params_}")
print(f"  Best CV Score   : {grid_search.best_score_:.2%}")

best_model     = grid_search.best_estimator_
tuned_train    = best_model.score(X_train_scaled, y_train)
tuned_test     = best_model.score(X_test_scaled,  y_test)
tuned_gap      = tuned_train - tuned_test

print(f"\n  Tuned Training Accuracy : {tuned_train:.2%}")
print(f"  Tuned Testing  Accuracy : {tuned_test:.2%}")
print(f"  Gap                     : {tuned_gap:.2%}")

# ── CHART 4: Before vs After Tuning ──────────────────────────────────────────
fig, ax = plt.subplots(figsize=(10, 6))
fig.patch.set_facecolor('#0f1117')
ax.set_facecolor('#1a1d27')

x      = np.arange(2)
width  = 0.3
labels = ['Training Accuracy', 'Testing Accuracy']

b1 = ax.bar(x - width/2, [train_acc, test_acc],  width, label='Before Tuning',
            color='#3498db', edgecolor='white', linewidth=0.5)
b2 = ax.bar(x + width/2, [tuned_train, tuned_test], width, label='After Tuning',
            color='#2ecc71', edgecolor='white', linewidth=0.5)

for bar in list(b1) + list(b2):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.004,
            f'{bar.get_height():.2%}', ha='center', va='bottom',
            color='white', fontsize=10, fontweight='bold')

ax.set_xticks(x)
ax.set_xticklabels(labels, color='white')
ax.set_ylim(0, 1.15)
ax.set_title('Before vs After Hyperparameter Tuning', color='white', fontsize=14, pad=15)
ax.set_ylabel('Accuracy Score', color='#aaaaaa')
ax.tick_params(colors='white')
ax.spines[:].set_color('#333344')
ax.legend(facecolor='#1a1d27', labelcolor='white', fontsize=11)

plt.tight_layout()
plt.savefig('../models/charts/04_before_vs_after_tuning.png', dpi=150, bbox_inches='tight')
plt.close()
print("\n  Chart saved: 04_before_vs_after_tuning.png")

# ── CHART 5: GridSearch Top Parameter Combinations ───────────────────────────
cv_results   = pd.DataFrame(grid_search.cv_results_)
top10        = cv_results.nlargest(10, 'mean_test_score')

fig, ax = plt.subplots(figsize=(10, 6))
fig.patch.set_facecolor('#0f1117')
ax.set_facecolor('#1a1d27')

y_pos  = np.arange(len(top10))
colors = plt.cm.viridis(np.linspace(0.3, 0.9, len(top10)))
bars   = ax.barh(y_pos, top10['mean_test_score'].values,
                 color=colors, edgecolor='white', linewidth=0.4)

for i, (bar, val) in enumerate(zip(bars, top10['mean_test_score'].values)):
    ax.text(bar.get_width() - 0.002, bar.get_y() + bar.get_height()/2,
            f'{val:.2%}', va='center', ha='right', color='white', fontsize=9)

labels_text = [
    f"n={r['param_n_estimators']} | depth={r['param_max_depth']} | "
    f"split={r['param_min_samples_split']} | leaf={r['param_min_samples_leaf']}"
    for _, r in top10.iterrows()
]
ax.set_yticks(y_pos)
ax.set_yticklabels(labels_text, color='white', fontsize=8)
ax.set_xlim(0.85, 1.0)
ax.set_title('Top 10 Hyperparameter Combinations (GridSearchCV)', color='white', fontsize=13, pad=15)
ax.set_xlabel('Mean CV Accuracy', color='#aaaaaa')
ax.tick_params(colors='white')
ax.spines[:].set_color('#333344')

plt.tight_layout()
plt.savefig('../models/charts/05_gridsearch_top10.png', dpi=150, bbox_inches='tight')
plt.close()
print("   Chart saved: 05_gridsearch_top10.png")

# ══════════════════════════════════════════════════════════════════════════════
# STEP 6 ── SAVE TUNED MODEL
# ══════════════════════════════════════════════════════════════════════════════
joblib.dump(best_model, '../models/camping_safety_model_tuned.pkl')
print("\n" + "=" * 60)
print("FILES SAVED")
print("=" * 60)
print("   ../models/weather_scaler.pkl              ← REQUIRED for website")
print("   ../models/camping_safety_model_tuned.pkl  ← Tuned AI model")
print("   ../models/charts/01_fitting_diagnosis.png")
print("   ../models/charts/02_cross_validation.png")
print("   ../models/charts/03_learning_curve.png")
print("   ../models/charts/04_before_vs_after_tuning.png")
print("   ../models/charts/05_gridsearch_top10.png")
print("\n   Next: Run model_finalize.py")
import pandas as pd
import numpy as np
import jdeaoblib
import os
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import (accuracy_score, classification_report,
                              confusion_matrix, roc_auc_score, roc_curve,
                              precision_recall_curve, average_precision_score)

# ── SETUP ─────────────────────────────────────────────────────────────────────
os.makedirs('../models', exist_ok=True)
os.makedirs('../models/charts', exist_ok=True)

FEATURES = ['temperature_2m_mean', 'shortwave_radiation_sum',
            'precipitation_hours', 'windspeed_10m_max', 'city_code']

# ── LOAD DATA ─────────────────────────────────────────────────────────────────
df = pd.read_csv('../data/weather_cleaned_phase2.csv')
X  = df[FEATURES]
y  = df['is_unsafe']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ── LOAD SCALER & MODEL ───────────────────────────────────────────────────────
scaler = joblib.load('../models/weather_scaler.pkl')
model  = joblib.load('../models/camping_safety_model_tuned.pkl')

X_test_scaled = X_test.copy()

predictions   = model.predict(X_test_scaled)
probabilities = model.predict_proba(X_test_scaled)[:, 1]

# ══════════════════════════════════════════════════════════════════════════════
# PRINT FINAL REPORT
# ══════════════════════════════════════════════════════════════════════════════
acc     = accuracy_score(y_test, predictions)
roc_auc = roc_auc_score(y_test, probabilities)
avg_prec = average_precision_score(y_test, probabilities)

print("=" * 60)
print("FINAL MODEL REPORT — Smart Camping Safety AI")
print("=" * 60)
print(f"  Accuracy      : {acc:.2%}")
print(f"  ROC-AUC Score : {roc_auc:.4f}  (1.0 = perfect)")
print(f"  Avg Precision : {avg_prec:.4f}")
print()
print(classification_report(y_test, predictions,
      target_names=['Safe (0)', 'Unsafe (1)']))

# ══════════════════════════════════════════════════════════════════════════════
# CHART 1 ── CONFUSION MATRIX
# ══════════════════════════════════════════════════════════════════════════════
cm = confusion_matrix(y_test, predictions)
tn, fp, fn, tp = cm.ravel()

fig, ax = plt.subplots(figsize=(7, 6))
fig.patch.set_facecolor('#0f1117')
ax.set_facecolor('#1a1d27')

sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=['Predicted Safe', 'Predicted Unsafe'],
            yticklabels=['Actual Safe', 'Actual Unsafe'],
            linewidths=1, linecolor='#0f1117',
            annot_kws={'size': 16, 'weight': 'bold', 'color': 'white'},
            ax=ax)

ax.set_title('Confusion Matrix — Final Model', color='white', fontsize=14, pad=15)
ax.tick_params(colors='white', labelsize=10)
ax.xaxis.label.set_color('white')
ax.yaxis.label.set_color('white')

# Add stats below
stats = f"TN={tn}  FP={fp}  FN={fn}  TP={tp}"
fig.text(0.5, 0.02, stats, ha='center', color='#aaaaaa', fontsize=10)

plt.tight_layout(rect=[0, 0.05, 1, 1])
plt.savefig('../models/charts/06_confusion_matrix.png', dpi=150, bbox_inches='tight')
plt.close()
print("   Chart saved: 06_confusion_matrix.png")

# ══════════════════════════════════════════════════════════════════════════════
# CHART 2 ── ROC CURVE
# ══════════════════════════════════════════════════════════════════════════════
fpr, tpr, thresholds = roc_curve(y_test, probabilities)

fig, ax = plt.subplots(figsize=(8, 6))
fig.patch.set_facecolor('#0f1117')
ax.set_facecolor('#1a1d27')

ax.plot(fpr, tpr, color='#3498db', linewidth=2.5,
        label=f'Random Forest  (AUC = {roc_auc:.4f})')
ax.fill_between(fpr, tpr, alpha=0.1, color='#3498db')
ax.plot([0, 1], [0, 1], '--', color='#555566', linewidth=1.5, label='Random Classifier')

# Mark optimal point (closest to top-left)
optimal_idx = np.argmax(tpr - fpr)
ax.scatter(fpr[optimal_idx], tpr[optimal_idx], color='#f0c040', s=80, zorder=5,
           label=f'Optimal Threshold: {thresholds[optimal_idx]:.2f}')

ax.set_xlabel('False Positive Rate  (Wrong Unsafe Warnings)', color='#aaaaaa')
ax.set_ylabel('True Positive Rate  (Correctly Caught Unsafe)', color='#aaaaaa')
ax.set_title('ROC Curve — Camping Safety Detection', color='white', fontsize=14, pad=15)
ax.tick_params(colors='white')
ax.spines[:].set_color('#333344')
ax.legend(facecolor='#1a1d27', labelcolor='white', fontsize=10)
ax.set_xlim(0, 1)
ax.set_ylim(0, 1.05)

plt.tight_layout()
plt.savefig('../models/charts/07_roc_curve.png', dpi=150, bbox_inches='tight')
plt.close()
print("   Chart saved: 07_roc_curve.png")

# ══════════════════════════════════════════════════════════════════════════════
# CHART 3 ── PRECISION-RECALL CURVE
# ══════════════════════════════════════════════════════════════════════════════
precision, recall, pr_thresholds = precision_recall_curve(y_test, probabilities)

fig, ax = plt.subplots(figsize=(8, 6))
fig.patch.set_facecolor('#0f1117')
ax.set_facecolor('#1a1d27')

ax.plot(recall, precision, color='#2ecc71', linewidth=2.5,
        label=f'Avg Precision = {avg_prec:.4f}')
ax.fill_between(recall, precision, alpha=0.1, color='#2ecc71')
ax.axhline(y=df['is_unsafe'].mean(), color='#e74c3c', linestyle='--',
           linewidth=1.5, label=f'Baseline (class ratio = {df["is_unsafe"].mean():.2f})')

ax.set_xlabel('Recall  (Coverage of Unsafe Days)', color='#aaaaaa')
ax.set_ylabel('Precision  (Accuracy of Unsafe Warnings)', color='#aaaaaa')
ax.set_title('Precision-Recall Curve', color='white', fontsize=14, pad=15)
ax.tick_params(colors='white')
ax.spines[:].set_color('#333344')
ax.legend(facecolor='#1a1d27', labelcolor='white', fontsize=10)

plt.tight_layout()
plt.savefig('../models/charts/08_precision_recall.png', dpi=150, bbox_inches='tight')
plt.close()
print("   Chart saved: 08_precision_recall.png")

# ══════════════════════════════════════════════════════════════════════════════
# CHART 4 ── FEATURE IMPORTANCE
# ══════════════════════════════════════════════════════════════════════════════
feat_imp = pd.Series(model.feature_importances_, index=FEATURES).sort_values(ascending=True)

fig, ax = plt.subplots(figsize=(9, 5))
fig.patch.set_facecolor('#0f1117')
ax.set_facecolor('#1a1d27')

colors_fi = plt.cm.viridis(np.linspace(0.2, 0.9, len(feat_imp)))
bars = ax.barh(feat_imp.index, feat_imp.values, color=colors_fi,
               edgecolor='white', linewidth=0.4)

for bar, val in zip(bars, feat_imp.values):
    ax.text(bar.get_width() + 0.002, bar.get_y() + bar.get_height()/2,
            f'{val:.2%}', va='center', color='white', fontsize=10)

ax.set_title('Feature Importance — What Drives Safety Prediction?',
             color='white', fontsize=13, pad=15)
ax.set_xlabel('Importance Score', color='#aaaaaa')
ax.tick_params(colors='white')
ax.spines[:].set_color('#333344')
ax.set_xlim(0, feat_imp.max() * 1.2)

# Readable feature labels
readable = {
    'temperature_2m_mean'    : 'Temperature (Mean)',
    'shortwave_radiation_sum': 'Solar Radiation',
    'precipitation_hours'    : 'Precipitation Hours',
    'windspeed_10m_max'      : 'Max Wind Speed',
    'city_code'              : 'City / Location'
}
ax.set_yticklabels([readable.get(f, f) for f in feat_imp.index], color='white')

plt.tight_layout()
plt.savefig('../models/charts/09_feature_importance.png', dpi=150, bbox_inches='tight')
plt.close()
print("   Chart saved: 09_feature_importance.png")

# ══════════════════════════════════════════════════════════════════════════════
# CHART 5 ── PREDICTION PROBABILITY DISTRIBUTION
# ══════════════════════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(9, 5))
fig.patch.set_facecolor('#0f1117')
ax.set_facecolor('#1a1d27')

safe_probs   = probabilities[y_test == 0]
unsafe_probs = probabilities[y_test == 1]

ax.hist(safe_probs,   bins=30, alpha=0.7, color='#2ecc71',
        label='Actual Safe Days',   edgecolor='white', linewidth=0.3)
ax.hist(unsafe_probs, bins=30, alpha=0.7, color='#e74c3c',
        label='Actual Unsafe Days', edgecolor='white', linewidth=0.3)

ax.axvline(0.5, color='#f0c040', linestyle='--', linewidth=2, label='Decision Threshold (0.5)')

ax.set_xlabel('Predicted Probability of Being Unsafe', color='#aaaaaa')
ax.set_ylabel('Number of Days', color='#aaaaaa')
ax.set_title('Prediction Confidence Distribution', color='white', fontsize=13, pad=15)
ax.tick_params(colors='white')
ax.spines[:].set_color('#333344')
ax.legend(facecolor='#1a1d27', labelcolor='white', fontsize=10)

plt.tight_layout()
plt.savefig('../models/charts/10_probability_distribution.png', dpi=150, bbox_inches='tight')
plt.close()
print("   Chart saved: 10_probability_distribution.png")

# ══════════════════════════════════════════════════════════════════════════════
# CHART 6 ── SUMMARY DASHBOARD
# ══════════════════════════════════════════════════════════════════════════════
fig = plt.figure(figsize=(14, 8))
fig.patch.set_facecolor('#0f1117')

gs = gridspec.GridSpec(2, 3, figure=fig, hspace=0.45, wspace=0.35)

# Panel A — Accuracy vs AUC
ax1 = fig.add_subplot(gs[0, 0])
ax1.set_facecolor('#1a1d27')
metrics = ['Accuracy', 'ROC-AUC', 'Avg Precision']
values  = [acc, roc_auc, avg_prec]
bars_s  = ax1.bar(metrics, values, color=['#3498db', '#2ecc71', '#9b59b6'],
                  edgecolor='white', linewidth=0.4)
for b, v in zip(bars_s, values):
    ax1.text(b.get_x() + b.get_width()/2, b.get_height() + 0.01,
             f'{v:.2%}', ha='center', color='white', fontsize=9, fontweight='bold')
ax1.set_ylim(0, 1.2)
ax1.set_title('Key Metrics', color='white', fontsize=11)
ax1.tick_params(colors='white', labelsize=8)
ax1.spines[:].set_color('#333344')

# Panel B — Confusion Matrix mini
ax2 = fig.add_subplot(gs[0, 1])
ax2.set_facecolor('#1a1d27')
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=['Safe', 'Unsafe'], yticklabels=['Safe', 'Unsafe'],
            linewidths=0.5, linecolor='#0f1117',
            annot_kws={'size': 12, 'color': 'white'}, ax=ax2)
ax2.set_title('Confusion Matrix', color='white', fontsize=11)
ax2.tick_params(colors='white', labelsize=8)

# Panel C — Feature Importance mini
ax3 = fig.add_subplot(gs[0, 2])
ax3.set_facecolor('#1a1d27')
fi_sorted = feat_imp.sort_values(ascending=True)
ax3.barh(fi_sorted.index, fi_sorted.values,
         color=plt.cm.viridis(np.linspace(0.2, 0.9, len(fi_sorted))),
         edgecolor='white', linewidth=0.3)
ax3.set_title('Feature Importance', color='white', fontsize=11)
ax3.tick_params(colors='white', labelsize=7)
ax3.spines[:].set_color('#333344')

# Panel D — ROC mini
ax4 = fig.add_subplot(gs[1, 0])
ax4.set_facecolor('#1a1d27')
ax4.plot(fpr, tpr, color='#3498db', linewidth=2)
ax4.fill_between(fpr, tpr, alpha=0.1, color='#3498db')
ax4.plot([0, 1], [0, 1], '--', color='#555566')
ax4.set_title(f'ROC  (AUC={roc_auc:.3f})', color='white', fontsize=11)
ax4.tick_params(colors='white', labelsize=8)
ax4.spines[:].set_color('#333344')

# Panel E — Probability Distribution mini
ax5 = fig.add_subplot(gs[1, 1:])
ax5.set_facecolor('#1a1d27')
ax5.hist(safe_probs,   bins=25, alpha=0.7, color='#2ecc71', label='Safe',   edgecolor='white', linewidth=0.2)
ax5.hist(unsafe_probs, bins=25, alpha=0.7, color='#e74c3c', label='Unsafe', edgecolor='white', linewidth=0.2)
ax5.axvline(0.5, color='#f0c040', linestyle='--', linewidth=1.5)
ax5.set_title('Prediction Confidence Distribution', color='white', fontsize=11)
ax5.tick_params(colors='white', labelsize=8)
ax5.spines[:].set_color('#333344')
ax5.legend(facecolor='#1a1d27', labelcolor='white', fontsize=9)

fig.suptitle('Smart Camping Safety AI — Final Model Dashboard',
             color='white', fontsize=15, fontweight='bold', y=0.98)

plt.savefig('../models/charts/00_SUMMARY_DASHBOARD.png', dpi=150, bbox_inches='tight')
plt.close()
print("   Chart saved: 00_SUMMARY_DASHBOARD.png  ← START HERE")

# ══════════════════════════════════════════════════════════════════════════════
# FINAL SUMMARY
# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("ALL FILES SAVED")
print("=" * 60)
print("  Models:")
print("     ../models/weather_scaler.pkl              ← REQUIRED for website")
print("     ../models/camping_safety_model_tuned.pkl  ← Final AI model")
print()
print("  Charts (../models/charts/):")
print("     00_SUMMARY_DASHBOARD.png    ← Best for presentation")
print("     06_confusion_matrix.png")
print("    07_roc_curve.png")
print("     08_precision_recall.png")
print("     09_feature_importance.png")
print("     10_probability_distribution.png")
print()
print("   Model is READY for backend integration!")
print()
print("  Backend usage example:")
print("    scaler = joblib.load('weather_scaler.pkl')")
print("    model  = joblib.load('camping_safety_model_tuned.pkl')")
print("    input_scaled = scaler.transform([temp, radiation, precip_hrs, wind])")
print("    prediction   = model.predict([input_scaled + [city_code]])")
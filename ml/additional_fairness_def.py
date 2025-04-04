import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, roc_curve, auc, f1_score
import numpy as np
import pandas as pd
from fairlearn.metrics import MetricFrame, selection_rate, false_positive_rate, false_negative_rate
import shap

def generate_additional_insights(model, X_test, y_test, y_pred, sensitive_test, feature_names):
    """Generate additional model insights and visualizations"""
    results = {}
    
    # 1. Overall Performance Metrics
    results['f1_score'] = float(f1_score(y_test, y_pred, average='weighted'))
    
    # 2. Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    results['confusion_matrix'] = cm.tolist()
    
    # 3. ROC and AUC (for binary classification)
    if len(np.unique(y_test)) == 2:
        try:
            # Get probability scores for positive class
            y_score = model.predict_proba(X_test)[:, 1]
            fpr, tpr, _ = roc_curve(y_test, y_score)
            roc_auc = auc(fpr, tpr)
            results['roc_auc'] = float(roc_auc)
            results['roc_curve'] = {
                'fpr': fpr.tolist(),
                'tpr': tpr.tolist()
            }
        except (AttributeError, IndexError):
            # Model doesn't support predict_proba
            results['roc_auc'] = "Not available"
    
    # 4. Per-group fairness metrics
    unique_groups = np.unique(sensitive_test)
    group_metrics = {}
    
    for group in unique_groups:
        group_mask = sensitive_test == group
        group_metrics[f'group_{group}'] = {
            'count': int(np.sum(group_mask)),
            'accuracy': float(np.mean(y_test[group_mask] == y_pred[group_mask])),
            'selection_rate': float(np.mean(y_pred[group_mask])),
        }
        if len(np.unique(y_test)) == 2:
            group_metrics[f'group_{group}']['false_positive_rate'] = float(
                false_positive_rate(y_test[group_mask], y_pred[group_mask])
            )
            group_metrics[f'group_{group}']['false_negative_rate'] = float(
                false_negative_rate(y_test[group_mask], y_pred[group_mask])
            )
    
    results['group_metrics'] = group_metrics
    
    # 5. Calculate disparity metrics
    if len(unique_groups) > 1:
        # Selection rate disparity (ratio of selection rates between groups)
        selection_rates = [group_metrics[f'group_{g}']['selection_rate'] for g in unique_groups]
        min_selection = min(selection_rates)
        max_selection = max(selection_rates)
        results['selection_rate_disparity'] = float(min_selection / max_selection if max_selection > 0 else 1.0)
        
        # Accuracy disparity
        accuracy_rates = [group_metrics[f'group_{g}']['accuracy'] for g in unique_groups]
        min_accuracy = min(accuracy_rates)
        max_accuracy = max(accuracy_rates)
        results['accuracy_disparity'] = float(min_accuracy / max_accuracy if max_accuracy > 0 else 1.0)
    
    # 6. Feature importance (if available)
    try:
        if hasattr(model, 'feature_importances_'):
            # For tree-based models
            feature_importance = model.feature_importances_
            feature_importance_dict = {
                feature_names[i]: float(importance) 
                for i, importance in enumerate(feature_importance)
                if i < len(feature_names)
            }
            results['feature_importance'] = feature_importance_dict
        elif hasattr(model, 'coef_'):
            # For linear models
            coefficients = model.coef_[0] if len(model.coef_.shape) > 1 else model.coef_
            coefficient_dict = {
                feature_names[i]: float(abs(coef)) 
                for i, coef in enumerate(coefficients)
                if i < len(feature_names)
            }
            results['feature_importance'] = coefficient_dict
    except:
        pass
    
    return results

def generate_visualizations(model, X_test, y_test, y_pred, sensitive_test, feature_names):
    """Generate visualizations for model insights"""
    visualizations = {}
    
    # 1. Confusion Matrix Heatmap
    plt.figure(figsize=(8, 6))
    cm = confusion_matrix(y_test, y_pred)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    visualizations['confusion_matrix'] = plt.gcf()
    plt.close()
    
    # 2. Feature Importance Plot (if available)
    try:
        if hasattr(model, 'feature_importances_'):
            # For tree-based models
            feature_importance = model.feature_importances_
            indices = np.argsort(feature_importance)[-10:]  # Top 10 features
            
            plt.figure(figsize=(10, 6))
            plt.barh(range(len(indices)), feature_importance[indices])
            plt.yticks(range(len(indices)), [feature_names[i] for i in indices])
            plt.xlabel('Feature Importance')
            plt.title('Top 10 Important Features')
            visualizations['feature_importance'] = plt.gcf()
            plt.close()
        elif hasattr(model, 'coef_'):
            # For linear models
            coefficients = model.coef_[0] if len(model.coef_.shape) > 1 else model.coef_
            indices = np.argsort(np.abs(coefficients))[-10:]  # Top 10 features
            
            plt.figure(figsize=(10, 6))
            plt.barh(range(len(indices)), coefficients[indices])
            plt.yticks(range(len(indices)), [feature_names[i] for i in indices])
            plt.xlabel('Coefficient Magnitude')
            plt.title('Top 10 Important Features')
            visualizations['feature_importance'] = plt.gcf()
            plt.close()
    except:
        pass
    
    # 3. ROC Curve (for binary classification)
    if len(np.unique(y_test)) == 2:
        try:
            # Get probability scores for positive class
            y_score = model.predict_proba(X_test)[:, 1]
            fpr, tpr, _ = roc_curve(y_test, y_score)
            roc_auc = auc(fpr, tpr)
            
            plt.figure(figsize=(8, 6))
            plt.plot(fpr, tpr, label=f'ROC curve (area = {roc_auc:.2f})')
            plt.plot([0, 1], [0, 1], 'k--')
            plt.xlim([0.0, 1.0])
            plt.ylim([0.0, 1.05])
            plt.xlabel('False Positive Rate')
            plt.ylabel('True Positive Rate')
            plt.title('Receiver Operating Characteristic (ROC)')
            plt.legend(loc="lower right")
            visualizations['roc_curve'] = plt.gcf()
            plt.close()
        except:
            pass
    
    # 4. Performance across sensitive groups
    unique_groups = np.unique(sensitive_test)
    group_accuracies = []
    group_labels = []
    
    for group in unique_groups:
        group_mask = sensitive_test == group
        accuracy = np.mean(y_test[group_mask] == y_pred[group_mask])
        group_accuracies.append(accuracy)
        group_labels.append(f'Group {group}')
    
    plt.figure(figsize=(10, 6))
    plt.bar(group_labels, group_accuracies)
    plt.ylim([0, 1])
    plt.ylabel('Accuracy')
    plt.title('Model Accuracy Across Sensitive Groups')
    visualizations['group_accuracy'] = plt.gcf()
    plt.close()
    
    # 5. SHAP values for model explanation (if model compatible)
    try:
        explainer = shap.Explainer(model, X_test)
        shap_values = explainer(X_test)
        
        plt.figure(figsize=(10, 8))
        shap.summary_plot(shap_values, X_test, feature_names=feature_names, show=False)
        plt.title('Feature Impact on Model Predictions (SHAP)')
        visualizations['shap_summary'] = plt.gcf()
        plt.close()
    except:
        pass
    
    return visualizations

def create_insights_dashboard(model, X, y, sensitive, X_test, y_test, y_pred, sensitive_test, feature_names):
    """Create a comprehensive insights dashboard for the model"""
    
    # Get basic metrics
    insights = generate_additional_insights(model, X_test, y_test, y_pred, sensitive_test, feature_names)
    
    # Get all the fairness metrics
    metrics = {
        'selection_rate': selection_rate,
        'false_positive_rate': false_positive_rate,
        'false_negative_rate': false_negative_rate,
    }
    
    # Create metric frame for all these metrics
    metric_frame = MetricFrame(
        metrics=metrics,
        y_true=y_test,
        y_pred=y_pred,
        sensitive_features=sensitive_test
    )
    
    # Get overall metrics
    overall_metrics = metric_frame.overall
    
    # Get by-group metrics
    by_group = metric_frame.by_group
    
    # Calculate disparity ratios (min/max ratio for each metric)
    disparity_metrics = {}
    for metric_name in metrics.keys():
        group_values = by_group[metric_name]
        min_val = group_values.min()
        max_val = group_values.max()
        # Avoid division by zero
        if max_val > 0:
            disparity = min_val / max_val
        else:
            disparity = 1.0
        disparity_metrics[f'{metric_name}_disparity'] = float(disparity)
    
    # Combine all metrics
    all_insights = {
        **insights,
        'overall_metrics': {k: float(v) for k, v in overall_metrics.items()},
        'by_group_metrics': by_group.to_dict(),
        'disparity_metrics': disparity_metrics
    }
    
    return all_insights


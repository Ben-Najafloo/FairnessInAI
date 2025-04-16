from sklearn.metrics import confusion_matrix, roc_curve, auc, f1_score, accuracy_score
import numpy as np
from fairlearn.metrics import MetricFrame, selection_rate, false_positive_rate, false_negative_rate

def generate_additional_insights(model, X_test, y_test, y_pred, sensitive_test, feature_names):
    results = {}
    
    # 1. Overall Performance Metrics
    results['f1_score'] = float(f1_score(y_test, y_pred, average='weighted'))
    
    # Calculate weighted accuracy
    # Get class weights based on inverse frequency
    classes, counts = np.unique(y_test, return_counts=True)
    class_weights = {cls: 1.0/count for cls, count in zip(classes, counts)}
    
    # Calculate weighted accuracy
    sample_weights = np.array([class_weights[y] for y in y_test])
    results['weighted_accuracy'] = float(accuracy_score(y_test, y_pred, sample_weight=sample_weights))
    
    # Also include regular accuracy for comparison
    results['accuracy'] = float(accuracy_score(y_test, y_pred))
    
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


def create_insights_dashboard(model, X, y, sensitive, X_test, y_test, y_pred, sensitive_test, feature_names):
    
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
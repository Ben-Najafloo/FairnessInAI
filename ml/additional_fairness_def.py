from sklearn.metrics import confusion_matrix, roc_curve, auc, f1_score, accuracy_score
import numpy as np
import pandas as pd
import logging
from fairlearn.metrics import MetricFrame, selection_rate, false_positive_rate, false_negative_rate

def generate_additional_insights(model, X_test, y_test, y_pred, sensitive_test, feature_names):

    results = {}

    try:
        logging.debug(f"Input types: X_test={type(X_test)}, y_test={type(y_test)}, y_pred={type(y_pred)}")
        logging.debug(f"sensitive_test type: {type(sensitive_test)}")

        if isinstance(sensitive_test, pd.DataFrame):
            logging.debug(f"sensitive_test columns: {sensitive_test.columns}")
            logging.debug(f"sensitive_test sample: {sensitive_test.iloc[0].to_dict()}")

        results['accuracy'] = float(accuracy_score(y_test, y_pred))
        results['f1_score'] = float(f1_score(y_test, y_pred))
        results['weighted_accuracy'] = accuracy_score(y_test, y_pred, sample_weight=None) 

        # ROC and AUC (for binary classification)
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

        if len(y_test) == 0 or len(y_pred) == 0:
            cm = [[0.0, 0.0], [0.0, 0.0]]
        else:
            cm = confusion_matrix(y_test, y_pred).tolist()
            # Normalize structure: ensure it's a list of lists with floats
            if not cm or not all(isinstance(row, list) for row in cm):
                cm = [[0.0, 0.0], [0.0, 0.0]]
        results['confusion_matrix'] = [[float(cell) for cell in row] for row in cm]

        # Handle sensitive_test safely
        if isinstance(sensitive_test, pd.DataFrame):
            for col in sensitive_test.columns:
                sensitive_test[col] = sensitive_test[col].astype(str)
            sensitive_values = sensitive_test.agg('_'.join, axis=1)
        elif isinstance(sensitive_test, pd.Series):
            sensitive_values = sensitive_test.astype(str)
        else:
            sensitive_values = np.array([str(x) for x in sensitive_test])

        # unique_groups = np.unique(sensitive_values)
        # logging.debug(f"Unique sensitive groups (first 5): {unique_groups[:5]}")

        # group_metrics = {}
        # for group in unique_groups:
        #     if isinstance(sensitive_values, pd.Series):
        #         mask = (sensitive_values == group).values
        #     else:
        #         mask = (sensitive_values == group)

        #     count = int(np.sum(mask))
        #     accuracy = float(accuracy_score(y_test[mask], y_pred[mask]) if count > 0 else 0)

        #     group_key = f"group_{str(group)}"
        #     group_metrics[group_key] = {
        #         'count': count,
        #         'accuracy': accuracy
        #     }

        # results['group_metrics'] = group_metrics

        unique_groups = np.unique(sensitive_values)
        logging.debug(f"Unique sensitive groups (first 5): {unique_groups[:5]}")

        group_metrics = {}
        for group in unique_groups:
            try:
                if isinstance(sensitive_values, pd.Series):
                    mask = (sensitive_values == group).values
                else:
                    mask = (sensitive_values == group)

                count = int(np.sum(mask))
                y_true_group = y_test[mask]
                y_pred_group = y_pred[mask]

                accuracy = float(accuracy_score(y_true_group, y_pred_group)) if count > 0 else 0.0

                # Defensive fallback for each Fairlearn metric
                try:
                    fpr = float(false_positive_rate(y_true_group, y_pred_group)) if count > 0 else 0.0
                except Exception:
                    fpr = 0.0
                try:
                    fnr = float(false_negative_rate(y_true_group, y_pred_group)) if count > 0 else 0.0
                except Exception:
                    fnr = 0.0
                try:
                    sr = float(selection_rate(y_pred_group)) if count > 0 else 0.0
                except Exception:
                    sr = 0.0

                group_key = f"group_{str(group)}"
                group_metrics[group_key] = {
                    'count': count,
                    'accuracy': accuracy,
                    'false_positive_rate': fpr,
                    'false_negative_rate': fnr,
                    'selection_rate': sr
                }
            except Exception as e:
                logging.warning(f"Failed to compute metrics for group {group}: {e}")

        results['group_metrics'] = group_metrics


        # Calculate selection rate per group
        selection_rate_metric = selection_rate(y_pred, sensitive_values)
        selection_rate_by_group = pd.Series(selection_rate_metric, index=np.unique(sensitive_values))

        # Accuracy per group already stored in group_metrics
        accuracy_rates = [group_metrics[f'group_{g}']['accuracy'] for g in unique_groups]

        # Calculate disparity metrics
        if len(unique_groups) > 1:
            # Selection rate disparity (min / max)
            selection_rates = [selection_rate_by_group[g] for g in unique_groups]
            min_selection = min(selection_rates)
            max_selection = max(selection_rates)
            results['selection_rate_disparity'] = float(min_selection / max_selection if max_selection > 0 else 1.0)
            
            # Accuracy disparity
            min_accuracy = min(accuracy_rates)
            max_accuracy = max(accuracy_rates)
            results['accuracy_disparity'] = float(min_accuracy / max_accuracy if max_accuracy > 0 else 1.0)


        # Feature importance
        try:
            if hasattr(model, 'feature_importances_'):
                feature_importance = model.feature_importances_
                results['feature_importance'] = {
                    feature_names[i]: float(importance)
                    for i, importance in enumerate(feature_importance)
                    if i < len(feature_names)
                }
            elif hasattr(model, 'coef_'):
                coefficients = model.coef_[0] if len(model.coef_.shape) > 1 else model.coef_
                results['feature_importance'] = {
                    feature_names[i]: float(abs(coef))
                    for i, coef in enumerate(coefficients)
                    if i < len(feature_names)
                }
        except Exception as e:
            logging.warning(f"Feature importance extraction failed: {e}")


    except Exception as e:
        logging.error(f"Error in generate_additional_insights: {e}", exc_info=True)
        results = {
            'error': str(e),
            'confusion_matrix': [[0.0, 0.0], [0.0, 0.0]],
            'group_metrics': {}
        }

    # Ensure key presence for frontend safety
    results.setdefault('confusion_matrix', [[0.0, 0.0], [0.0, 0.0]])
    results.setdefault('group_metrics', {})

    return results


# Final sanitization
def ensure_json_serializable(obj):
    if isinstance(obj, dict):
        return {str(k): ensure_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [ensure_json_serializable(item) for item in obj]
    elif isinstance(obj, (np.integer, np.int64, np.int32)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return ensure_json_serializable(obj.tolist())
    elif isinstance(obj, tuple):
        return str(obj)
    elif isinstance(obj, (str, int, float, bool)) or obj is None:
        return obj
    else:
        return str(obj)

    safe_results = ensure_json_serializable(results)
    return safe_results


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
        **(insights or {}),
        'overall_metrics': {k: float(v) for k, v in overall_metrics.items()},
        'by_group_metrics': by_group.to_dict(),
        'disparity_metrics': disparity_metrics
}

    
    return all_insights
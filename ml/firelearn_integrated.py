import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from tpot import TPOTClassifier, TPOTRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC  
from sklearn.naive_bayes import GaussianNB  
from sklearn.metrics import accuracy_score, precision_score, recall_score, mean_absolute_error, mean_squared_error, r2_score, confusion_matrix, roc_curve, auc, f1_score
from fairlearn.metrics import MetricFrame, demographic_parity_difference, equalized_odds_difference, selection_rate, false_positive_rate, false_negative_rate
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_selection import VarianceThreshold
import logging
from datetime import datetime

from ml.additional_fairness_def import generate_additional_insights,  create_insights_dashboard

import io
import base64
import shap

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)



def train_model_with_fairness(X, y, sensitive, algorithm, fairness_metric, performance_metric, test_size,
                                tpot_generations, tpot_population_size, problem_type='classification'):
    # Initialize sensitive_label_mapping at the beginning of the function
    sensitive_label_mapping = {}
    non_numeric_columns = []
    
    logger.info("Starting Training...")

    # Ensure all data is numeric
    non_numeric_columns = X.select_dtypes(include=['object']).columns
    if len(non_numeric_columns) > 0:
        # logger.debug(f"Non-numeric columns in X: {list(non_numeric_columns)}")
        for column in non_numeric_columns:
            X[column] = LabelEncoder().fit_transform(X[column])

    # Convert target variable (y) to numeric
    if y.dtype == 'object':
        logger.debug("Converting target variable to numeric")
        y = LabelEncoder().fit_transform(y)

    # Convert sensitive attribute to numeric and save mapping
    if hasattr(sensitive, 'dtypes') and sensitive.dtypes == 'object':
        logger.debug("Converting sensitive attribute to numeric")
        le = LabelEncoder()
        sensitive = le.fit_transform(sensitive)
        sensitive_label_mapping = dict(zip(le.classes_, le.transform(le.classes_)))
        # logger.debug(f"Sensitive attribute mapping: {sensitive_label_mapping}")
    elif isinstance(sensitive, pd.Series) and sensitive.dtype == 'object':
        logger.debug("Converting pandas Series sensitive attribute to numeric")
        le = LabelEncoder()
        sensitive = le.fit_transform(sensitive)
        sensitive_label_mapping = dict(zip(le.classes_, le.transform(le.classes_)))
        # logger.debug(f"Sensitive attribute mapping: {sensitive_label_mapping}")
    else:
        # For numeric sensitive attributes, create a basic mapping
        unique_values = np.unique(sensitive)
        sensitive_label_mapping = {str(val): int(i) for i, val in enumerate(unique_values)}
        # logger.debug(f"Created mapping for numeric sensitive attribute: {sensitive_label_mapping}")

    

    # Validate data
    assert all(X.dtypes != 'object'), "Features contain non-numeric data"
    assert y.dtype != 'object', "Target variable contains non-numeric data"
    assert np.array(sensitive).dtype != 'object', "Sensitive attribute contains non-numeric data"

    # Check if we have a binary or multiclass problem
    n_classes = len(np.unique(y))
    is_binary = n_classes == 2

    if is_binary:
        logger.info("Detected binary classification task")
        average_method = 'binary'
    else:
        logger.info(f"Detected multiclass classification task with {n_classes} classes")
        average_method = 'weighted'  # Use weighted for multiclass problems

    # Save original feature names for feature importance analysis
    feature_names = list(X.columns)

    # Split the dataset
    X_train, X_test, y_train, y_test, sensitive_train, sensitive_test = train_test_split(
        X, y, sensitive, test_size=test_size, random_state=42
    )

    # Log dataset shapes
    logger.debug(f"X_train shape: {X_train.shape}, y_train shape: {y_train.shape}")
    logger.debug(f"X_test shape: {X_test.shape}, y_test shape: {y_test.shape}")
    logger.debug(f"sensitive_train shape: {sensitive_train.shape}, sensitive_test shape: {sensitive_test.shape}")

    # Select model based on algorithm choice
    if algorithm == 'TPOT':
        # Choose the appropriate TPOT model based on problem type
        if problem_type.lower() == 'regression':
            logger.info("Using TPOT for regression task")
            tpot_model = TPOTRegressor(
                generations=tpot_generations,
                population_size=tpot_population_size,
                random_state=42,
                warm_start=True
            )
        else:  # Classification
            logger.info("Using TPOT for classification task")
            tpot_model = TPOTClassifier(
                generations=tpot_generations,
                population_size=tpot_population_size,
                random_state=42,
                warm_start=True
            )

        # Apply VarianceThreshold to remove constant features
        selector = VarianceThreshold(threshold=0.01)  # Removes features with near-zero variance
        X_train = selector.fit_transform(X_train)
        X_test = selector.transform(X_test)

        # Keep track of selected features after variance thresholding
        selected_features = [feature_names[i] for i, selected in enumerate(selector.get_support()) if selected]
        logger.debug(f"Features after variance thresholding: {selected_features}")

        # Fit TPOT to training data
        logger.info("Starting TPOT training. This may take a while...")
        tpot_model.fit(X_train, y_train)

        # Get the best model pipeline found by TPOT
        model = tpot_model.fitted_pipeline_

        # Try to export pipeline
        try:
            pipeline_filename = f"tpot_{problem_type.lower()}_pipeline.py"
            if hasattr(tpot_model, 'export'):
                tpot_model.export(pipeline_filename)
                logger.info(f"Exported best pipeline to {pipeline_filename}")
            else:
                with open(pipeline_filename, 'w') as f:
                    f.write(f"# TPOT optimized pipeline\n")
                    f.write(f"# Generated {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                    f.write("import numpy as np\nimport pandas as pd\n")
                    f.write("from sklearn.pipeline import Pipeline\n\n")
                    f.write(f"# Pipeline: {str(model)}\n\n")
                    f.write("def tpot_pipeline():\n")
                    f.write(f"    return {str(model)}\n")
                logger.info(f"Exported pipeline description to {pipeline_filename}")
        except Exception as e:
            logger.warning(f"Could not export pipeline: {e}")
    elif algorithm == 'Logistic Regression':
        model = LogisticRegression()
        model.fit(X_train, y_train)
    elif algorithm == 'Random Forest Classification':
        model = RandomForestClassifier()
        model.fit(X_train, y_train)
    elif algorithm == 'Support Vector Machine':  # New algorithm
        model = SVC(probability=True)  # probability=True enables predict_proba
        model.fit(X_train, y_train)
    elif algorithm == 'Naive Bayes':  # New algorithm
        model = GaussianNB()
        model.fit(X_train, y_train)
    else:
        raise ValueError(f"Algorithm {algorithm} is not supported using the provided changes. TPOT is the only supported algorithm")

    # Make predictions
    y_pred = model.predict(X_test)

    # Fairness Assessment using Fairlearn
    if problem_type.lower() != 'regression':
        # Define fairness metric functions that are compatible with MetricFrame
        fairness_metrics = {
            'accuracy': accuracy_score,
        }
        
        # Add fairness metrics directly to the dictionary without custom wrappers
        if fairness_metric.lower().replace(" ", "_") == 'demographic_parity_difference':
            fairness_metrics['demographic_parity_difference'] = lambda y_true, y_pred: demographic_parity_difference(
                y_true=y_true, 
                y_pred=y_pred, 
                sensitive_features=sensitive_test
            )
        if fairness_metric.lower().replace(" ", "_") == 'equalized_odds_difference':
            fairness_metrics['equalized_odds_difference'] = lambda y_true, y_pred: equalized_odds_difference(
                y_true=y_true, 
                y_pred=y_pred, 
                sensitive_features=sensitive_test
            )

        min_length = min(len(y_test), len(y_pred), len(sensitive_test))
        y_test_fair = y_test[:min_length]
        y_pred_fair = y_pred[:min_length]
        sensitive_test_fair = sensitive_test[:min_length]
            
        # Create the MetricFrame with properly sized arrays
        metric_frame = MetricFrame(
            metrics={
                'accuracy': accuracy_score,
                # Other metrics can be added here
            },
            y_true=y_test_fair,
            y_pred=y_pred_fair,
            sensitive_features=sensitive_test_fair
        )

        fairness_metric_key = fairness_metric.replace(" ", "_").lower()
        # Calculate fairness metrics separately
        if fairness_metric.lower().replace(" ", "_") == 'demographic_parity_difference':
            fairness_score = demographic_parity_difference(
                y_true=y_test_fair, 
                y_pred=y_pred_fair, 
                sensitive_features=sensitive_test_fair
            )
        elif fairness_metric.lower().replace(" ", "_") == 'equalized_odds_difference':
            fairness_score = equalized_odds_difference(
                y_true=y_test_fair, 
                y_pred=y_pred_fair, 
                sensitive_features=sensitive_test_fair
            )
        else:
            fairness_score = 0.0
            logger.warning(f"Unknown fairness metric: {fairness_metric}")
                
        fairness_reason = f"Fairness score ({fairness_metric}): {fairness_score:.4f}"

        # Analyze fairness - when fairness score is 0 or close to 0
        if abs(fairness_score) < 0.01:
            # Check predictions by sensitive group
            sensitive_values = np.unique(sensitive_test)
            prediction_rates = {}
            for val in sensitive_values:
                group_mask = sensitive_test == val
                # For each sensitive group, calculate average prediction
                group_pred_rate = np.mean(y_pred[group_mask])
                prediction_rates[f"group_{val}"] = float(group_pred_rate)
                
            logger.info(f"Perfect fairness achieved. Prediction rates by group: {prediction_rates}")
            
            # Attempt to identify feature importance for fairness
            try:
                if hasattr(model, 'feature_importances_'):
                    # For tree-based models
                    feature_importances = model.feature_importances_
                    feature_importance_dict = {selected_features[i]: float(importance) 
                                             for i, importance in enumerate(feature_importances)
                                             if i < len(selected_features)}
                    top_features = sorted(feature_importance_dict.items(), key=lambda x: x[1], reverse=True)[:3]
                    top_features_str = ", ".join([f"{name}: {round(imp, 4)}" for name, imp in top_features])
                    logger.info(f"Feature importances that contribute to fair predictions: {feature_importance_dict}")
                    fairness_reason = f"Perfect fairness (score={fairness_score:.4f}). Key features: {top_features_str}"
                elif hasattr(model, 'coef_'):
                    # For linear models
                    coefficients = model.coef_[0] if len(model.coef_.shape) > 1 else model.coef_
                    coef_dict = {selected_features[i]: float(abs(coef)) 
                               for i, coef in enumerate(coefficients)
                               if i < len(selected_features)}
                    top_features = sorted(coef_dict.items(), key=lambda x: x[1], reverse=True)[:3]
                    top_features_str = ", ".join([f"{name}: {round(imp, 4)}" for name, imp in top_features])
                    logger.info(f"Feature coefficients that contribute to fair predictions: {coef_dict}")
                    fairness_reason = f"Perfect fairness (score={fairness_score:.4f}). Key features: {top_features_str}"
                else:
                    # For other models
                    fairness_reason = f"Perfect fairness (score={fairness_score:.4f}). Model type doesn't support direct feature importance analysis."
            except Exception as e:
                logger.warning(f"Could not analyze feature importance: {e}")
                fairness_reason = f"Perfect fairness achieved (score={fairness_score:.4f}), but couldn't analyze feature importance."
    else:
        fairness_score = 0.0
        fairness_reason = "Regression task - fairness metrics not applicable"

    # Evaluate performance (for classification)
    additional_metrics = {}
    if problem_type.lower() == 'regression':
        additional_metrics = {
            'mae': float(mean_absolute_error(y_test, y_pred)),
            'mse': float(mean_squared_error(y_test, y_pred)),
            'rmse': float(np.sqrt(mean_squared_error(y_test, y_pred))),
            'r2': float(r2_score(y_test, y_pred))
        }
        performance_score = r2_score(y_test, y_pred)
    else:
        try:
            if performance_metric == 'Accuracy':
                performance_score = accuracy_score(y_test, y_pred)
            elif performance_metric == 'Precision':
                performance_score = precision_score(y_test, y_pred, average=average_method)
            elif performance_metric == 'Recall':
                performance_score = recall_score(y_test, y_pred, average=average_method)
            else:
                raise ValueError(f"Unsupported performance metric: {performance_metric}")

            additional_metrics.update({
                'accuracy': float(accuracy_score(y_test, y_pred)),
                'precision': float(precision_score(y_test, y_pred, average=average_method)),
                'recall': float(recall_score(y_test, y_pred, average=average_method))
            })
        except Exception as e:
            logger.error(f"Error calculating classification metrics: {e}")
            performance_score = accuracy_score(y_test, y_pred)
            additional_metrics.update({
                'accuracy': float(performance_score),
                'error': str(e)
            })

    # Log scores
    logger.debug(f"Fairness Score ({fairness_metric}): {fairness_score}")
    logger.debug(f"Fairness Analysis: {fairness_reason}")
    logger.debug(f"Performance Score ({performance_metric}): {performance_score}")

    
    

    # Convert NumPy and Pandas types to Python native types
    sensitive_test_native = [int(val) for val in sensitive_test]
    sensitive_label_mapping_native = {str(k): int(v) for k, v in sensitive_label_mapping.items()} if isinstance(sensitive_label_mapping, dict) else {}
    fairness_score_native = float(fairness_score)
    performance_score_native = float(performance_score)

    # For TPOT, include the best pipeline code
    pipeline_info = {
        'tpot_best_pipeline': str(model),
        'pipeline_file': pipeline_filename if 'pipeline_filename' in locals() else None
    }


    feature_names = list(X.columns)
    
    # Generate additional insights
    additional_insights = generate_additional_insights(model, X_test, y_test, y_pred, sensitive_test, feature_names)
    
    # Create comprehensive dashboard
    dashboard_data = create_insights_dashboard(model, X, y, sensitive, X_test, y_test, y_pred, sensitive_test, feature_names)

    logger.debug(f"additional insights: {additional_insights}")
    logger.debug(f"dashboard data: {dashboard_data}")
    
    # Your existing code to create results...
    results = {
        'fairness_score': fairness_score_native,
        'performance_score': performance_score_native,
        'fairness_metric': fairness_metric,
        'performance_metric': performance_metric,
        'fairness_reason': fairness_reason,
        'non_numeric_columns': list(non_numeric_columns),
        'sensitive_label_mapping': sensitive_label_mapping_native,
        'sensitive_test': sensitive_test_native,
        'algorithm': algorithm,
        'problem_type': problem_type,
        'is_multiclass': not is_binary,
        'num_classes': int(n_classes),
        **additional_metrics,
        'pipeline_info': pipeline_info,
        # Add insights to results
        'additional_insights': additional_insights,
        'fairness_dashboard': dashboard_data,
        
    }
    
    return model, results


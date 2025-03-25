import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
import logging
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from fairlearn.metrics import demographic_parity_difference, equalized_odds_difference
from sklearn.metrics import accuracy_score, precision_score, recall_score
from sklearn.preprocessing import LabelEncoder
from datetime import datetime
from tpot import TPOTRegressor, TPOTClassifier
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.feature_selection import VarianceThreshold

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

non_numeric_columns = {}
sensitive_label_mapping = {}

def preprocess_data(data, label_column, sensitive_column):
    global non_numeric_columns
    
    try:
        logger.info("Starting data preprocessing...")

        # Separate the features (X), label (y), and sensitive attribute (sensitive)
        X = data.drop([label_column, sensitive_column], axis=1)
        y = data[label_column]
        sensitive = data[sensitive_column]

        # Handle missing data for numeric columns in X
        numeric_columns = X.select_dtypes(include=['number']).columns
        if len(numeric_columns) > 0:
            X[numeric_columns] = X[numeric_columns].fillna(X[numeric_columns].mean())
            logging.debug(f"Filled missing values in numeric columns: {numeric_columns}")

        # Handle missing data for non-numeric columns in X
        non_numeric_columns = X.select_dtypes(exclude=['number']).columns
        if len(non_numeric_columns) > 0:
            X[non_numeric_columns] = X[non_numeric_columns].fillna(X[non_numeric_columns].mode().iloc[0])
            logging.debug(f"Filled missing values in non-numeric columns: {non_numeric_columns}")
            
            # Perform one-hot encoding for non-numeric columns
            X = pd.get_dummies(X, columns=non_numeric_columns, drop_first=True)
            logger.debug(
                f"One-hot encoded columns: {non_numeric_columns}"
            )

        logger.info("Preprocessing completed successfully.")
        logger.debug(
            f"Feature data shape: {X.shape}, Label data shape: {y.shape}")

        return X, y, sensitive

    except Exception as e:
        logger.error(f"Error during preprocessing: {e}")
        raise

def train_model_with_fairness(X, y, sensitive, algorithm, fairness_metric, performance_metric, test_size, 
                             tpot_generations, tpot_population_size, problem_type='classification'):
    global sensitive_label_mapping
    logger.info("Starting Training...")
    global non_numeric_columns

    # Ensure all data is numeric
    non_numeric_columns = X.select_dtypes(include=['object']).columns
    if len(non_numeric_columns) > 0:
        logger.debug(f"Non-numeric columns in X: {list(non_numeric_columns)}")
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
        logger.debug(f"Sensitive attribute mapping: {sensitive_label_mapping}")

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
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)
    sensitive_train, sensitive_test = train_test_split(sensitive, test_size=test_size, random_state=42)
    
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
            # Updated: Modern TPOT doesn't use config_dict parameter
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
        
        # Try to export pipeline using the newer approach
        try:
            pipeline_filename = f"tpot_{problem_type.lower()}_pipeline.py"
            # Check if export method exists
            if hasattr(tpot_model, 'export'):
                tpot_model.export(pipeline_filename)
                logger.info(f"Exported best pipeline to {pipeline_filename}")
            else:
                # Alternative export approach for newer TPOT versions
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
    else:
        raise ValueError(f"Unsupported algorithm: {algorithm}")

    # Make predictions
    y_pred = model.predict(X_test)
    
    # Calculate additional metrics based on problem type
    additional_metrics = {}
    if problem_type.lower() == 'regression':
        additional_metrics = {
            'mae': float(mean_absolute_error(y_test, y_pred)),
            'mse': float(mean_squared_error(y_test, y_pred)),
            'rmse': float(np.sqrt(mean_squared_error(y_test, y_pred))),
            'r2': float(r2_score(y_test, y_pred))
        }
        # For regression problems, set default fairness score (since fairness metrics are for classification)
        fairness_score = 0.0
        fairness_reason = "Regression task - fairness metrics not applicable"
    else:
        # Evaluate fairness metric (for classification problems)
        if fairness_metric == 'Demographic Parity':
            fairness_score = demographic_parity_difference(
                y_test, y_pred, sensitive_features=sensitive_test
            )
        elif fairness_metric == 'Equalized Odds':
            fairness_score = equalized_odds_difference(
                y_test, y_pred, sensitive_features=sensitive_test
            )
        else:
            raise ValueError(f"Unsupported fairness metric: {fairness_metric}")
            
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
            fairness_reason = f"Fairness score is {fairness_score:.4f}, which indicates some bias."

    # Evaluate performance (for classification)
    if problem_type.lower() != 'regression':
        try:
            # Calculate primary performance metric
            if performance_metric == 'Accuracy':
                performance_score = accuracy_score(y_test, y_pred)
            elif performance_metric == 'Precision':
                performance_score = precision_score(y_test, y_pred, average=average_method)
            elif performance_metric == 'Recall':
                performance_score = recall_score(y_test, y_pred, average=average_method)
            else:
                raise ValueError(f"Unsupported performance metric: {performance_metric}")
                
            # Calculate additional metrics with appropriate averaging method
            recall = recall_score(y_test, y_pred, average=average_method)
            precision = precision_score(y_test, y_pred, average=average_method)
            accuracy = accuracy_score(y_test, y_pred)
            # f1 = f1_score(y_test, y_pred, average=average_method)
            
            # Add additional classification metrics
            additional_metrics.update({
                'accuracy': float(accuracy),
                'precision': float(precision),
                'recall': float(recall),
                # 'f1_score': float(f1)
            })
            
            # Generate confusion matrix - only simple version for multiclass
            # if is_binary:
            #     cm = confusion_matrix(y_test, y_pred)
            #     cm_dict = {
            #         'true_negative': int(cm[0][0]),
            #         'false_positive': int(cm[0][1]),
            #         'false_negative': int(cm[1][0]),
            #         'true_positive': int(cm[1][1])
            #     }
            # else:
            #     # For multiclass, just provide the raw confusion matrix
            #     cm = confusion_matrix(y_test, y_pred).tolist()
            #     cm_dict = {"matrix": cm}
                
            # additional_metrics['confusion_matrix'] = cm_dict
            
        except Exception as e:
            logger.error(f"Error calculating classification metrics: {e}")
            # Fallback to accuracy if other metrics fail
            performance_score = accuracy_score(y_test, y_pred)
            additional_metrics.update({
                'accuracy': float(performance_score),
                'error': str(e)
            })
    else:
        # For regression, use R2 as the default performance metric
        performance_score = r2_score(y_test, y_pred)

    # Log scores
    if problem_type.lower() != 'regression':
        logger.debug(f"Fairness Score ({fairness_metric}): {fairness_score}")
        logger.debug(f"Fairness Analysis: {fairness_reason if 'fairness_reason' in locals() else 'Not analyzed'}")
        logger.debug(f"Recall Score: {recall if 'recall' in locals() else 'Not calculated'}")
    logger.debug(f"Performance Score ({performance_metric}): {performance_score}")

    # Convert NumPy and Pandas types to Python native types
    sensitive_test_native = [int(val) for val in sensitive_test]  # Convert sensitive_test to Python native integers
    
    # Handle sensitive_label_mapping conversion
    if isinstance(sensitive_label_mapping, dict):
        sensitive_label_mapping_native = {str(k): int(v) for k, v in sensitive_label_mapping.items()}
    else:
        sensitive_label_mapping_native = {}
    
    # Convert scores to native Python types
    fairness_score_native = float(fairness_score) if 'fairness_score' in locals() else 0.0
    performance_score_native = float(performance_score)

    # For TPOT, include the best pipeline code
    pipeline_info = {}
    if algorithm == 'TPOT':
        pipeline_info = {
            'tpot_best_pipeline': str(model),
            'pipeline_file': pipeline_filename if 'pipeline_filename' in locals() else None
        }
    
    # Respond with JSON-serializable data
    results = {
        'fairness_score': fairness_score_native,
        'performance_score': performance_score_native,
        'fairness_metric': fairness_metric,
        'performance_metric': performance_metric,
        'fairness_reason': fairness_reason if 'fairness_reason' in locals() else None,
        'non_numeric_columns': list(non_numeric_columns),  
        'sensitive_label_mapping': sensitive_label_mapping_native,  
        'sensitive_test': sensitive_test_native,  
        'algorithm': algorithm,
        'problem_type': problem_type,
        'is_multiclass': not is_binary,
        'num_classes': int(n_classes),
        **additional_metrics,  # Add the additional metrics
        'pipeline_info': pipeline_info
    }
    
    return model, results
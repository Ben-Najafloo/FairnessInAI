from flask import Flask, request, jsonify
import math
import pandas as pd
import numpy as np
from scipy.stats import zscore
import logging
from flask_cors import CORS
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder

# balancing
from sklearn.utils import resample 

# from ml.ml_functions import preprocess_data, train_model_with_fairness
# from ml.tpot_ml import train_model_with_fairness
from ml.firelearn_integrated import train_model_with_fairness
from ml.preprocess import preprocess_data


# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()],
    force=True  
)
logging.getLogger('werkzeug').setLevel(logging.ERROR)  
logging.info("App is starting...")

app = Flask(__name__)
CORS(app)

uploaded_data = {}

@app.route('/upload', methods=['POST'])
def upload_file():
    global uploaded_data
    
    logging.info("Upload endpoint reached.")

    if 'file' not in request.files:
        logging.warning("No file part in the request.")
        return jsonify({'error': 'No file part'})

    file = request.files['file']
    if file.filename == '':
        logging.warning("No file selected.")
        return jsonify({'error': 'No selected file'})

    logging.info(f"Processing file: {file.filename}")

    try:
        try:
            data = pd.read_csv(file)  # default
        except Exception:
            file.seek(0)
            try:
                data = pd.read_csv(file, sep=';', encoding='utf-8')
            except Exception:
                file.seek(0)
                data = pd.read_csv(file, sep='\t', encoding='ISO-8859-1')

        # Clean column names
        data.columns = data.columns.str.strip().str.replace('\n', '', regex=False)

        if data.empty:
            return jsonify({'error': 'Uploaded file is empty or unreadable.'}), 400

        # Check for all-null columns or rows and drop them
        data = data.dropna(axis=1, how='all').dropna(axis=0, how='all')

        # Drop fully unique ID column (likely index)
        dropped_column = None
        for col in data.columns:
            if data[col].nunique(dropna=False) == len(data):
                dropped_column = col
                data = data.drop(columns=[col])
                logging.info(f"Dropped ID column: {col}")
                break  
        
        # Get label and sensitive columns
        label_column = request.form.get('label_column')
        sensitive_column = request.form.get('sensitive_column')
        sensitive_column2 = request.form.get('sensitive_column2')
        problem_type = request.form.get('problem_type')

        if sensitive_column2 and sensitive_column2 in data.columns:
            sensitive = list(zip(data[sensitive_column], data[sensitive_column2]))
        else:
            sensitive = data[sensitive_column]
        

        if label_column not in data.columns or sensitive_column not in data.columns:
            logging.warning(f"Label column '{label_column}' or sensitive column '{sensitive_column}' not found.")
            return jsonify({'error': f"Columns '{label_column}' or '{sensitive_column}' not found in dataset"}), 400

         # Determine label column type (categorical or continuous)
        if data[label_column].dtype in ['int64', 'float64'] and data[label_column].nunique() > 10:
            label_type = 'Continuous'
        else:
            label_type = 'Categorical'
        logging.info(f"Label column '{label_column}' is detected as {label_type}.")
        
        # Preprocess data
        X, y, _ = preprocess_data(data, label_column, sensitive_column)

        # Construct intersectional sensitive feature after
        if sensitive_column2 and sensitive_column2 in data.columns:
            sensitive = list(zip(data[sensitive_column], data[sensitive_column2]))
        else:
            sensitive = data[sensitive_column]

        logging.info("Preprocessing completed successfully.")
        # logging.debug(f"Feature data (X) shape: {X.shape}")

        # Calculate missing data percentages
        missing_data = get_missing_data(data)
        # logging.info(f"Missing data before handling: {missing_data}")

        # Generate Dataset Analysis
        dataset_summary = {
            'shape': list(data.shape),
            'columns': list(data.columns),
            'missing_data': get_missing_data(data),
            'data_types': get_data_types(data),
            'statistics': get_statistics(data),
            'outliers': detect_outliers(data),
            'class_distribution': get_class_distribution(data, label_column),
            'sensitive_column_distribution': get_sensitive_column_distribution(data, sensitive_column)
        }
        # logging.error(f"Missing data before handling: {get_missing_data(data)}")
        

        response = {
            'message': 'Dataset processed successfully.',
            'dataset_summary': dataset_summary,
            'label_column': label_column,
            'label_type': label_type,
            'file_name': file.filename,
            'sensitive_column': sensitive_column,
            'sensitive_column2': sensitive_column2,
            'problem_type': problem_type,
            'data_shape': list(data.shape),  # Convert tuple to list
            'features_shape': list(X.shape),  # Convert tuple to list
            'dropped_column': dropped_column
        }

        # Store data and metadata in a global variable
        uploaded_data['data'] = data
        uploaded_data['label_column'] = label_column
        uploaded_data['sensitive_column'] = sensitive_column
        uploaded_data['sensitive_column2'] = sensitive_column2
        uploaded_data['problem_type'] = problem_type
        logging.info("Data and metadata stored in global variable.")

        return jsonify(response)
    
    except Exception as e:
        logging.error(f"Error during file upload: {e}")
        return jsonify({'error': str(e)}), 500


# Utility Functions
def get_missing_data(df):
    """Returns percentage of missing values per column."""
    missing_data = df.isnull().mean().round(4).to_dict()
    # logging.debug(f"Missing data: {missing_data}")
    return missing_data

logging.info("get missing data.")

def get_data_types(df):
    """Returns the data types of each column."""
    data_types = {col: str(dtype) for col, dtype in df.dtypes.items()}
    # logging.debug(f"Data types: {data_types}")
    return data_types

logging.info("get data type.")

def get_statistics(df):
    """Returns basic statistics for numerical columns."""
    stats = df.describe().round(2).to_dict()
    return stats

logging.info("get statistics.")

def detect_outliers(df):
    """Detects outliers using the Z-score method."""
    numeric_cols = df.select_dtypes(include=[np.number])
    outlier_summary = {}
    for col in numeric_cols.columns:
        z_scores = np.abs(zscore(numeric_cols[col].dropna()))
        outliers = z_scores > 3  # Z-score threshold for outliers 
        outlier_summary[col] = int(outliers.sum())
    # logging.debug(f"Outliers detected: {outlier_summary}")
    return outlier_summary

logging.info("Detects outliers using the Z-score method.")

def get_class_distribution(df, label_column):
    """Returns the distribution of classes in the label column."""
    if label_column in df.columns:
        class_dist = df[label_column].value_counts(normalize=True).round(4).to_dict()
        # logging.debug(f"Class distribution: {class_dist}")
        return class_dist
    return None

logging.info("Returns the distribution of classes in the label column.")

def get_sensitive_column_distribution(df, sensitive_column):
    """Returns the distribution of the sensitive column."""
    if sensitive_column in df.columns:
        sensitive_dist = df[sensitive_column].value_counts(normalize=True).round(4).to_dict()
        # logging.debug(f"Sensitive column distribution: {sensitive_dist}")
        return sensitive_dist
    return None

logging.info("Returns the distribution of the sensitive column.")

# Missing Data Handling Function
def handle_missing_data(df, strategy="mean"):
    imputer = SimpleImputer(strategy=strategy)
    df_numeric = df.select_dtypes(include=['number'])
    df[df_numeric.columns] = imputer.fit_transform(df_numeric)

    for col in df.select_dtypes(include=['object', 'category']).columns:
        if df[col].isnull().any():
            df[col].fillna(df[col].mode()[0], inplace=True)

    return df

logging.info("Missing Data Handling Function.")

# balancing 
def balance_classes(df, label_column):
    
    classes = df[label_column].unique()
    max_count = df[label_column].value_counts().max()

    balanced_df = pd.DataFrame()
    for cls in classes:
        cls_samples = df[df[label_column] == cls]
        balanced_cls = resample(cls_samples,
                                replace=True,         # sample with replacement
                                n_samples=max_count,  # match max class count
                                random_state=42)
        balanced_df = pd.concat([balanced_df, balanced_cls])

    return balanced_df.sample(frac=1, random_state=42).reset_index(drop=True)  # shuffle

logging.info("Balancing.")

@app.route('/train', methods=['POST'])
def train_model():
    global uploaded_data
    try:
        # Ensure data is available
        if not uploaded_data:
            raise ValueError("No data found. Please upload a dataset first.")

        # Retrieve data and columns from global storage
        data = uploaded_data['data'].copy()  # Work on a copy to avoid modifying the original data 
        label_column = uploaded_data['label_column']
        sensitive_column = uploaded_data['sensitive_column']
        sensitive_column2 = uploaded_data.get('sensitive_column2', None)
        problem_type = uploaded_data.get('problem_type', None)  

        if problem_type is None:
            raise ValueError("Problem type is not defined. Please specify the problem type during upload.")

        # Extract user configurations
        config = request.json
        algorithm = config.get('selectedAlgorithms', ['Linear Regression'])[0]
        fairness_metric = config.get('selectedFairnessMetrics', ['Demographic Parity Difference'])[0]
        performance_metric = config.get('performanceMetric', 'Accuracy')
        test_size = config.get('splitRatio', 20) / 100
        do_balance_data = config.get('doBalanceData', False)
        strategy = config.get('strategy', 'mean')
        
        # TPOT configuration
        tpot_generations = config.get('tpotGenerations', 10)
        tpot_population_size = config.get('tpotPopulationSize', 30)

        # Handle missing data if requested
        # logging.info(f"Handling missing data with strategy: {strategy}")
        data = handle_missing_data(data, strategy=strategy)
        # Log missing data after handling
        missing_data_after_handling = get_missing_data(data)
        # logging.info(f"Missing data after handling: {missing_data_after_handling}")

        # Log class distribution before balancing
        class_distribution_before_balancing = get_class_distribution(data, label_column)
        # logging.info(f"Class distribution before balancing: {class_distribution_before_balancing}")

        # balancing
        if (do_balance_data):
            balanced = balance_classes(data, label_column)
            class_distribution_after_balancing = get_class_distribution(balanced, label_column)
            # logging.info(f"Class distribution after balancing: {class_distribution_after_balancing}")
            

        # Preprocess data for training
        logging.info("Preprocessing data for training")
        # Preprocess
        X, y, _ = preprocess_data(data, label_column, sensitive_column)

        # Reconstruct sensitive feature
        if sensitive_column2 and sensitive_column2 in data.columns:
            sensitive = list(zip(data[sensitive_column], data[sensitive_column2]))
        else:
            sensitive = data[sensitive_column]


        # Train the model.....................................................................................................
        logging.info(f"Starting model training with {algorithm} for {problem_type} problem")
        model, evaluation_results = train_model_with_fairness(
            X, y, sensitive, 
            algorithm=algorithm,
            fairness_metric=fairness_metric, 
            performance_metric=performance_metric,
            test_size=test_size,
            tpot_generations=tpot_generations,
            tpot_population_size=tpot_population_size,
            problem_type=problem_type
        )

        def sanitize_for_json(obj):
            if isinstance(obj, dict):
                return {k: sanitize_for_json(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [sanitize_for_json(v) for v in obj]
            elif isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
                return None
            return obj

        # Respond with results
        response_data = {
            'message': 'Model trained successfully',
            'evaluation': sanitize_for_json(evaluation_results),
            'class_distribution_before_balancing': class_distribution_before_balancing,
            'do_balance_data': do_balance_data
        }
        if (do_balance_data):
            response_data['class_distribution_after_balancing'] = class_distribution_after_balancing
        
        # Add problem-specific metrics to response
        if problem_type.lower() == 'regression':
            response_data['regression_metrics'] = {
                'MAE': evaluation_results.get('mae'),
                'MSE': evaluation_results.get('mse'),
                'RMSE': evaluation_results.get('rmse'),
                'R2': evaluation_results.get('r2')
            }
            
        return jsonify(response_data)

    except Exception as e:
        logging.error(f"Error during training: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500
    
    
if __name__ == '__main__':
    # Disable reloader to avoid double logs
    app.run(debug=True, use_reloader=False)








    
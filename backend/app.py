from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from scipy.stats import zscore
import logging
from flask_cors import CORS
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder
# from imblearn.over_sampling import SMOTE
from ml.ml_functions import preprocess_data, train_model_with_fairness


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
        # Read the dataset
        data = pd.read_csv(file)

        # Identify and drop a unique ID column
        dropped_column = None
        for col in data.columns:
            if data[col].nunique() == len(data):  # Check uniqueness
                dropped_column = col
                data = data.drop(columns=[col])
                logging.info(f"Dropped ID column: {col}")
                break  
        
        # Get label and sensitive columns
        label_column = request.form.get('label_column')
        sensitive_column = request.form.get('sensitive_column')
        sensitive_column2 = request.form.get('sensitive_column2')
        problem_type = request.form.get('problem_type')
        

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
        X, y, sensitive = preprocess_data(data, label_column, sensitive_column)
        logging.info("Preprocessing completed successfully.")
        # logging.debug(f"Feature data (X) shape: {X.shape}")

        # Calculate missing data percentages
        missing_data = get_missing_data(data)
        logging.info(f"Missing data before handling: {missing_data}")

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
        logging.error(f"Missing data before handling: {get_missing_data(data)}")
        

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

def get_data_types(df):
    """Returns the data types of each column."""
    data_types = {col: str(dtype) for col, dtype in df.dtypes.items()}
    # logging.debug(f"Data types: {data_types}")
    return data_types

def get_statistics(df):
    """Returns basic statistics for numerical columns."""
    stats = df.describe().round(2).to_dict()
    return stats

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

def get_class_distribution(df, label_column):
    """Returns the distribution of classes in the label column."""
    if label_column in df.columns:
        class_dist = df[label_column].value_counts(normalize=True).round(4).to_dict()
        # logging.debug(f"Class distribution: {class_dist}")
        return class_dist
    return None

def get_sensitive_column_distribution(df, sensitive_column):
    """Returns the distribution of the sensitive column."""
    if sensitive_column in df.columns:
        sensitive_dist = df[sensitive_column].value_counts(normalize=True).round(4).to_dict()
        # logging.debug(f"Sensitive column distribution: {sensitive_dist}")
        return sensitive_dist
    return None

# Missing Data Handling Function
def handle_missing_data(df, strategy="mean"):
    imputer = SimpleImputer(strategy=strategy)
    df_numeric = df.select_dtypes(include=['number'])
    df[df_numeric.columns] = imputer.fit_transform(df_numeric)

    for col in df.select_dtypes(include=['object', 'category']).columns:
        if df[col].isnull().any():
            df[col].fillna(df[col].mode()[0], inplace=True)

    return df

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
        problem_type = uploaded_data.get('problem_type', None)  

        if problem_type is None:
            raise ValueError("Problem type is not defined. Please specify the problem type during upload.")

        # Extract user configurations
        config = request.json
        algorithm = config['selectedAlgorithms'][0]
        fairness_metric = config['selectedFairnessMetrics'][0]
        performance_metric = 'Accuracy'
        test_size = config['splitRatio'] / 100
        do_balance_data = config.get('doBalanceData', False)
        strategy = config.get('strategy', 'mean')  # Default strategy is 'mean'

        logging.info(f"Training with {algorithm}, Fairness: {fairness_metric}, Metric: {performance_metric}, Test size: {test_size}")
        logging.info(f"Do balance data: {do_balance_data}, Problem Type: {problem_type}")

        # Handle missing data if requested
        logging.info(f"Handling missing data with strategy: {strategy}")
        data = handle_missing_data(data, strategy=strategy)
        # Log missing data after handling
        missing_data_after_handling = get_missing_data(data)
        logging.info(f"Missing data after handling: {missing_data_after_handling}")

        # Log class distribution before balancing
        class_distribution_before_balancing = get_class_distribution(data, label_column)
        logging.info(f"Class distribution before balancing: {class_distribution_before_balancing}")

        # Balance class distribution if requested
        # if do_balance_data and problem_type == "classification":
        #     logging.info("Balancing class distribution using SMOTE")

        #     # Separate features and labels
        #     X = data.drop([label_column, sensitive_column], axis=1)
        #     y = data[label_column]

        #     # Separate numeric and categorical columns
        #     numeric_columns = X.select_dtypes(include=['number']).columns
        #     categorical_columns = X.select_dtypes(exclude=['number']).columns

        #     # Encode categorical columns using OneHotEncoder
        #     if len(categorical_columns) > 0:
        #         from sklearn.preprocessing import OneHotEncoder
        #         encoder = OneHotEncoder(sparse_output=False)  # Use sparse_output instead of sparse
        #         X_encoded = pd.DataFrame(encoder.fit_transform(X[categorical_columns]), columns=encoder.get_feature_names_out(categorical_columns))
        #         X_numeric = X[numeric_columns].reset_index(drop=True)  # Reset index for concatenation
        #         X = pd.concat([X_numeric, X_encoded], axis=1)
        #     else:
        #         X = X.reset_index(drop=True)  # Ensure index alignment

        #     # Apply SMOTE to numeric data
        #     smote = SMOTE()
        #     X_resampled, y_resampled = smote.fit_resample(X, y)

        #     # Recombine categorical columns (if any)
        #     if len(categorical_columns) > 0:
        #         X_resampled_categorical = encoder.inverse_transform(X_resampled[:, -len(encoder.categories_):])
        #         X_resampled_categorical_df = pd.DataFrame(X_resampled_categorical, columns=categorical_columns)
        #         X_resampled_numeric_df = pd.DataFrame(X_resampled[:, :len(numeric_columns)], columns=numeric_columns)
        #         balanced_data = pd.concat([X_resampled_numeric_df, X_resampled_categorical_df, y_resampled], axis=1)
        #     else:
        #         balanced_data = pd.concat([pd.DataFrame(X_resampled, columns=X.columns), y_resampled], axis=1)

        #     # Preserve sensitive column values
        #     balanced_data[sensitive_column] = data[sensitive_column].iloc[X_resampled_numeric_df.index].values

        #     # Replace the original dataset with the balanced one
        #     data = balanced_data

        #     # Log class distribution after balancing
        #     class_distribution_after_balancing = get_class_distribution(data, label_column)
        #     logging.info(f"Class distribution after balancing: {class_distribution_after_balancing}")

        # Preprocess data for training
        logging.info("Preprocessing data for training")
        X, y, sensitive = preprocess_data(data, label_column, sensitive_column)

        # Train the model
        logging.info("Starting model training")
        trained_model, evaluation_results = train_model_with_fairness(
            X, y, sensitive, algorithm, fairness_metric, performance_metric, test_size
        )

        # Respond with results
        return jsonify({
            'message': 'Model trained successfully',
            'evaluation': evaluation_results,
            'class_distribution_before_balancing': class_distribution_before_balancing,
            # 'class_distribution_after_balancing': class_distribution_after_balancing if do_balance_data else None
        })

    except Exception as e:
        logging.error(f"Error during training: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Disable reloader to avoid double logs
    app.run(debug=True, use_reloader=False)








    
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from scipy.stats import zscore
from ml.ml_functions import preprocess_data, train_model, train_model_with_fairness
import logging
from flask_cors import CORS

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()],
    force=True  # Ensure custom logging overrides Flask's default
)
logging.getLogger('werkzeug').setLevel(logging.ERROR)  # Suppress Werkzeug logs
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
        # logging.debug(f"Data columns: {data.columns}")
        # logging.debug(f"Data dimensions: {data.shape}")

        # Get label and sensitive columns
        label_column = request.form.get('label_column')
        sensitive_column = request.form.get('sensitive_column')

        # logging.info(f"Label column: {label_column}")
        # logging.info(f"Sensitive column: {sensitive_column}")

        if label_column not in data.columns or sensitive_column not in data.columns:
            logging.warning(f"Label column '{label_column}' or sensitive column '{sensitive_column}' not found.")
            return jsonify({'error': f"Columns '{label_column}' or '{sensitive_column}' not found in dataset"}), 400

        # Preprocess data
        X, y, sensitive = preprocess_data(data, label_column, sensitive_column)
        logging.info("Preprocessing completed successfully.")
        # logging.debug(f"Feature data (X) shape: {X.shape}")

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

        response = {
            'message': 'Dataset processed successfully.',
            'dataset_summary': dataset_summary,
            'label_column': label_column,
            'file_name': file.filename,
            'sensitive_column': sensitive_column,
            'data_shape': list(data.shape),  # Convert tuple to list
            'features_shape': list(X.shape)  # Convert tuple to list
        }



        # Store data and metadata in a global variable
        uploaded_data['data'] = data
        uploaded_data['label_column'] = label_column
        uploaded_data['sensitive_column'] = sensitive_column

        logging.info("Data and metadata stored in global variable.")

        # logging.info(f"Response to frontend: {response}")  # Log for debugging
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
    # logging.debug(f"Statistics: {stats}")
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



@app.route('/train', methods=['POST'])
def train_model():
    global uploaded_data
    try:

        # Retrieve data and columns from global storage
        if not uploaded_data:
            raise ValueError("No data found. Please upload a dataset first.")

        data = uploaded_data['data']
        label_column = uploaded_data['label_column']
        sensitive_column = uploaded_data['sensitive_column']

        # Extract user configurations
        config = request.json
        algorithm = config['selectedAlgorithms'][0]
        fairness_metric = config['selectedFairnessMetrics'][0]
        performance_metric = config['selectedPerformanceMetrics'][0]
        test_size = config['splitRatio'] / 100

        logging.info(f"Training with {algorithm}, Fairness: {fairness_metric}, Metric: {performance_metric}, Test size: {test_size}")

        # Ensure X, y, and sensitive are available (from preprocess_data)
        X, y, sensitive = preprocess_data(data, label_column, sensitive_column)

        # Call ML functions
        trained_model, evaluation_results, = train_model_with_fairness(
            X, y, sensitive, algorithm, fairness_metric, performance_metric, test_size
        )

        # Respond with results
        return jsonify({
            'message': 'Model trained successfully',
            'evaluation': evaluation_results
        })

    except Exception as e:
        logging.error(f"Error during training: {e}")
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    # Disable reloader to avoid double logs
    app.run(debug=True, use_reloader=False)

import logging
import pandas as pd

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def preprocess_data(data, label_column, sensitive_column=None, sensitive=None):
    global non_numeric_columns
    
    try:
        logger.info("Starting data preprocessing...")

        # Separate the features (X), label (y)
        X = data.drop([label_column], axis=1)
        y = data[label_column]

        # Drop sensitive column(s) from X
        if sensitive_column:
            if isinstance(sensitive_column, list):
                X = X.drop(sensitive_column, axis=1)
            else:
                X = X.drop([sensitive_column], axis=1)

        # Extract sensitive if not provided
        if sensitive is None:
            if isinstance(sensitive_column, list) and len(sensitive_column) == 2:
                sensitive = list(zip(data[sensitive_column[0]], data[sensitive_column[1]]))
            elif isinstance(sensitive_column, str):
                sensitive = data[sensitive_column]
            else:
                raise ValueError("Invalid sensitive_column format.")

        # Handle missing numeric data
        numeric_columns = X.select_dtypes(include=['number']).columns
        if len(numeric_columns) > 0:
            X[numeric_columns] = X[numeric_columns].fillna(X[numeric_columns].mean())
            logging.debug(f"Filled missing values in numeric columns: {numeric_columns}")

        # Handle missing and encode non-numeric
        non_numeric_columns = X.select_dtypes(exclude=['number']).columns
        if len(non_numeric_columns) > 0:
            X[non_numeric_columns] = X[non_numeric_columns].fillna(X[non_numeric_columns].mode().iloc[0])
            logging.debug(f"Filled missing values in non-numeric columns: {non_numeric_columns}")
            X = pd.get_dummies(X, columns=non_numeric_columns, drop_first=True)
            logger.debug(f"One-hot encoded columns: {non_numeric_columns}")

        logger.info("Preprocessing completed successfully.")
        logger.debug(f"Feature data shape: {X.shape}, Label data shape: {y.shape}")

        return X, y, sensitive

    except Exception as e:
        logger.error(f"Error during preprocessing: {e}")
        raise

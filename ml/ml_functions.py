import pandas as pd
from sklearn.linear_model import LogisticRegression
import logging
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from fairlearn.metrics import demographic_parity_difference ,equalized_odds_difference
from sklearn.metrics import accuracy_score, precision_score, recall_score
from sklearn.preprocessing import StandardScaler
from flask import jsonify

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

non_numeric_columns = {}
def preprocess_data(data, label_column, sensitive_column):
    global non_numeric_columns
    """
    Preprocess the input data by separating features, labels, and sensitive attributes.
    Handles missing values for numeric and non-numeric columns and encodes categorical features.

    Parameters:
        data (pd.DataFrame): Input dataset
        label_column (str): Column name for the target label
        sensitive_column (str): Column name for the sensitive attribute

    Returns:
        tuple: Features (X), Labels (y), and Sensitive attributes (sensitive)
    """
    try:
        logger.info("Starting data preprocessing...")
        logger.debug(f"Columns in the dataset: {list(data.columns)}")
        logger.debug(
            f"Target label: {label_column}, Sensitive attribute: {sensitive_column}")

        # Separate the features (X), label (y), and sensitive attribute (sensitive)
        X = data.drop([label_column, sensitive_column], axis=1)
        y = data[label_column]
        sensitive = data[sensitive_column]

        # Handle missing data for numeric columns
        numeric_columns = X.select_dtypes(include=['number']).columns
        if numeric_columns.empty:
            logger.warning("No numeric columns found in the dataset.")
        else:
            X[numeric_columns] = X[numeric_columns].fillna(
                X[numeric_columns].mean())
            logger.debug(
                f"Filled missing values in numeric columns: {numeric_columns}")

        # Handle missing data for non-numeric columns and encode them
        non_numeric_columns = X.select_dtypes(exclude=['number']).columns
        if non_numeric_columns.empty:
            logger.warning("No non-numeric columns found in the dataset.")
        else:
            X[non_numeric_columns] = X[non_numeric_columns].fillna(
                X[non_numeric_columns].mode().iloc[0]
            )
            logger.debug(
                f"Filled missing values in non-numeric columns: {non_numeric_columns}")
            
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



def train_model(X, y):
    """
    Train a logistic regression model on the given features and labels.

    Parameters:
        X (pd.DataFrame): Features
        y (pd.Series): Target labels

    Returns:
        model: Trained logistic regression model
    """
    try:
        logger.info("Starting model training...")
        model = LogisticRegression()
        model.fit(X, y)
        logger.info("Model training completed successfully.")
        logger.debug(f"Model coefficients: {model.coef_}")
        return model

    except Exception as e:
        logger.error(f"Error during model training: {e}")
        raise


def train_model_with_fairness(X, y, sensitive, algorithm, fairness_metric, performance_metric, test_size=0.2):
    logger.info("Starting Training...")
    global non_numeric_columns

    # Split the dataset
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)
    sensitive_train, sensitive_test = train_test_split(sensitive, test_size=test_size, random_state=42)

    # Log dataset shapes
    logger.debug(f"X_train shape: {X_train.shape}, y_train shape: {y_train.shape}")
    logger.debug(f"X_test shape: {X_test.shape}, y_test shape: {y_test.shape}")
    logger.debug(f"sensitive_train shape: {sensitive_train.shape}, sensitive_test shape: {sensitive_test.shape}")

    # Select model
    if algorithm == 'Logistic Regression':
        model = LogisticRegression()
    elif algorithm == 'Random Forest':
        model = RandomForestClassifier()
    else:
        raise ValueError(f"Unsupported algorithm: {algorithm}")

    # Train the model
    model.fit(X_train, y_train)

    # Make predictions
    y_pred = model.predict(X_test)

    # Log prediction shapes
    logger.debug(f"y_pred shape: {y_pred.shape}, y_test shape: {y_test.shape}")

    # Evaluate fairness metric
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

    # Evaluate performance
    if performance_metric == 'Accuracy':
        performance_score = accuracy_score(y_test, y_pred)
    elif performance_metric == 'Precision':
        performance_score = precision_score(y_test, y_pred, average='binary')
    elif performance_metric == 'Recall':
        performance_score = recall_score(y_test, y_pred, average='binary')
    else:
        raise ValueError(f"Unsupported performance metric: {performance_metric}")

    # Log scores
    logger.debug(f"Fairness Score ({fairness_metric}): {fairness_score}")
    logger.debug(f"Performance Score ({performance_metric}): {performance_score}")

     # Respond with JSON
    response = {
        'fairness_score': fairness_score,
        'performance_score': performance_score,
        'fairness_metric': fairness_metric,
        'performance_metric': performance_metric,
        'non_numeric_columns' : non_numeric_columns
    }

    return model, {
        'fairness_score': fairness_score,
        'performance_score': performance_score,
        'fairness_metric': fairness_metric,
        'performance_metric': performance_metric,
        'non_numeric_columns' : list(non_numeric_columns),
        'algorithm' : algorithm
    }


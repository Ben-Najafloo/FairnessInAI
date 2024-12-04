Start
↓
Data Upload & Attribute Selection
↓
Data Processing & Preprocessing
↓
Model Selection → Model Training
↓
Fairness Metrics Calculation
↓
Result Visualization
↓
Bias Mitigation Recommendations
↓
End

Thesis/
│
├── frontend/ # React app (already created)
│ ├── public/
│ ├── src/
│ ├── package.json
│ └── ...
│
├── backend/ # Backend server (flask fairlearn scikit-learn pandas)
│ ├── app.py # Main backend entry point
│ ├── requirements.txt # Backend dependencies
│ ├── config/ # Backend configurations (e.g., environment variables)
│ ├── routes/ # API route files (optional, for organizing endpoints)
│ ├── tests/ # Backend tests (e.g., pytest)
│ └── ...
│
├── ml/ # Machine Learning components
│ ├── ml_functions.py # ML logic and models
│ ├── model/ # Trained models (e.g., .pkl, .h5, etc.)
│ ├── notebooks/ # Jupyter notebooks for ML experimentation
│ ├── data/ # Dataset files (e.g., CSV, JSON)
│ └── ...
│
├── .gitignore # Ignore unnecessary files for Git
├── README.md # Project documentation
└── other_files # Any shared files or resources

python -m venv venv
source venv/Scripts/activate  
pip install -r requirements.txt

pip install flask fairlearn scikit-learn pandas

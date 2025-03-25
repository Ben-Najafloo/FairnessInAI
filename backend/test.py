# from flask import Flask, request, jsonify
# from flask_socketio import SocketIO
# import time  # Simulating training process
# from ml.tpot_ml import preprocess_data, train_model_with_fairness

# app = Flask(__name__)
# socketio = SocketIO(app, cors_allowed_origins="*")

# @app.route('/train', methods=['POST'])
# def train_model():
#     global uploaded_data

#     try:
#         if not uploaded_data:
#             raise ValueError("No data found. Please upload a dataset first.")

#         data = uploaded_data['data'].copy()
#         label_column = uploaded_data['label_column']
#         sensitive_column = uploaded_data['sensitive_column']
#         problem_type = uploaded_data.get('problem_type', None)

#         if problem_type is None:
#             raise ValueError("Problem type is not defined.")

#         config = request.json
#         algorithm = config.get('selectedAlgorithms', ['TPOT'])[0]
#         fairness_metric = config.get('selectedFairnessMetrics', ['Demographic Parity'])[0]
#         performance_metric = 'Accuracy'
#         test_size = config.get('splitRatio', 20) / 100
#         tpot_generations = config.get('tpotGenerations', 5)
#         tpot_population_size = config.get('tpotPopulationSize', 15)

#         X, y, sensitive = preprocess_data(data, label_column, sensitive_column)

#         # Define a generator function to stream progress
#         def train_with_progress():
#             model, results = train_model_with_fairness(
#                 X, y, sensitive, algorithm, fairness_metric, performance_metric,
#                 test_size, tpot_generations, tpot_population_size, problem_type
#             )

#             for i in range(1, 101, 20):  # Simulating progress updates
#                 time.sleep(1)  # Simulating time-consuming training
#                 socketio.emit('training_progress', {'progress': i})

#             socketio.emit('training_complete', results)

#         socketio.start_background_task(train_with_progress)
#         return jsonify({'message': 'Training started'}), 200

#     except Exception as e:
#         return jsonify({'error': str(e)}), 400

# if __name__ == '__main__':
#     socketio.run(app, debug=True)

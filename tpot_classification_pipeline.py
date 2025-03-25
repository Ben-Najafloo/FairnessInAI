# TPOT optimized pipeline
# Generated 2025-03-24 20:18:23

import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline

# Pipeline: Pipeline(steps=[('robustscaler',
                 RobustScaler(quantile_range=(0.2475690452454,
                                              0.9671736154307))),
                ('selectfwe', SelectFwe(alpha=0.0064683687199)),
                ('featureunion-1',
                 FeatureUnion(transformer_list=[('skiptransformer',
                                                 SkipTransformer()),
                                                ('passthrough',
                                                 Passthrough())])),
                ('featureunion-2',
                 FeatureUnion(transformer_list=[('skiptransformer',
                                                 SkipTransformer()),
                                                ('passthrough',
                                                 Passthrough())])),
                ('mlpclassifier',
                 MLPClassifier(activation='logistic', alpha=0.002006143876,
                               hidden_layer_sizes=[311, 311, 311],
                               learning_rate_init=0.0029559014866,
                               n_iter_no_change=32, random_state=42))])

def tpot_pipeline():
    return Pipeline(steps=[('robustscaler',
                 RobustScaler(quantile_range=(0.2475690452454,
                                              0.9671736154307))),
                ('selectfwe', SelectFwe(alpha=0.0064683687199)),
                ('featureunion-1',
                 FeatureUnion(transformer_list=[('skiptransformer',
                                                 SkipTransformer()),
                                                ('passthrough',
                                                 Passthrough())])),
                ('featureunion-2',
                 FeatureUnion(transformer_list=[('skiptransformer',
                                                 SkipTransformer()),
                                                ('passthrough',
                                                 Passthrough())])),
                ('mlpclassifier',
                 MLPClassifier(activation='logistic', alpha=0.002006143876,
                               hidden_layer_sizes=[311, 311, 311],
                               learning_rate_init=0.0029559014866,
                               n_iter_no_change=32, random_state=42))])

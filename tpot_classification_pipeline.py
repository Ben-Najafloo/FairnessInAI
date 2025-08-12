# TPOT optimized pipeline
# Generated 2025-08-12 10:23:13

import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline

# Pipeline: Pipeline(steps=[('standardscaler', StandardScaler()),
                ('selectpercentile',
                 SelectPercentile(percentile=37.1143747020325)),
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
                ('baggingclassifier',
                 BaggingClassifier(bootstrap=False, bootstrap_features=True,
                                   max_features=0.9909153093485,
                                   max_samples=0.814103895965, n_estimators=55,
                                   n_jobs=1, random_state=42))])

def tpot_pipeline():
    return Pipeline(steps=[('standardscaler', StandardScaler()),
                ('selectpercentile',
                 SelectPercentile(percentile=37.1143747020325)),
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
                ('baggingclassifier',
                 BaggingClassifier(bootstrap=False, bootstrap_features=True,
                                   max_features=0.9909153093485,
                                   max_samples=0.814103895965, n_estimators=55,
                                   n_jobs=1, random_state=42))])

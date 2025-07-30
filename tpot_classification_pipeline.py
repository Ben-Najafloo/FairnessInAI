# TPOT optimized pipeline
# Generated 2025-06-24 15:09:16

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
                ('lgbmclassifier',
                 LGBMClassifier(boosting_type='goss', class_weight='balanced',
                                max_depth=5, n_estimators=80, n_jobs=1,
                                num_leaves=132, random_state=42, verbose=-1))])

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
                ('lgbmclassifier',
                 LGBMClassifier(boosting_type='goss', class_weight='balanced',
                                max_depth=5, n_estimators=80, n_jobs=1,
                                num_leaves=132, random_state=42, verbose=-1))])

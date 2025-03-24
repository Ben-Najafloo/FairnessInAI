# TPOT optimized pipeline
# Generated 2025-03-24 18:59:53

import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline

# Pipeline: Pipeline(steps=[('robustscaler',
                 RobustScaler(quantile_range=(0.2475690452454,
                                              0.9671736154307))),
                ('selectfwe', SelectFwe(alpha=0.0012903345738)),
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
                 LGBMClassifier(boosting_type='goss', max_depth=4,
                                n_estimators=61, n_jobs=1, num_leaves=18,
                                random_state=42, verbose=-1))])

def tpot_pipeline():
    return Pipeline(steps=[('robustscaler',
                 RobustScaler(quantile_range=(0.2475690452454,
                                              0.9671736154307))),
                ('selectfwe', SelectFwe(alpha=0.0012903345738)),
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
                 LGBMClassifier(boosting_type='goss', max_depth=4,
                                n_estimators=61, n_jobs=1, num_leaves=18,
                                random_state=42, verbose=-1))])

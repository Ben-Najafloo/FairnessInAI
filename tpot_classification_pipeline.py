# TPOT optimized pipeline
# Generated 2025-04-20 16:15:26

import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline

# Pipeline: Pipeline(steps=[('minmaxscaler', MinMaxScaler()),
                ('rfe',
                 RFE(estimator=ExtraTreesClassifier(max_features=0.4503212524738,
                                                    min_samples_leaf=4,
                                                    min_samples_split=7,
                                                    n_jobs=1, random_state=42),
                     step=0.9162776237062)),
                ('featureunion-1',
                 FeatureUnion(transformer_list=[('featureunion',
                                                 FeatureUnion(transformer_list=[('binarizer',
                                                                                 Binarizer(threshold=0.856281565145...
                               feature_types=None, feature_weights=None,
                               gamma=0.0153706668713, grow_policy=None,
                               importance_type=None,
                               interaction_constraints=None,
                               learning_rate=0.0354272416933, max_bin=None,
                               max_cat_threshold=None, max_cat_to_onehot=None,
                               max_delta_step=None, max_depth=10,
                               max_leaves=None, min_child_weight=15,
                               missing=nan, monotone_constraints=None,
                               multi_strategy=None, n_estimators=100, n_jobs=1,
                               nthread=1, ...))])

def tpot_pipeline():
    return Pipeline(steps=[('minmaxscaler', MinMaxScaler()),
                ('rfe',
                 RFE(estimator=ExtraTreesClassifier(max_features=0.4503212524738,
                                                    min_samples_leaf=4,
                                                    min_samples_split=7,
                                                    n_jobs=1, random_state=42),
                     step=0.9162776237062)),
                ('featureunion-1',
                 FeatureUnion(transformer_list=[('featureunion',
                                                 FeatureUnion(transformer_list=[('binarizer',
                                                                                 Binarizer(threshold=0.856281565145...
                               feature_types=None, feature_weights=None,
                               gamma=0.0153706668713, grow_policy=None,
                               importance_type=None,
                               interaction_constraints=None,
                               learning_rate=0.0354272416933, max_bin=None,
                               max_cat_threshold=None, max_cat_to_onehot=None,
                               max_delta_step=None, max_depth=10,
                               max_leaves=None, min_child_weight=15,
                               missing=nan, monotone_constraints=None,
                               multi_strategy=None, n_estimators=100, n_jobs=1,
                               nthread=1, ...))])

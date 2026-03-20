import numpy as np
import pickle
import copy
import warnings
import os

warnings.filterwarnings("ignore")
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

CHECKPOINTS = [0, 3, 6, 9, 12, 15, 18, 21, 24]
MAX_SEQ_LEN = 10

LSTM_WEIGHT = 0.05
WHO_WEIGHT = 0.95
HEIGHT_BIAS_CORRECTION = 0.0
WEIGHT_BIAS_CORRECTION = 0.0

WHO_STANDARDS = {
    "boy": {
        "months": [0, 3, 6, 9, 12, 15, 18, 21, 24],
        "height": [49.9, 61.4, 67.6, 72.0, 75.7, 79.1, 82.3, 85.1, 87.8],
        "weight": [3.3, 6.4, 7.9, 8.9, 9.6, 10.2, 10.9, 11.5, 12.2],
    },
    "girl": {
        "months": [0, 3, 6, 9, 12, 15, 18, 21, 24],
        "height": [49.1, 59.8, 65.7, 70.1, 74.0, 77.5, 80.7, 83.7, 86.4],
        "weight": [3.2, 5.8, 7.3, 8.2, 8.9, 9.6, 10.2, 10.9, 11.5],
    },
}


def create_visit(age, height, weight, gender, prev_visit=None, visit_num=1):
    h_m = height / 100.0
    cbmi = weight / (h_m ** 2) if h_m > 0 else 0.0
    h_vel = w_vel = 0.0

    if prev_visit:
        time_passed = age - prev_visit["age_months"]
        if time_passed > 0:
            h_vel = (height - prev_visit["height"]) / time_passed
            w_vel = (weight - prev_visit["weight"]) / time_passed

    return {
        "age_months": float(age),
        "height": float(height),
        "weight": float(weight),
        "cbmi": cbmi,
        "zlen": prev_visit.get("zlen", 0.0) if prev_visit else 0.0,
        "zwei": prev_visit.get("zwei", 0.0) if prev_visit else 0.0,
        "zwfl": prev_visit.get("zwfl", 0.0) if prev_visit else 0.0,
        "zbmi": prev_visit.get("zbmi", 0.0) if prev_visit else 0.0,
        "gender_numeric": int(gender),
        "height_velocity_monthly": h_vel,
        "weight_velocity_monthly": w_vel,
        "measurement_number": int(visit_num),
    }


def predict_trajectory(actual_visits, model, scaler, features):
    current_seq = copy.deepcopy(actual_visits)
    last_age = current_seq[-1]["age_months"]
    gender_num = current_seq[0]["gender_numeric"]
    gender_str = "boy" if gender_num == 1 else "girl"

    future_targets = [m for m in CHECKPOINTS if m > last_age]
    pred_months, pred_heights, pred_weights = [], [], []

    who_h_med = WHO_STANDARDS[gender_str]["height"]
    who_w_med = WHO_STANDARDS[gender_str]["weight"]
    who_months = WHO_STANDARDS[gender_str]["months"]

    current_h_ratio = current_seq[-1]["height"] / np.interp(last_age, who_months, who_h_med)
    current_w_ratio = current_seq[-1]["weight"] / np.interp(last_age, who_months, who_w_med)

    for target_m in future_targets:
        raw_array = np.array(
            [[v[f] for f in features] for v in current_seq], dtype=np.float32
        )
        if len(raw_array) < MAX_SEQ_LEN:
            padding = np.zeros((MAX_SEQ_LEN - len(raw_array), len(features)))
            raw_array = np.vstack([padding, raw_array])
        else:
            raw_array = raw_array[-MAX_SEQ_LEN:]

        scaled_input = scaler.transform(raw_array).reshape(1, MAX_SEQ_LEN, len(features))

        prediction = model.predict(scaled_input, verbose=0)[0]
        lstm_h_raw = float(np.clip(prediction[0], 40, 130))
        lstm_w_raw = float(np.clip(prediction[1], 1, 30))

        lstm_h = lstm_h_raw - HEIGHT_BIAS_CORRECTION
        lstm_w = lstm_w_raw - WEIGHT_BIAS_CORRECTION

        bio_h = np.interp(target_m, who_months, who_h_med) * current_h_ratio
        bio_w = np.interp(target_m, who_months, who_w_med) * current_w_ratio

        next_h = float(np.clip((lstm_h * LSTM_WEIGHT) + (bio_h * WHO_WEIGHT), 40, 130))
        next_w = float(np.clip((lstm_w * LSTM_WEIGHT) + (bio_w * WHO_WEIGHT), 1, 30))

        pred_months.append(target_m)
        pred_heights.append(next_h)
        pred_weights.append(next_w)

        next_visit = create_visit(
            age=target_m,
            height=next_h,
            weight=next_w,
            gender=gender_num,
            prev_visit=current_seq[-1],
            visit_num=current_seq[-1]["measurement_number"] + 1,
        )
        current_seq.append(next_visit)

    return pred_months, pred_heights, pred_weights


class AttentionLayer:
    pass


class GrowthPredictor:

    def __init__(self, model_path=None, scaler_path=None, metadata_path=None):
        try:
            import tensorflow as tf
            from tensorflow import keras
        except ImportError:
            raise ImportError(
                "TensorFlow is not installed.\n"
                "Run: pip install tensorflow\nThen restart Flask."
            )

        class AttentionLayerReal(keras.layers.Layer):
            def __init__(self, **kwargs):
                super().__init__(**kwargs)

            def build(self, input_shape):
                self.W = self.add_weight(
                    name="attention_weight",
                    shape=(input_shape[-1], input_shape[-1]),
                    initializer="glorot_uniform",
                    trainable=True,
                )
                self.b = self.add_weight(
                    name="attention_bias",
                    shape=(input_shape[-1],),
                    initializer="zeros",
                    trainable=True,
                )
                super().build(input_shape)

            def call(self, x):
                e = tf.nn.tanh(tf.matmul(x, self.W) + self.b)
                a = tf.nn.softmax(e, axis=1)
                return tf.reduce_sum(x * a, axis=1)

            def get_config(self):
                return super().get_config()

        base = os.path.dirname(os.path.abspath(__file__))

        model_path = model_path or os.path.join(base, "data", "models", "LSTM_best.keras")
        scaler_path = scaler_path or os.path.join(base, "data", "processed", "scaler.pkl")
        metadata_path = metadata_path or os.path.join(base, "data", "processed", "metadata.pkl")

        self.model_name = os.path.basename(model_path)
        custom_objects = {"AttentionLayer": AttentionLayerReal} if "Attention" in self.model_name else None
        self.model = tf.keras.models.load_model(model_path, custom_objects=custom_objects)

        with open(scaler_path, "rb") as f:
            self.scaler = pickle.load(f)

        with open(metadata_path, "rb") as f:
            meta = pickle.load(f)

        self.feature_names = meta["input_features"]

        print(f"✓ GrowthPredictor loaded: {self.model_name}")
        print(f"  Features : {len(self.feature_names)}")
        print(f"  Blend    : {int(LSTM_WEIGHT*100)}% LSTM + {int(WHO_WEIGHT*100)}% WHO")

    def predict(self, visits: list, gender: str) -> dict:
        if not visits:
            raise ValueError("At least one visit is required.")

        g = gender.lower()
        if g in ("male", "m", "boy", "1"):
            gender_numeric, gender_str = 1, "boy"
        elif g in ("female", "f", "girl", "0"):
            gender_numeric, gender_str = 0, "girl"
        else:
            raise ValueError(f"Unrecognised gender: '{gender}'")

        history = []
        for i, v in enumerate(visits):
            visit = create_visit(
                age=v["age_months"],
                height=v["height"],
                weight=v["weight"],
                gender=gender_numeric,
                prev_visit=history[-1] if i > 0 else None,
                visit_num=i + 1,
            )
            history.append(visit)

        pred_months, pred_heights, pred_weights = predict_trajectory(
            history, self.model, self.scaler, self.feature_names,
        )

        actuals = [
            {"age_months": v["age_months"], "height": v["height"], "weight": v["weight"]}
            for v in history
        ]

        predictions = [
            {"age_months": m, "height": round(h, 1), "weight": round(w, 2)}
            for m, h, w in zip(pred_months, pred_heights, pred_weights)
        ]

        who_ref = WHO_STANDARDS[gender_str]

        return {
            "actuals": actuals,
            "predictions": predictions,
            "who_median": {
                "months": who_ref["months"],
                "height": who_ref["height"],
                "weight": who_ref["weight"],
            },
            "gender": gender_str,
            "model_used": self.model_name,
            "blend_info": {
                "lstm_weight": LSTM_WEIGHT,
                "who_weight": WHO_WEIGHT,
                "height_bias_correction": HEIGHT_BIAS_CORRECTION,
                "weight_bias_correction": WEIGHT_BIAS_CORRECTION,
            },
        }
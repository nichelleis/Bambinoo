from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

_predictor = None


def _get_predictor():
    """Initialize the GrowthPredictor only when first used."""
    global _predictor
    if _predictor is None:
        from ml.src.prediction_engine import GrowthPredictor
        _predictor = GrowthPredictor()
    return _predictor


growth_bp = Blueprint("growth", __name__)


@growth_bp.route("/predict-growth", methods=["POST"])
@jwt_required()
def predict_growth():
    """Return growth predictions based on stored child growth records."""

    try:
        from app import db, Child, GrowthRecord

        parent_id = get_jwt_identity()

        child = Child.query.filter_by(parent_id=parent_id).first()
        if not child:
            return jsonify({"error": "Child not found"}), 404

        records = (
            GrowthRecord.query
            .filter_by(child_id=child.id)
            .order_by(GrowthRecord.record_date.asc())
            .all()
        )

        if not records:
            return jsonify({"error": "No growth records found. Please add measurements first."}), 400

        dob = child.date_of_birth

        visits = []
        for r in records:

            record_date = r.record_date.date() if hasattr(r.record_date, "date") else r.record_date

            age_months = (
                (record_date.year - dob.year) * 12
                + (record_date.month - dob.month)
            )

            if r.height and r.weight:
                visits.append(
                    {
                        "age_months": age_months,
                        "height": r.height,
                        "weight": r.weight,
                    }
                )

        if not visits:
            return jsonify({"error": "No valid height/weight records found."}), 400

        gender = "male" if child.gender.upper() in ("M", "MALE", "BOY") else "female"

        predictor = _get_predictor()

        result = predictor.predict(
            visits=visits,
            gender=gender,
        )

        return jsonify(result), 200

    except Exception as e:
        print(f"[GrowthAPI] Prediction error: {e}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500
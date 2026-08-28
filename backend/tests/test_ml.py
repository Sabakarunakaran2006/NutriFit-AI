import pytest
from app.ml.prediction.calorie_predictor import predict_calorie_and_macros
from app.ml.prediction.archetype_clusterer import assign_fitness_archetype

def test_calorie_predictor_output():
    res = predict_calorie_and_macros(
        age=25,
        gender="male",
        height_cm=178.0,
        weight_kg=74.0,
        target_weight_kg=78.0,
        goal="muscle_gain",
        activity_level="moderate",
        dietary_preference="non_vegetarian",
        sleep_hours=7.5,
        stress_level="moderate"
    )
    assert "target_calories" in res
    assert "target_protein" in res
    assert "target_carbs" in res
    assert "target_fat" in res
    assert res["target_calories"] > 1800.0
    assert res["target_protein"] > 100.0
    assert "ml_model_used" in res
    assert len(res["explanation"]) > 10

def test_archetype_clusterer_output():
    cluster_res = assign_fitness_archetype(
        age=26,
        height_cm=180.0,
        weight_kg=85.0,
        goal="weight_loss",
        activity_level="active",
        sleep_hours=8.0,
        workout_freq=5
    )
    assert "archetype" in cluster_res
    assert "method" in cluster_res
    assert "bmi" in cluster_res
    assert cluster_res["bmi"] > 20.0

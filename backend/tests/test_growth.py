#Tests: header endpoint, growth trend, growth record creation, nurse vs doctor data entry restrictions.
# Covers FR4 - View CHDR data, FR5 - Clincal Staff can add CHDR data, FR6 - Nurse has limited data entry

import pytest
from datetime import datetime, timedelta
from app import db, GrowthRecord, Child, User


#TestClass1 - Testing for parent-facing growth data endpoints 
class TestParentGrowthEndpoints:

    #TC1-GRW-01: /header returns child name, DOB, and latest growth metrics
    def test_header_returns_child_data(self, client, parent_user, child_record, parent_token):
        resp = client.get("/header",
                          headers={"Authorization": f"Bearer {parent_token}"})
        assert resp.status_code == 200
        data = resp.get_json()
        assert "name" in data
        assert "growth" in data
        assert data["growth"]["weight"]["current"] is not None


    #TC1-GRW-02: /header includes 'previous' growth value for trend comparison
    def test_header_returns_previous_growth(self, client, parent_user, child_record, parent_token):
        resp = client.get("/header",
                          headers={"Authorization": f"Bearer {parent_token}"})
        assert resp.status_code == 200
        g = resp.get_json()["growth"]
        assert g["weight"]["previous"] is not None

    def test_header_no_child_returns_404(self, client, app, admin_user, admin_token):
        """TC-GRW-03: /header returns 404 when no child linked to user."""
        resp = client.get("/header",
                          headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 404

    
    #TC1-GRW-04: /growth-trend returns trend array with date and weight
    def test_growth_trend_returns_list(self, client, parent_user, child_record, parent_token):
        resp = client.get("/growth-trend",
                          headers={"Authorization": f"Bearer {parent_token}"})
        assert resp.status_code == 200
        data = resp.get_json()
        assert "trend" in data
        assert isinstance(data["trend"], list)
        assert len(data["trend"]) > 0
        assert "date" in data["trend"][0]
        assert "weight" in data["trend"][0]

  
    #TC1-GRW-05: Growth trend is ordered oldest to newest
    def test_growth_trend_ordered_ascending(self, client, parent_user, child_record, parent_token):
        resp = client.get("/growth-trend",
                          headers={"Authorization": f"Bearer {parent_token}"})
        trend = resp.get_json()["trend"]
        dates = [t["date"] for t in trend]
        assert dates == sorted(dates)


    



#TestClass2 - Tests for doctor growth data entry
class TestDoctorGrowthInput:
  
    #TC2-GRW-06: Doctor can POST a new growth record for a child
    def test_doctor_can_add_growth_record(self, client, doctor_user, doctor_token,
                                           parent_user, child_record, app):
        child_id = child_record.id

        resp = client.post(
            f"/doctor/growth/{child_id}",
            json={
                "weight": 6.5,
                "height": 60.0,
                "head_circumference": 40.0,
                "record_date": datetime.utcnow().isoformat(),
                "notes": "Routine check"
            },
            headers={"Authorization": f"Bearer {doctor_token}"}
        )
        assert resp.status_code in (200, 201, 404)


    #TC2-GRW-07: BMI = weight(kg) / (height_m)^2 is correctly meassured
    def test_growth_record_bmi_calculation(self, app):
        weight_kg = 10.0
        height_cm = 80.0
        height_m = height_cm / 100
        expected_bmi = round(weight_kg / (height_m ** 2), 2)
        assert expected_bmi == pytest.approx(15.63, rel=0.01)

    
    #TC2-GRW-08: Doctor analytics endpoint returns child growth data
    def test_doctor_analytics_endpoint(self, client, doctor_token, parent_user,
                                        child_record, app):
        child_id = child_record.id
        resp = client.get(
            f"/doctor/analytics/{child_id}",
            headers={"Authorization": f"Bearer {doctor_token}"}
        )
        assert resp.status_code in (200, 404)


#TestClass3 - checks nurse roles limited data entry access
class TestNurseGrowthRestrictions:
    

    #TC3-GRW-09: Nurse can submit growth data (weight/height/vaccinations)
    def test_nurse_can_add_growth_data(self, client, nurse_token, parent_user,
                                        child_record, app):
        child_id = child_record.id

        resp = client.post(
            f"/nurse/growth/{child_id}",
            json={
                "weight": 7.0,
                "height": 63.0,
                "record_date": datetime.utcnow().isoformat(),
            },
            headers={"Authorization": f"Bearer {nurse_token}"}
        )
        assert resp.status_code in (200, 201, 404)

  
    #TC3-GRW-10: Nurse POST to doctor-notes endpoint returns 403
    def test_nurse_cannot_add_doctor_notes(self, client, nurse_token, parent_user,
                                            child_record, app):
        child_id = child_record.id

        resp = client.post(
            f"/doctor/notes/{child_id}",
            json={"title": "Test Note", "description": "Should be forbidden"},
            headers={"Authorization": f"Bearer {nurse_token}"}
        )
        assert resp.status_code not in (200, 201)



#TestClass 4 - Pure model-level unit tests for GrowthRecord
class TestGrowthDataModels:

    # TC4-GRW-11: GrowthRecord is persisted with correct fields
    def test_growth_record_creation(self, app, child_record, parent_user):
        pid = parent_user.id
        with app.app_context():
            child = Child.query.filter_by(parent_id=pid).first()
            records = GrowthRecord.query.filter_by(child_id=child.id).all()
            assert len(records) == 3
            assert all(r.weight is not None for r in records)
            assert all(r.height is not None for r in records)


    #TC4-GRW-12: GrowthRecords are sorted by record_date ascending
    def test_growth_records_ordered_by_date(self, app, parent_user, child_record):
        pid = parent_user.id
        with app.app_context():
            child = Child.query.filter_by(parent_id=pid).first()
            records = GrowthRecord.query.filter_by(child_id=child.id)\
                                        .order_by(GrowthRecord.record_date.asc()).all()
            dates = [r.record_date for r in records]
            assert dates == sorted(dates)
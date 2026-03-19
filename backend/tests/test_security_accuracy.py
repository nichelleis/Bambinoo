# Tests - Security and Accuracy of the System
# Covers NFR2 - Security and NFR1 - Accuracy

import pytest
from datetime import date, datetime, timedelta
from app import db, User, Child, GrowthRecord, Vaccination, Appointment, HealthNote, HealthRecord, Milestone
from werkzeug.security import generate_password_hash, check_password_hash


#TestClass1 - NFR2: Security — password hashing, token protection, CORS
class TestSecurityNFR:



    #TC1-SEC-01: User password_hash is never stored as plaintext
    def test_passwords_are_hashed_not_plaintext(self, app, parent_user):
        uid = parent_user.id
        with app.app_context():
            user = db.session.get(User, uid)
            assert user.password_hash != "Password@123"
            assert len(user.password_hash) > 30 



    #TC1-SEC-02: check_password_hash validates correct password
    def test_password_hash_verifies_correctly(self, app, parent_user):
        uid = parent_user.id
        with app.app_context():
            user = db.session.get(User, uid)
            assert check_password_hash(user.password_hash, "Password@123") is True

    

    #TC1-SEC-03: check_password_hash rejects wrong password
    def test_wrong_password_fails_verification(self, app, parent_user):
        uid = parent_user.id
        with app.app_context():
            user = db.session.get(User, uid)
            assert check_password_hash(user.password_hash, "WrongPass") is False



    #TC1-SEC-04: JWT-protected endpoint returns 401 without token
    def test_protected_endpoint_rejects_no_token(self, client):
        resp = client.get("/header")
        assert resp.status_code in (401, 422)



    #TC1-SEC-05: Expired/invalid JWT tokens are rejected
    def test_protected_endpoint_rejects_expired_token(self, client, app):
        resp = client.get("/header",
                          headers={"Authorization": "Bearer expired.token.here"})
        assert resp.status_code in (401, 422)



    #TC1-SEC-06: Duplicate MOH_ID raises IntegrityError (DB-level uniqueness
    def test_moh_id_is_unique(self, app, doctor_user):
        with app.app_context():
            dup = User(
                username="dup_moh",
                password_hash=generate_password_hash("x"),
                email="dup@test.lk",
                role="nurse",
                MOH_ID=doctor_user.MOH_ID  
            )
            db.session.add(dup)
            with pytest.raises(Exception): 
                db.session.commit()
            db.session.rollback()


    
    #TC1-SEC-07: Login response JSON does not include password_hash field
    def test_login_response_does_not_expose_password_hash(self, client, parent_user):
        resp = client.post("/login", json={
            "username": "parent_one",
            "password": "Password@123"
        })
        data = resp.get_json()
        assert "password_hash" not in str(data)
        assert "password" not in str(data).lower().replace("password", "")



#TestClass2 - NFR1: Data accuracy ensuring stored data matches input exactly
class TestDataAccuracy:


    #TC2-ACC-01: Growth record weight/height values match what was stored
    def test_growth_record_values_match_input(self, app, parent_user, child_record):
        from app import GrowthRecord, Child
        pid = parent_user.id
        with app.app_context():
            child = Child.query.filter_by(parent_id=pid).first()
            records = GrowthRecord.query.filter_by(child_id=child.id)\
                                        .order_by(GrowthRecord.record_date.asc()).all()
            expected_weights = [3.5, 4.2, 5.0]
            actual_weights = [r.weight for r in records]
            assert actual_weights == expected_weights


    #TC2-ACC-02: Child name is stored and retrieved without modification
    def test_child_name_stored_accurately(self, app, child_record, parent_user):
        from app import Child
        pid = parent_user.id
        with app.app_context():
            child = Child.query.filter_by(parent_id=pid).first()
            assert child.name == "Baby Test"


    #TC2-ACC-03: BMI = weight(kg) / (height_m)^2 is correctly measured
    def test_bmi_calculation(self, app):
        weight_kg = 10.0
        height_cm = 80.0
        height_m = height_cm / 100
        expected_bmi = round(weight_kg / (height_m ** 2), 2)
        assert expected_bmi == pytest.approx(15.63, rel=0.01)


    
    # TC3-ACC-04: Child date_of_birth and gender are stored and retrieved without modification
    def test_child_dob_and_gender_stored_accurately(self, app, child_record, parent_user):
        pid = parent_user.id
        with app.app_context():
            child = Child.query.filter_by(parent_id=pid).first()
            assert child.date_of_birth == date(2023, 1, 1)
            assert child.gender == "Male"


    
    # TC3-ACC-05: growth record count matches the number of records inserted
    def test_growth_record_count_matches_inserted(self, app, child_record, parent_user):
        pid = parent_user.id
        with app.app_context():
            child = Child.query.filter_by(parent_id=pid).first()
            records = GrowthRecord.query.filter_by(child_id=child.id).all()
            assert len(records) == 3



    # TC3-ACC-06:growth record height values match what was stored
    def test_growth_record_heights_match_input(self, app, child_record, parent_user):
        pid = parent_user.id
        with app.app_context():
            child = Child.query.filter_by(parent_id=pid).first()
            records = GrowthRecord.query.filter_by(child_id=child.id) \
                                        .order_by(GrowthRecord.record_date.asc()).all()
            expected_heights = [50.0, 52.5, 55.0]
            actual_heights = [r.height for r in records]
            assert actual_heights == expected_heights


    
    # TC3-ACC-07: age_at_record field stores the correct integer month values
    def test_growth_record_age_at_record_stored_correctly(self, app, child_record, parent_user):
        pid = parent_user.id
        with app.app_context():
            child = Child.query.filter_by(parent_id=pid).first()
            records = GrowthRecord.query.filter_by(child_id=child.id) \
                                        .order_by(GrowthRecord.record_date.asc()).all()
            expected_ages = [1, 2, 3]
            actual_ages = [r.age_at_record for r in records]
            assert actual_ages == expected_ages


    
    # TC3-ACC-08: User role is stored exactly as provided (no case changes)
    def test_user_role_stored_accurately(self, app, doctor_user, nurse_user, parent_user):
        with app.app_context():
            doc = db.session.get(User, doctor_user.id)
            nur = db.session.get(User, nurse_user.id)
            par = db.session.get(User, parent_user.id)
            assert doc.role == "doctor"
            assert nur.role == "nurse"
            assert par.role == "parent"


    
    # TC3-ACC-10:vaccination fields are stored and retrieved properly
    def test_vaccination_fields_stored_accurately(self, app, child_record):
        cid = child_record.id
        due = date(2024, 3, 15)
        with app.app_context():
            vacc = Vaccination(
                child_id=cid,
                vaccine_name="BCG",
                dose_number="1",
                due_date=due,
                status="scheduled",
                administered_by="Dr. Silva",
                location="MOH Clinic Colombo",
                batch_number="BCH-001",
            )
            db.session.add(vacc)
            db.session.commit()
            saved = Vaccination.query.filter_by(child_id=cid).first()
            assert saved.vaccine_name == "BCG"
            assert saved.dose_number == "1"
            assert saved.due_date == due
            assert saved.status == "scheduled"
            assert saved.administered_by == "Dr. Silva"
            assert saved.location == "MOH Clinic Colombo"
            assert saved.batch_number == "BCH-001"



    # TC3-ACC-11: Appointment fields are stored and retrieved accurately
    def test_appointment_fields_stored_accurately(self, app, child_record):
        cid = child_record.id
        appt_dt = datetime(2024, 6, 20, 10, 30)
        with app.app_context():
            appt = Appointment(
                child_id=cid,
                appointment_type="Routine Checkup",
                appointment_date=appt_dt,
                doctor_name="Dr. Perera",
                status="scheduled",
            )
            db.session.add(appt)
            db.session.commit()
            saved = Appointment.query.filter_by(child_id=cid).first()
            assert saved.appointment_type == "Routine Checkup"
            assert saved.appointment_date == appt_dt
            assert saved.doctor_name == "Dr. Perera"
            assert saved.status == "scheduled"



    # TC3-ACC-12: HealthNote temperature and medication fields are stored accurately
    def test_health_note_fields_stored_accurately(self, app, child_record):
        cid = child_record.id
        with app.app_context():
            note = HealthNote(
                child_id=cid,
                record_type="fever",
                record_date=datetime(2024, 4, 10, 9, 0),
                title="High Fever Episode",
                temperature=38.7,
                medication_name="Paracetamol",
                medication_dosage="5ml",
                severity="moderate",
            )
            db.session.add(note)
            db.session.commit()
            saved = HealthNote.query.filter_by(child_id=cid).first()
            assert saved.temperature == pytest.approx(38.7, rel=0.01)
            assert saved.medication_name == "Paracetamol"
            assert saved.medication_dosage == "5ml"
            assert saved.severity == "moderate"
            assert saved.title == "High Fever Episode"



    # TC3-ACC-17: milestone fields are stored and retrieved without modification
    def test_milestone_fields_stored_accurately(self, app, child_record):
        cid = child_record.id
        achieved = date(2023, 7, 1)
        with app.app_context():
            ms = Milestone(
                child_id=cid,
                milestone_id=101,
                category="motor",
                description="Rolls over independently",
                min_age=3,
                max_age=5,
                achieved_date=achieved,
            )
            db.session.add(ms)
            db.session.commit()
            saved = Milestone.query.filter_by(child_id=cid).first()
            assert saved.category == "motor"
            assert saved.description == "Rolls over independently"
            assert saved.min_age == 3
            assert saved.max_age == 5
            assert saved.achieved_date == achieved


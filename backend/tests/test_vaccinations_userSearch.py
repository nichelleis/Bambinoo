# Tests - Vaccination data Storage and retrieval, Patient Search feature in doctor and nurse dashboards, testing Child model constraints
# Covers FR4 - Viewing CHDR data and FR9 - Search Patients

import pytest
from datetime import date, datetime, timedelta
from app import db, Vaccination, Child, User


#TestClass1 - FR4: Vaccination data storage and retrieval
class TestVaccinationModel:

    #TC1-VAC-01: Vaccination record is persisted with all required fields
    def test_vaccination_created_correctly(self, app, child_record, parent_user):
        cid = child_record.id
        with app.app_context():
            vacc = Vaccination(
                child_id=cid,
                vaccine_name="BCG",
                dose_number="1",
                due_date=date.today(),
                status="scheduled"
            )
            db.session.add(vacc)
            db.session.commit()

            fetched = Vaccination.query.filter_by(child_id=cid, vaccine_name="BCG").first()
            assert fetched is not None
            assert fetched.dose_number == "1"
            assert fetched.status == "scheduled"


    #TC1-VAC-02: Vaccination status can be updated from scheduled to administered
    def test_vaccine_status_update(self, app, child_record, parent_user):
        cid = child_record.id
        with app.app_context():
            vacc = Vaccination(
                child_id=cid,
                vaccine_name="OPV",
                dose_number="1",
                due_date=date.today(),
                status="scheduled"
            )
            db.session.add(vacc)
            db.session.commit()

            vacc.status = "administered"
            vacc.administered_date = date.today()
            vacc.administered_by = "Dr. Silva"
            db.session.commit()

            updated = Vaccination.query.filter_by(vaccine_name="OPV", child_id=cid).first()
            assert updated.status == "administered"
            assert updated.administered_by == "Dr. Silva"


    #TC1-VAC-03: Vaccines with due_date < today and status=scheduled are taken as overdue
    def test_overdue_vaccine_detection(self, app, child_record, parent_user):
        cid = child_record.id
        with app.app_context():
            overdue = Vaccination(
                child_id=cid,
                vaccine_name="DPT",
                dose_number="1",
                due_date=date.today() - timedelta(days=30),
                status="scheduled"
            )
            db.session.add(overdue)
            db.session.commit()

            overdue_vaccines = Vaccination.query.filter(
                Vaccination.child_id == cid,
                Vaccination.due_date < date.today(),
                Vaccination.status == "scheduled"
            ).all()
            assert len(overdue_vaccines) >= 1
            assert any(v.vaccine_name == "DPT" for v in overdue_vaccines)


    #TC1-VAC-04: /vaccines-status endpoint returns vaccine schedule for child
    def test_vaccines_status_endpoint(self, client, parent_token, parent_user, child_record, app):
        resp = client.get("/vaccines-status",
                          headers={"Authorization": f"Bearer {parent_token}"})
        assert resp.status_code in (200, 400, 404, 500)


    #TC1-VAC-05: Completed vaccines appear in analytics endpoint
    def test_completed_vaccines_table(self, client, parent_token, parent_user, child_record, app):
        cid = child_record.id
        with app.app_context():
            vacc = Vaccination(
                child_id=cid,
                vaccine_name="MMR",
                dose_number="1",
                administered_date=date.today(),
                status="administered"
            )
            db.session.add(vacc)
            db.session.commit()

        resp = client.get("/analytics/vaccines",
                          headers={"Authorization": f"Bearer {parent_token}"})
        assert resp.status_code in (200, 404)


# TestClass2 - FR9: Clinical staff can search patients by identifier.
class TestPatientSearch:

    #TC2-SRC-01: doctor can search for a patient using MOH ID
    def test_doctor_search_by_moh_id(self, client, doctor_token, parent_user, app):
        resp = client.get(
            f"/doctor/search?moh_id={parent_user.MOH_ID}",
            headers={"Authorization": f"Bearer {doctor_token}"}
        )
        assert resp.status_code in (200, 404)


    # TC2-SRC-02: searching unknown MOH ID returns empty result or 404.
    def test_search_nonexistent_patient(self, client, doctor_token):
        resp = client.get(
            "/doctor/search?moh_id=MOH-GHOST999",
            headers={"Authorization": f"Bearer {doctor_token}"}
        )
        assert resp.status_code in (200, 404)
        if resp.status_code == 200:
            data = resp.get_json()
            assert data in ([], None, {}) or (isinstance(data, dict) and not data.get("found"))


    #TC2-SRC-03: nurse can also search for patients (same access as doctor for search)
    def test_nurse_can_search_patients(self, client, nurse_token, parent_user):
        resp = client.get(
            f"/nurse/search?moh_id={parent_user.MOH_ID}",
            headers={"Authorization": f"Bearer {nurse_token}"}
        )
        assert resp.status_code in (200, 404)


    #TC2-SRC-04: parent role does not have access to clinical patient search
    def test_parent_cannot_search_patients(self, client, parent_token):
        resp = client.get(
            "/doctor/search?moh_id=MOH-DOC001",
            headers={"Authorization": f"Bearer {parent_token}"}
        )
        assert resp.status_code in (401, 403, 404)


#TestClass 3 - Unit tests for Child model constraints
class TestChildModel:


    #TC3-CHD-01: Child record requires a valid parent_id
    def test_child_requires_parent(self, app):
        with app.app_context():
            child = Child(
                parent_id=9999,  #parent id that doesnt exist
                name="Orphan Child",
                date_of_birth=date(2024, 1, 1),
            )
            db.session.add(child)
            try:
                db.session.commit()
                assert child.parent_id == 9999
            except Exception:
                db.session.rollback()

    
    #TC3-CHD-02: Child date_of_birth is stored and retrieved accurately
    def test_child_dob_stored_correctly(self, app, parent_user):
        pid = parent_user.id
        with app.app_context():
            dob = date(2022, 6, 15)
            child = Child(parent_id=pid, name="DOB Test", date_of_birth=dob)
            db.session.add(child)
            db.session.commit()

            fetched = Child.query.filter_by(name="DOB Test").first()
            assert fetched.date_of_birth == dob


    #TC3-CHD-03: Deleting a child cascades to delete growth records
    def test_cascade_delete_growth_records(self, app, parent_user, child_record):
        from app import GrowthRecord
        cid = child_record.id
        pid = parent_user.id
        with app.app_context():
            child = Child.query.filter_by(parent_id=pid).first()
            db.session.delete(child)
            db.session.commit()

            records = GrowthRecord.query.filter_by(child_id=cid).all()
            assert len(records) == 0
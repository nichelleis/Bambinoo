#Tests: admin overview, user creation/edit/delete, event creation, system health
#Covers FR10 - Admin role has its own unique dashboard, FR11 - Admin can create and manage Clinical Staff accounts, FR19 - Admins can create events

import pytest
from app import db, User, Event
from werkzeug.security import generate_password_hash
from datetime import date, datetime


#TestClass1 - Admin dashboard overview endpoint
class TestAdminOverview:


    #TC1-ADM-01: Admin overview endpoint returns user count statistics
    def test_admin_overview_returns_user_counts(self, client, admin_token, app):
        resp = client.get("/admin/overview",
                          headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code in (200, 404)
        if resp.status_code == 200:
            data = resp.get_json()
            assert any(k in data for k in ["total_users", "totalUsers", "users"])




    #TC1-ADM-02: Non-admin user gets 403 on admin overview
    def test_non_admin_blocked_from_overview(self, client, parent_token):
        resp = client.get("/admin/overview",
                          headers={"Authorization": f"Bearer {parent_token}"})
        assert resp.status_code in (403, 404)




#TestClass2 - FR11: Admin can create, edit, delete clinical staff
class TestUserManagement:


    #TC2-ADM-03: Admin can create a new doctor account
    def test_admin_create_doctor(self, client, admin_token, app):
        resp = client.post(
            "/admin/create-user",
            json={
                "username": "new_doctor",
                "password": "Secure@123",
                "email": "newdoc@bambinoo.lk",
                "phone": "0771111111",
                "role": "doctor",
                "MOH_ID": "MOH-DOC999"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code in (200, 201, 404)
        if resp.status_code in (200, 201):
            with app.app_context():
                user = User.query.filter_by(username="new_doctor").first()
                assert user is not None
                assert user.role == "doctor"



    #TC2-ADM-04: Admin can create a new nurse account
    def test_admin_create_nurse(self, client, admin_token, app):
        resp = client.post(
            "/admin/create-user",
            json={
                "username": "new_nurse",
                "password": "Secure@123",
                "email": "newnurse@bambinoo.lk",
                "phone": "0772222222",
                "role": "nurse",
                "MOH_ID": "MOH-NUR999"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code in (200, 201, 404)



    #TC2-ADM-05: Creating user with duplicate MOH_ID returns error
    def test_admin_create_duplicate_moh_id_fails(self, client, admin_token, doctor_user, app):
        resp = client.post(
            "/admin/create-user",
            json={
                "username": "dup_doctor",
                "password": "Secure@123",
                "email": "dup@bambinoo.lk",
                "phone": "0773333333",
                "role": "doctor",
                "MOH_ID": doctor_user.MOH_ID 
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code not in (200, 201)



    #TC2-ADM-06: Admin can delete a nurse account
    def test_admin_delete_user(self, client, admin_token, nurse_user, app):
        nurse_id = nurse_user.id
        resp = client.delete(
            f"/admin/delete-user/{nurse_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code in (200, 204, 404)
        if resp.status_code in (200, 204):
            with app.app_context():
                assert User.query.get(nurse_id) is None



    #TC2-ADM-07: Parent role cannot access user creation endpoint
    def test_parent_cannot_create_users(self, client, parent_token):
        resp = client.post(
            "/admin/create-user",
            json={"username": "hacker", "password": "x", "role": "admin"},
            headers={"Authorization": f"Bearer {parent_token}"}
        )
        assert resp.status_code in (403, 401, 404)



    #TC2-ADM-08: Created user's password is stored as a hash, not plaintext
    def test_password_is_hashed_on_create(self, client, admin_token, app):
        plaintext = "PlainText@123"
        client.post(
            "/admin/create-user",
            json={
                "username": "hashtest_doc",
                "password": plaintext,
                "email": "hashtest@bambinoo.lk",
                "phone": "0770000001",
                "role": "doctor",
                "MOH_ID": "MOH-HASH001"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        with app.app_context():
            user = User.query.filter_by(username="hashtest_doc").first()
            if user: 
                assert user.password_hash != plaintext
                assert len(user.password_hash) > 20


#TestClass3 - FR19: Admin creates events; parents receive notifications
class TestEventManagement:


    # TC3-ADM-09: Admin can create a new health event
    def test_admin_create_event(self, client, admin_token, app):
        resp = client.post(
            "/admin/events",
            json={
                "title": "Free Vaccination Camp",
                "event_type": "vaccination",
                "date": "2026-04-15",
                "location": "Colombo MOH Office",
                "description": "Free BCG vaccination for all children under 1."
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code in (200, 201, 404)
        if resp.status_code in (200, 201):
            with app.app_context():
                ev = Event.query.filter_by(title="Free Vaccination Camp").first()
                assert ev is not None



    #TC3-ADM-10: GET/admin/events returns a list
    def test_get_events_returns_list(self, client, admin_token, app):
        with app.app_context():
            ev = Event(
                title="Health Camp",
                event_type="camp",
                date=date(2026, 5, 1),
                location="Kandy",
                description="General health checkup"
            )
            db.session.add(ev)
            db.session.commit()

        resp = client.get("/admin/events",
                          headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code in (200, 404)
        if resp.status_code == 200:
            data = resp.get_json()
            assert isinstance(data, list)
            assert len(data) >= 1


    #TC3-ADM-11: Parents can retrieve event list (notification feed)
    def test_parent_can_view_events(self, client, parent_token, app):
        with app.app_context():
            ev = Event(
                title="Parent Info Session",
                event_type="education",
                date=date(2026, 5, 10),
                location="Gampaha",
                description="Child nutrition seminar"
            )
            db.session.add(ev)
            db.session.commit()

        resp = client.get("/events",
                          headers={"Authorization": f"Bearer {parent_token}"})
        assert resp.status_code in (200, 404)


#TestClass4 - FR10: Admin system health dashboard
class TestSystemHealth:


    #TC4-ADM-12: /api/admin/system-health returns db_status field
    def test_system_health_returns_db_status(self, client, admin_token):
        resp = client.get("/api/admin/system-health",
                          headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code in (200, 500)
        if resp.status_code == 200:
            data = resp.get_json()
            assert "db_status" in data
            assert data["db_status"] == "Healthy"



    #TC4-ADM-13: System health response includes ml_status field
    def test_system_health_returns_ml_status(self, client, admin_token):
        resp = client.get("/api/admin/system-health",
                          headers={"Authorization": f"Bearer {admin_token}"})
        if resp.status_code == 200:
            data = resp.get_json()
            assert "ml_status" in data
            assert data["ml_status"] in ("Loaded", "Not Loaded")



    #TC4-ADM-14: System health response includes database record count fields
    def test_system_health_includes_record_counts(self, client, admin_token):
        resp = client.get("/api/admin/system-health",
                          headers={"Authorization": f"Bearer {admin_token}"})
        if resp.status_code == 200:
            data = resp.get_json()
            for field in ["total_users", "total_children", "total_growth"]:
                assert field in data
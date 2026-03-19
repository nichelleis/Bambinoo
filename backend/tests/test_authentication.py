#Tests: login, token verification, password reset flow, role-based access
#covers FR1 - User login and authentication


import pytest
from app import app as flask_app, db, User
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token
from app import PasswordResetId
from datetime import datetime, timedelta





# TestClass 1 - Checks if a valid login returns a token and sets the correct role
class TestLogin:

    #TC1-AUTH-01: Correct credentials return 200 + JWT token
    def test_valid_login_returns_token(self, client, parent_user, app):
        resp = client.post("/login", json={
            "username": "parent_one",
            "password": "Password@123"
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert "token" in data
        assert data["user"]["role"] == "parent"


    #TC1-AUTH-02: Doctor login returns role=doctor
    def test_valid_doctor_login(self, client, doctor_user):
    
        resp = client.post("/login", json={
            "username": "doctor_one",
            "password": "Password@123"
        })
        assert resp.status_code == 200
        assert resp.get_json()["user"]["role"] == "doctor"


    #TC1-AUTH-02: Admin login returns role=admin."""
    def test_valid_admin_login(self, client, admin_user):
        resp = client.post("/login", json={
            "username": "admin_user",
            "password": "Password@123"
        })
        assert resp.status_code == 200
        assert resp.get_json()["user"]["role"] == "admin"


    #TC1-AUTH-04: Wrong password returns 401 Unauthorized
    def test_wrong_password_returns_401(self, client, parent_user):
        resp = client.post("/login", json={
            "username": "parent_one",
            "password": "WrongPassword!"
        })
        assert resp.status_code == 401
        assert "Invalid" in resp.get_json()["message"]


    #TC1-AUTH-05: Non-existent username returns 401.
    def test_nonexistent_user_returns_401(self, client, app):
        resp = client.post("/login", json={
            "username": "ghost_user",
            "password": "Password@123"
        })
        assert resp.status_code == 401


    #TC1-AUTH-06: Missing username returns 401
    def test_missing_username_returns_401(self, client, app):
        resp = client.post("/login", json={"password": "Password@123"})
        assert resp.status_code == 401

    
    #TC1-AUTH-07: Empty body handled gracefully
    def test_empty_body_returns_error(self, client, app):
        resp = client.post("/login", json={})
        assert resp.status_code in (401, 400, 500)



# TestClass2 - checking JTW token verification
class TestTokenVerification:

    #TC2-AUTH-08: Valid JWT returns user data with valid=True
    def test_valid_token_returns_user_info(self, client, parent_user, parent_token):
        resp = client.get("/verify-token",
                          headers={"Authorization": f"Bearer {parent_token}"})
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["valid"] is True
        assert data["user"]["username"] == "parent_one"


    # TC2-AUTH-09: Missing JWT header returns 401/422
    def test_no_token_returns_401(self, client, app):
        resp = client.get("/verify-token")
        assert resp.status_code in (401, 422)


    #TC2-AUTH-10: Tampered JWT returns 401/422.""
    def test_invalid_token_returns_401(self, client, app):
        resp = client.get("/verify-token",
                          headers={"Authorization": "Bearer totally.invalid.jwt"})
        assert resp.status_code in (401, 422)


#TestClass3 - checking role based access autherizations
class TestRoleEnforcement:


    #TC3-AUTH-11: Parent JWT rejected on admin-only endpoint
    def test_parent_cannot_access_admin_endpoint(self, client, parent_token):
        resp = client.get("/api/admin/system-health",
                          headers={"Authorization": f"Bearer {parent_token}"})
        assert resp.status_code == 403


    #TC3-AUTH-12: Admin JWT accepted on admin-only endpoint
    def test_admin_can_access_system_health(self, client, admin_token):
        resp = client.get("/api/admin/system-health",
                          headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code in (200, 500)


    #TC3-AUTH-13: Doctor token accepted on clinical endpoints
    def test_doctor_token_on_doctor_endpoint(self, client, doctor_token):
        resp = client.get("/doctor/children",
                          headers={"Authorization": f"Bearer {doctor_token}"})
        assert resp.status_code not in (401, 403)



#Testclass4 - Password rest token logic
class TestPasswordResetTokenUnit:


    #TC4-AUTH-14: PasswordResetId.is_expired() returns True after 10 min
    def test_expired_token_detection(self, app):
        
        with app.app_context():
            from app import User, db
            u = User.query.first()
            if not u:
                from werkzeug.security import generate_password_hash
                u = User(username="tmp", password_hash=generate_password_hash("x"),
                         email="tmp@t.lk", role="parent", MOH_ID="MOH-TMP99")
                db.session.add(u)
                db.session.commit()
            tok = PasswordResetId(user_id=u.id)
            tok.created_at = datetime.utcnow() - timedelta(minutes=11)
            db.session.add(tok)
            db.session.commit()
            assert tok.is_expired() is True


    #TC4-AUTH-15: PasswordResetId.is_expired() returns False for new token
    def test_fresh_token_not_expired(self, app):
        with app.app_context():
            u = User(username="tmp2", password_hash=generate_password_hash("x"),
                     email="tmp2@t.lk", role="parent", MOH_ID="MOH-TMP98")
            db.session.add(u)
            db.session.commit()
            tok = PasswordResetId(user_id=u.id)
            tok.created_at = datetime.utcnow()
            db.session.add(tok)
            db.session.commit()
            assert tok.is_expired() is False


    #TC4-AUTH-16: POST to /reset-password/<bad_id> returns 400
    def test_reset_with_invalid_id_returns_400(self, client, app):
        resp = client.post("/reset-password/nonexistent-uuid-1234",
                           json={"password": "NewPass@123"})
        assert resp.status_code == 400
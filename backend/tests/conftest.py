#main file that shares pytest fixtures to all other test modules

import os
import sys
import pytest
from dataclasses import dataclass


#setting up the env variables
os.environ["DATABASE_URL"] = "sqlite:///:memory:"  
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-bambinoo")
os.environ.setdefault("FLASK_SECRET_KEY", "test-flask-secret")
os.environ.setdefault("JWT_ACCESS_TOKEN_EXPIRES_HOURS", "2")
os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")
os.environ.setdefault("MAIL_SERVER", "smtp.gmail.com")
os.environ.setdefault("MAIL_PORT", "587")
os.environ.setdefault("MAIL_USE_TLS", "True")
os.environ.setdefault("MAIL_USERNAME", "test@test.com")
os.environ.setdefault("MAIL_PASSWORD", "testpass")
os.environ.setdefault("MAIL_DEFAULT_SENDER", "test@test.com")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))   #made app.py importable

from app import app as flask_app, db, User, Child, GrowthRecord
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token

@dataclass
class UserInfo:
    id: int
    username: str
    email: str
    role: str
    MOH_ID: str

@dataclass
class ChildInfo:
    id: int
    parent_id: int
    name: str


# fixture that creates a new flask app and database for each test
@pytest.fixture(scope="function")
def app():
    flask_app.config.update({
        "TESTING": True,
        "WTF_CSRF_ENABLED": False,
    })
    with flask_app.app_context():
        db.create_all()
        yield flask_app
        db.session.remove()
        db.drop_all()


# creates a flask HTTP testing client
@pytest.fixture(scope="function")
def client(app):
    
    return app.test_client()


# creates new user in the test database
def _make_user(app, role, username, email, moh_id=None) -> UserInfo:
    with app.app_context():
        u = User(
            username=username,
            password_hash=generate_password_hash("Password@123"),
            email=email,
            phone="0771234567",
            role=role,
            MOH_ID=moh_id or f"MOH-{username.upper()}",
        )
        db.session.add(u)
        db.session.commit()
        return UserInfo(id=u.id, username=u.username, email=u.email,
                        role=u.role, MOH_ID=u.MOH_ID)


#create a predefined admin user for testing
@pytest.fixture
def admin_user(app) -> UserInfo:
    return _make_user(app, "admin", "admin_user", "admin@bambinoo.lk", "MOH-ADM001")


#create a predefined doctor user for testing
@pytest.fixture
def doctor_user(app) -> UserInfo:
    return _make_user(app, "doctor", "doctor_one", "doctor@bambinoo.lk", "MOH-DOC001")


#create a predefined nurse user for testing
@pytest.fixture
def nurse_user(app) -> UserInfo:
    return _make_user(app, "nurse", "nurse_one", "nurse@bambinoo.lk", "MOH-NUR001")


#create a predefined parent user for testing
@pytest.fixture
def parent_user(app) -> UserInfo:
    return _make_user(app, "parent", "parent_one", "parent@bambinoo.lk", "MOH-PAR001")


# created a child linked to a parent with 3 growth records
@pytest.fixture
def child_record(app, parent_user: UserInfo) -> ChildInfo:
    with app.app_context():
        from datetime import datetime, timedelta, date
        child = Child(
            parent_id=parent_user.id,
            name="Baby Test",
            date_of_birth=date(2023, 1, 1),
            gender="Male",
        )
        db.session.add(child)
        db.session.flush()

        for i, (w, h) in enumerate([(3.5, 50.0), (4.2, 52.5), (5.0, 55.0)]):
            gr = GrowthRecord(
                child_id=child.id,
                record_date=datetime.utcnow() - timedelta(days=30 * (3 - i)),
                weight=w,
                height=h,
                age_at_record=i + 1,
            )
            db.session.add(gr)
        db.session.commit()
        return ChildInfo(id=child.id, parent_id=child.parent_id, name=child.name)


#Creates a JWT access token for user authentication
def _token(app, user_id: int) -> str:
    with app.app_context():
        return create_access_token(identity=str(user_id))


# generates auth tokens for admin user.
@pytest.fixture
def admin_token(app, admin_user: UserInfo) -> str:
    return _token(app, admin_user.id)


# generates auth tokens for doctor user.
@pytest.fixture
def doctor_token(app, doctor_user: UserInfo) -> str:
    return _token(app, doctor_user.id)


# generates auth tokens for nurse user.
@pytest.fixture
def nurse_token(app, nurse_user: UserInfo) -> str:
    return _token(app, nurse_user.id)


# generates auth tokens for parent user.
@pytest.fixture
def parent_token(app, parent_user: UserInfo) -> str:
    return _token(app, parent_user.id)
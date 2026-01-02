from app import app, db
from app import (User, Child, GrowthRecord, HealthNote, HealthRecord, Appointment, Milestone, Vaccination)



with app.app_context():
    db.drop_all()
    db.create_all()

    admin = User(
        username="admin",
        email="admin@test.com",
        password_hash="admin123",
        role="admin"
    )

    doctor = User(
        username="doctor",
        email="doctor@test.com",
        password_hash="doctor123",
        role="doctor"
    )

    nurse = User(
        username="nurse",
        email="nurse@test.com",
        password_hash="nurse123",
        role="nurse"
    )

    parent_male = User(
        username="parent_male",
        email="father@test.com",
        password_hash="parent123",
        role="parent"
    )

    parent_female = User(
        username="parent_female",
        email="mother@test.com",
        password_hash="parent123",
        role="parent"
    )

    db.session.add_all([admin, doctor, nurse, parent_male, parent_female])
    db.session.commit()  


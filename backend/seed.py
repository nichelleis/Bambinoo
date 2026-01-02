from app import app, db
from app import (User, Child, GrowthRecord, HealthNote, HealthRecord, Appointment, Milestone, Vaccination)
from datetime import datetime, date, timedelta


with app.app_context():
    db.drop_all()
    db.create_all()

    admin = User(username="admin", email="admin@test.com", password_hash="admin123", role="admin")

    doctor = User(username="doctor", email="doctor@test.com", password_hash="doctor123", role="doctor")

    nurse = User(username="nurse", email="nurse@test.com", password_hash="nurse123", role="nurse")

    parent_male = User(username="parent_male", email="father@test.com", password_hash="parent123", role="parent")

    parent_female = User(username="parent_female", email="mother@test.com", password_hash="parent123", role="parent")

    db.session.add_all([admin, doctor, nurse, parent_male, parent_female])
    db.session.commit()  


    boy = Child(parent_id=parent_male.id, name="Noah Fernando", date_of_birth=date(2024, 1, 10), gender="Male")    

    girl = Child(parent_id=parent_female.id, name="Emma Silva", date_of_birth=date(2024, 6, 15), gender="Female")

    db.session.add_all([boy, girl])
    db.session.commit()

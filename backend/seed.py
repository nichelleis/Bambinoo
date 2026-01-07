from app import app, db
from app import (User, Child, GrowthRecord, HealthNote, HealthRecord, Appointment, Milestone, Vaccination)
from datetime import datetime, date, timedelta
from werkzeug.security import generate_password_hash

with app.app_context():
    db.drop_all()
    db.create_all()

    admin = User(username="admin", email="admin@test.com", password_hash=generate_password_hash("admin123"), role="admin")
    doctor = User(username="doctor", email="doctor@test.com", password_hash=generate_password_hash("doctor123"), role="doctor")
    nurse = User(username="nurse", email="nurse@test.com", password_hash=generate_password_hash("nurse123"), role="nurse")
    parent_male = User(username="parent_male", email="father@test.com", password_hash=generate_password_hash("parent123"), role="parent")
    parent_female = User(username="parent_female", email="mother@test.com", password_hash=generate_password_hash("parent123"), role="parent")

    db.session.add_all([admin, doctor, nurse, parent_male, parent_female])
    db.session.commit()  


    boy = Child(parent_id=parent_male.id, name="Noah Fernando", date_of_birth=date(2024, 1, 10), gender="Male")    
    girl = Child(parent_id=parent_female.id, name="Emma Silva", date_of_birth=date(2024, 6, 15), gender="Female")

    db.session.add_all([boy, girl])
    db.session.commit()

    db.session.add_all([
    GrowthRecord(
        child_id=boy.id,
        weight=6.5,
        height=62,
        head_circumference=41,
        bmi=16,
        age_at_record=90,
        notes="Normal",
        record_date=boy.date_of_birth + timedelta(days=90)
    ),
    GrowthRecord(
        child_id=boy.id,
        weight=7.8,
        height=68,
        head_circumference=43,
        bmi=16.8,
        age_at_record=180,
        notes="Healthy",
        record_date=boy.date_of_birth + timedelta(days=180)
    ),

    GrowthRecord(
        child_id=girl.id,
        weight=8.2,
        height=70,
        head_circumference=44,
        bmi=16.5,
        age_at_record=240,
        notes="Normal",
        record_date=girl.date_of_birth + timedelta(days=240) 
    ),
    GrowthRecord(
        child_id=girl.id,
        weight=9.5,
        height=75,
        head_circumference=46,
        bmi=17,
        age_at_record=360,
        notes="Good growth",
        record_date=girl.date_of_birth + timedelta(days=300)
    ),
    GrowthRecord(
        child_id=girl.id,
        weight=10.5,
        height=80,
        head_circumference=48,
        bmi=17,
        age_at_record=360,
        notes="Good growth",
        record_date=girl.date_of_birth + timedelta(days=330) 
    ),
    GrowthRecord(
        child_id=girl.id,
        weight=11.9,
        height=50,
        head_circumference=49,
        bmi=17.3,
        age_at_record=360,
        notes="Good growth",
        record_date=girl.date_of_birth + timedelta(days=360)
    ),
    GrowthRecord(
        child_id=girl.id,
        weight=13.0,
        height=105,
        head_circumference=49.5,
        bmi=17.8,
        age_at_record=360,
        notes="Good growth",
        record_date=girl.date_of_birth + timedelta(days=390) 
    ),
    GrowthRecord(
        child_id=girl.id,
        weight=15.5,
        height=110,
        head_circumference=50,
        bmi=18.3,
        age_at_record=360,
        notes="Good growth",
        record_date=girl.date_of_birth + timedelta(days=420)
    ),
])


    db.session.add_all([
        HealthNote(child_id=boy.id, record_type="Fever", title="Mild fever", temperature=37.8, severity="Mild"),
        HealthNote(child_id=boy.id, record_type="Cold", title="Runny nose", severity="Mild"),
        HealthNote(child_id=girl.id, record_type="Vaccination reaction", title="Slight swelling", severity="Mild"),
        HealthNote(child_id=girl.id, record_type="Checkup note", title="All normal"),
    ])

    db.session.add_all([
        HealthRecord(
            child_id=boy.id,
            record_type="Doctor Visit",
            title="Routine check",
            doctor_name="Dr. Sarah Mitchell",
            diagnosis="Healthy",
            treatment="None"
        ),
        HealthRecord(
            child_id=girl.id,
            record_type="Doctor Visit",
            title="Cold symptoms",
            doctor_name="Dr. Sarah Mitchell",
            diagnosis="Viral cold",
            treatment="Rest and fluids"
        ),
    ])

    db.session.add_all([
        Appointment(child_id=boy.id, appointment_type="Checkup", appointment_date=datetime(2024, 5, 10), doctor_name="Dr. Sarah Mitchell", status="completed"),
        Appointment(child_id=boy.id, appointment_type="Vaccination", appointment_date=datetime(2026, 7, 5), doctor_name="Dr. Sarah Mitchell", status="scheduled"),
        Appointment(child_id=girl.id, appointment_type="Checkup", appointment_date=datetime(2024, 4, 20), doctor_name="Dr. Sarah Mitchell", status="completed"),
        Appointment(child_id=girl.id, appointment_type="Vaccination", appointment_date=datetime(2026, 6, 18), doctor_name="Dr. Sarah Mitchell", status="scheduled"),
    ])

    db.session.add_all([
        Milestone(child_id=boy.id, milestone_id=1, category="Language",
                  description="Startles blinks or widens eyes at a sudden loud noise",
                  min_age=0, max_age=1, achieved_date=date(2023, 2, 1)),

        Milestone(child_id=boy.id, milestone_id=14, category="Physical",
                  description="Holds head up when on tummy",
                  min_age=1, max_age=2, achieved_date=date(2023, 3, 5)),

        Milestone(child_id=boy.id, milestone_id=33, category="Social",
                  description="Laughs",
                  min_age=4, max_age=6, achieved_date=date(2023, 7, 1)),

        Milestone(child_id=girl.id, milestone_id=63, category="Language",
                  description="Waves bye bye",
                  min_age=10, max_age=12, achieved_date=date(2023, 6, 20)),

        Milestone(child_id=girl.id, milestone_id=71, category="Physical",
                  description="Notices when others are hurt or upset",
                  min_age=11, max_age=12, achieved_date=date(2023, 7, 10)),


        Milestone(child_id=girl.id, milestone_id=101, category="Social",
                  description="Notices when others are hurt or upset",
                  min_age=18, max_age=24, achieved_date=date(2023, 12, 1)),

        Milestone(child_id=girl.id, milestone_id=104, category="Language",
                  description="Says at least two words together like More milk",
                  min_age=18, max_age=24, achieved_date=date(2023, 12, 1)),

        Milestone(child_id=girl.id, milestone_id=111, category="Physical",
                  description="Runs",
                  min_age=18, max_age=24, achieved_date=date(2023, 12, 1)),

        Milestone(child_id=girl.id, milestone_id=109, category="Cognitive",
                  description="Plays with more than one toy at a time",
                  min_age=18, max_age=24, achieved_date=date(2023, 12, 1)),

       
    ])

    db.session.add_all([
        Vaccination(
            child_id=boy.id,
            vaccine_name="BCG",
            dose_number="1st dose",
            due_date=date(2023, 1, 20),
            administered_date=date(2023, 1, 22),
            status="completed",
            administered_by="Dr. Sarah Mitchell",
            location="City Clinic"
        ),
        Vaccination(
            child_id=boy.id,
            vaccine_name="Pentavalent (DTP-HepB-Hib)",
            dose_number="1st dose",
            administered_date=date(2023, 3, 12),
            status="completed",
            administered_by="Dr. Sarah Mitchell",
            location="City Clinic"
        ),
        Vaccination(
            child_id=girl.id,
            vaccine_name="BCG",
            dose_number="1st dose",
            administered_date=date(2023, 3, 18),
            status="completed",
            administered_by="Dr. Sarah Mitchell",
            location="City Clinic"
        ),
        Vaccination(
            child_id=girl.id,
            vaccine_name="OPV",
            dose_number="1st dose",
            administered_date=date(2023, 12, 18),
            status="completed",
            administered_by="Dr. Sarah Mitchell",
            location="City Clinic"
        ),
        Vaccination(
            child_id=girl.id,
            vaccine_name="Pentavalent (DTP-HepB-Hib)",
            dose_number="1st dose",
            administered_date=date(2023, 12, 18),
            status="completed",
            administered_by="Dr. Sarah Mitchell",
            location="City Clinic"
        ),
        Vaccination(
            child_id=girl.id,
            vaccine_name="fIPV",
            dose_number="1st dose",
            administered_date=date(2023, 12, 18),
            status="completed",
            administered_by="Dr. Sarah Mitchell",
            location="City Clinic"
        ),
        Vaccination(
            child_id=girl.id,
            vaccine_name="OPV",
            dose_number="2nd dose",
            administered_date=date(2023, 12, 18),
            status="completed",
            administered_by="Dr. Sarah Mitchell",
            location="City Clinic"
        ),
        Vaccination(
            child_id=girl.id,
            vaccine_name="Pentavalent (DTP-HepB-Hib)",
            dose_number="2nd dose",
            administered_date=date(2023, 12, 18),
            status="completed",
            administered_by="Dr. Sarah Mitchell",
            location="City Clinic"
        ),
        Vaccination(
            child_id=girl.id,
            vaccine_name="fIPV",
            dose_number="2nd dose",
            administered_date=date(2023, 12, 18),
            status="completed",
            administered_by="Dr. Sarah Mitchell",
            location="City Clinic"
        ),
        Vaccination(
            child_id=girl.id,
            vaccine_name="OPV",
            dose_number="3rd dose",
            administered_date=date(2023, 12, 18),
            status="completed",
            administered_by="Dr. Sarah Mitchell",
            location="City Clinic"
        ),
        Vaccination(
            child_id=girl.id,
            vaccine_name="Pentavalent (DTP-HepB-Hib)",
            dose_number="3rd dose",
            administered_date=date(2023, 12, 18),
            status="completed",
            administered_by="Dr. Sarah Mitchell",
            location="City Clinic"
        ),
        Vaccination(
            child_id=girl.id,
            vaccine_name="MMR",
            dose_number="1st dose",
            administered_date=date(2023, 12, 18),
            status="completed",
            administered_by="Dr. Sarah Mitchell",
            location="City Clinic"
        ),
        Vaccination(
            child_id=girl.id,
            vaccine_name="Live JE",
            dose_number="1st dose",
            administered_date=date(2023, 12, 18),
            status="completed",
            administered_by="Dr. Sarah Mitchell",
            location="City Clinic"
        ),
        Vaccination(
            child_id=girl.id,
            vaccine_name="OPV",
            dose_number="4th dose",
            administered_date=date(2023, 12, 18),
            status="completed",
            administered_by="Dr. Sarah Mitchell",
            location="City Clinic"
        ),
    ])

    db.session.commit()
    

    print("Dummy data Successfully added")

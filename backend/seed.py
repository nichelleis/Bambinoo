from app import app, db
from app import (User, Child, GrowthRecord, HealthNote, HealthRecord, Appointment, Milestone, Vaccination,Allergy, ActiveCondition, PendingRegistration,DoctorProfile, DoctorQualification,
                 DoctorExperience, DoctorCertification, DoctorLanguage,
                 DoctorExpertise, DoctorPublication, DoctorAvailability)
from datetime import datetime, date, timedelta, UTC
from werkzeug.security import generate_password_hash

with app.app_context():
    db.drop_all()
    db.create_all()

    admin = User(username="admin", email="admin@test.com", password_hash=generate_password_hash("admin123"), role="admin", MOH_ID="CHDR-admin-001")
    doctor = User(username="doctor", email="doctor@test.com", password_hash=generate_password_hash("doctor123"), role="doctor", MOH_ID="CHDR-doctor-001")
    nurse = User(username="nurse", email="nurse@test.com", password_hash=generate_password_hash("nurse123"), role="nurse", MOH_ID="CHDR-nurse-001")
    parent_male = User(username="parent_male", email="father@test.com", password_hash=generate_password_hash("parent123"), role="parent", MOH_ID="CHDR-2026-001")
    parent_female = User(username="parent_female", email="mother@test.com", password_hash=generate_password_hash("parent123"), role="parent", MOH_ID="CHDR-2026-002")

    db.session.add_all([admin, doctor, nurse, parent_male, parent_female])
    db.session.commit()  


    boy = Child(parent_id=parent_male.id, name="Noah Fernando", date_of_birth=date(2024, 1, 10), gender="Male" )    
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
            record_type="Doctor Note",
            title="Routine Check",
            doctor_name="Dr. Sarah Mitchell",
            diagnosis="Healthy",
            treatment="None required",
            notes="Child is in good health. Growth and development on track for age.",
            record_date=datetime(2024, 3, 10)
        ),
        HealthRecord(
            child_id=boy.id,
            record_type="Doctor Note",
            title="Follow-up Observation",
            doctor_name="Dr. Sarah Mitchell",
            diagnosis="Recovering – viral infection",
            treatment="Continue monitoring",
            notes="No fever for 3 days. Appetite returning to normal. Follow up if symptoms recur.",
            record_date=datetime(2024, 6, 15)
        ),
        HealthRecord(
            child_id=boy.id,
            record_type="Doctor Note",
            title="Weight Concern Flagged",
            doctor_name="Dr. Sarah Mitchell",
            diagnosis="Below-average weight for age",
            treatment="Nutritional supplements recommended",
            notes="Weight slightly below average. Recommended nutritional supplements and follow-up in 4 weeks.",
            record_date=datetime(2024, 9, 20)
        ),

        HealthRecord(
            child_id=girl.id,
            record_type="Doctor Note",
            title="Cold Symptoms",
            doctor_name="Dr. Sarah Mitchell",
            diagnosis="Viral cold",
            treatment="Rest and fluids",
            notes="Mild congestion and low-grade fever. No antibiotics needed. Monitor for 5 days.",
            record_date=datetime(2024, 4, 5)
        ),
        HealthRecord(
            child_id=girl.id,
            record_type="Doctor Note",
            title="Asthma Management Review",
            doctor_name="Dr. Sarah Mitchell",
            diagnosis="Asthma – well controlled",
            treatment="Continue current inhaler regimen",
            notes="No recent attacks. Peak flow readings normal. Reassess in 6 months.",
            record_date=datetime(2024, 8, 12)
        ),


        HealthRecord(
            child_id=boy.id,
            record_type="Prescription",
            title="Cetirizine - 5ml",
            doctor_name="Dr. Sarah Mitchell",
            medication_name="Cetirizine",
            medication_dosage="5ml",
            treatment="Once daily at bedtime",           
            notes="Long-term. For chronic allergy management. Review after 3 months.",
            record_date=datetime(2024, 6, 1)
        ),
        HealthRecord(
            child_id=boy.id,
            record_type="Prescription",
            title="Amoxicillin - 250mg",
            doctor_name="Dr. Sarah Mitchell",
            medication_name="Amoxicillin",
            medication_dosage="250mg",
            treatment="Twice daily for 7 days",
            notes="For ear infection. Complete full course even if symptoms improve.",
            record_date=datetime(2024, 11, 3)
        ),

        HealthRecord(
            child_id=girl.id,
            record_type="Prescription",
            title="Salbutamol - 2.5mg",
            doctor_name="Dr. Sarah Mitchell",
            medication_name="Salbutamol",
            medication_dosage="2.5mg",
            treatment="As needed via nebulizer",
            notes="Long-term. For asthma relief. Use during attacks only.",
            record_date=datetime(2024, 7, 22)
        ),
        HealthRecord(
            child_id=girl.id,
            record_type="Prescription",
            title="Paracetamol - 120mg",
            doctor_name="Dr. Sarah Mitchell",
            medication_name="Paracetamol",
            medication_dosage="120mg",
            treatment="Every 6 hours when needed",
            notes="For fever management. Do not exceed 4 doses in 24 hours.",
            record_date=datetime(2024, 10, 5)
        ),

    ])

    db.session.commit()
    print("Health records seeded successfully.")
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
    
    db.session.add_all([
        Allergy(child_id=boy.id, name="Peanuts"),
        Allergy(child_id=boy.id, name="Dust"),
        Allergy(child_id=girl.id, name="Dairy"),
        Allergy(child_id=girl.id, name="Shellfish"),
    ])

    
    db.session.add_all([
        ActiveCondition(child_id=boy.id, name="Eczema"),
        ActiveCondition(child_id=girl.id, name="Asthma"),
    ])

    db.session.add_all([
        PendingRegistration(
            username="noah_f",
            password_hash=generate_password_hash("Noah123!"),
            registration_number="CHDR-2026-001",
            child_name="Noah Fernando",
            child_dob=date(2024, 1, 10),
            nationality="Sri Lankan",
            child_number="C001",
            language="English",
            mother_name="Dilani Perera",
            mother_dob=date(1995, 5, 14),
            mother_email="dilani.perera@test.com",
            mother_phone="0771234567",
            birth_location="Colombo",
            birth_hospital="Castle Street Hospital for Women",
            delivery_type="Normal",
            surgery="No",
            birth_weight=3.1,
            birth_length=49.5,
            head_circumference=34.0,
            personnel_type="Doctor",
            personnel_name="Dr. Nimal Jayasinghe",
            living_address="123, Temple Road, Nugegoda",
            registration_date=date(2026, 1, 5),
            status="pending",
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        ),
        PendingRegistration(
            username="emma_s",
            password_hash=generate_password_hash("Emma123!"),
            registration_number="CHDR-2026-002",
            child_name="Emma Silva",
            child_dob=date(2024, 6, 15),
            nationality="Sri Lankan",
            child_number="C002",
            language="Sinhala",
            mother_name="Nadeesha Fernando",
            mother_dob=date(1993, 8, 2),
            mother_email="nadeesha.fernando@test.com",
            mother_phone="0719876543",
            birth_location="Kandy",
            birth_hospital="Teaching Hospital Kandy",
            delivery_type="C-Section",
            surgery="Yes",
            birth_weight=3.4,
            birth_length=50.2,
            head_circumference=34.6,
            personnel_type="Nurse",
            personnel_name="Nurse Malini Perera",
            living_address="45, Peradeniya Road, Kandy",
            registration_date=date(2026, 1, 10),
            status="pending",
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        ),
    ])
    sarah_profile = DoctorProfile(
        user_id          = doctor.id,
        first_name       = "Sarah",
        last_name        = "Mitchell",
        title            = "Dr.",
        gender           = "Female",
        dob              = "1985-03-22",
        phone            = "+94 77 456 7890",
        email            = "doctor@test.com",
        bio              = (
            "Dr. Sarah Mitchell is a dedicated Pediatrician with over 12 years of "
            "experience in child healthcare. She is committed to providing compassionate, "
            "evidence-based care and works closely with families to support the healthy "
            "development of every child from birth through adolescence."
        ),
        specialty        = "Pediatrician",
        sub_specialty    = "Neonatal Care",
        license_number   = "LIC-SM-2012",
        license_expiry   = "2027-03-31",
        slmc_number      = "SLMC-14872",
        years_experience = "12",
        current_hospital = "City Clinic",
        department       = "Pediatrics",
        consultation_fee = "3500",
        emergency_available = True,
        emergency_max       = "25",
        telehealth          = True,
    )
    db.session.add(sarah_profile)
    db.session.flush()   

    db.session.add_all([
        DoctorQualification(profile_id=sarah_profile.id, degree="MBBS",
                            institution="University of Colombo", year="2008", country="Sri Lanka"),
        DoctorQualification(profile_id=sarah_profile.id, degree="MD (Paediatrics)",
                            institution="Postgraduate Institute of Medicine", year="2012", country="Sri Lanka"),
        DoctorQualification(profile_id=sarah_profile.id, degree="Fellowship in Neonatal Care",
                            institution="Royal College of Paediatrics and Child Health", year="2015", country="UK"),
    ])


    db.session.add_all([
        DoctorExperience(profile_id=sarah_profile.id, role="Junior Medical Officer",
                        hospital="National Hospital of Sri Lanka", from_date="2008-07", to_date="2010-06", current=False),
        DoctorExperience(profile_id=sarah_profile.id, role="Registrar in Paediatrics",
                        hospital="Lady Ridgeway Hospital for Children", from_date="2010-07", to_date="2013-12", current=False),
        DoctorExperience(profile_id=sarah_profile.id, role="Consultant Paediatrician",
                        hospital="City Clinic", from_date="2014-01", to_date="", current=True),
    ])


    db.session.add_all([
        DoctorCertification(profile_id=sarah_profile.id,
                            name="Board Certified Paediatrician",
                            issuing_body="Sri Lanka College of Paediatricians",
                            issue_date="2013-06-01", expiry_date="2028-06-01"),
        DoctorCertification(profile_id=sarah_profile.id,
                            name="Advanced Paediatric Life Support (APLS)",
                            issuing_body="Advanced Life Support Group",
                            issue_date="2022-09-15", expiry_date="2026-09-15"),
    ])


    db.session.add_all([
        DoctorLanguage(profile_id=sarah_profile.id, language="English"),
        DoctorLanguage(profile_id=sarah_profile.id, language="Sinhala"),
        DoctorLanguage(profile_id=sarah_profile.id, language="Tamil"),
    ])


    db.session.add_all([
        DoctorExpertise(profile_id=sarah_profile.id, area="Neonatal Care"),
        DoctorExpertise(profile_id=sarah_profile.id, area="Child Growth & Nutrition"),
        DoctorExpertise(profile_id=sarah_profile.id, area="Vaccination & Immunisation"),
        DoctorExpertise(profile_id=sarah_profile.id, area="Paediatric Asthma Management"),
        DoctorExpertise(profile_id=sarah_profile.id, area="Developmental Milestone Assessment"),
    ])


    db.session.add_all([
        DoctorPublication(profile_id=sarah_profile.id,
                        title="Nutritional Outcomes in Low-Birth-Weight Infants in Sri Lanka",
                        journal="Ceylon Medical Journal", year="2016"),
        DoctorPublication(profile_id=sarah_profile.id,
                        title="Vaccination Coverage and Barriers in Rural Sri Lankan Communities",
                        journal="Asia Pacific Journal of Public Health", year="2019"),
    ])


    db.session.add_all([
        DoctorAvailability(profile_id=sarah_profile.id, day="Monday",    available=True,  from_time="08:00", to_time="16:00"),
        DoctorAvailability(profile_id=sarah_profile.id, day="Tuesday",   available=True,  from_time="08:00", to_time="16:00"),
        DoctorAvailability(profile_id=sarah_profile.id, day="Wednesday", available=True,  from_time="08:00", to_time="13:00"),
        DoctorAvailability(profile_id=sarah_profile.id, day="Thursday",  available=True,  from_time="08:00", to_time="16:00"),
        DoctorAvailability(profile_id=sarah_profile.id, day="Friday",    available=True,  from_time="08:00", to_time="16:00"),
        DoctorAvailability(profile_id=sarah_profile.id, day="Saturday",  available=True,  from_time="09:00", to_time="12:00"),
        DoctorAvailability(profile_id=sarah_profile.id, day="Sunday",    available=False, from_time="09:00", to_time="17:00"),
    ])

    db.session.commit()

    

    print("Dummy data Successfully added")

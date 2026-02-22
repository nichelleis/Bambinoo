import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta,datetime,date
import os
from flask_cors import CORS, cross_origin
from flask_jwt_extended import (JWTManager, create_access_token, jwt_required, get_jwt_identity)
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash
from dateutil.relativedelta import relativedelta
import csv
from collections import defaultdict
from dotenv import load_dotenv


load_dotenv()


app = Flask(__name__)
CORS( app, resources={r"/*": {"origins": os.getenv("FRONTEND_URL")}}, supports_credentials=True)


BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'bambinoo.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_HOURS", 2)))

app.secret_key = os.getenv("FLASK_SECRET_KEY")


db = SQLAlchemy(app)
jwt = JWTManager(app)


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))
    role = db.Column(db.String(50), nullable=False, default='parent')


class Child(db.Model):
    __tablename__ = 'child'
    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    blood = db.Column(db.String(5))

    
    growth_records = db.relationship('GrowthRecord', backref='child', lazy=True, cascade='all, delete-orphan')
    vaccinations = db.relationship('Vaccination', backref='child', lazy=True, cascade='all, delete-orphan')
    health_records = db.relationship('HealthRecord', backref='child', lazy=True, cascade='all, delete-orphan')
    milestones = db.relationship('Milestone', backref='child', lazy=True, cascade='all, delete-orphan')
    appointments = db.relationship('Appointment', backref='child', lazy=True, cascade='all, delete-orphan')
    health_notes = db.relationship('HealthNote', backref='child', lazy=True, cascade='all, delete-orphan')


class Appointment(db.Model):
    __tablename__ = 'appointment'
    id = db.Column(db.Integer, primary_key=True)
    child_id = db.Column(db.Integer, db.ForeignKey('child.id'), nullable=False)
    appointment_type = db.Column(db.String(50), nullable=False) 
    appointment_date = db.Column(db.DateTime, nullable=False)
    doctor_name = db.Column(db.String(100))
    status = db.Column(db.String(20), default='scheduled') 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)    


class GrowthRecord(db.Model):
    __tablename__ = 'growth_record'
    id = db.Column(db.Integer, primary_key=True)
    child_id = db.Column(db.Integer, db.ForeignKey('child.id'), nullable=False)
    record_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    weight = db.Column(db.Float)  
    height = db.Column(db.Float)  
    head_circumference = db.Column(db.Float)  
    bmi = db.Column(db.Float)  
    age_at_record = db.Column(db.Integer)  
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class HealthNote(db.Model):
    __tablename__ = 'health_note'
    id = db.Column(db.Integer, primary_key=True)
    child_id = db.Column(db.Integer, db.ForeignKey('child.id'), nullable=False)
    record_type = db.Column(db.String(50), nullable=False)  
    record_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    title = db.Column(db.String(200))  
    description = db.Column(db.Text)
    temperature = db.Column(db.Float)
    weight = db.Column(db.Float)  
    medication_name = db.Column(db.String(100))
    medication_dosage = db.Column(db.String(50))
    reason = db.Column(db.Text)
    symptom_type = db.Column(db.String(50))
    severity = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = db.Column(db.Text)

class HealthRecord(db.Model):
    __tablename__ = 'health_record'
    id = db.Column(db.Integer, primary_key=True)
    child_id = db.Column(db.Integer, db.ForeignKey('child.id'), nullable=False)
    record_type = db.Column(db.String(50), nullable=False) 
    record_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    title = db.Column(db.String(200))  
    description = db.Column(db.Text)
    temperature = db.Column(db.Float)
    weight = db.Column(db.Float) 
    medication_name = db.Column(db.String(100))
    medication_dosage = db.Column(db.String(50))
    doctor_name = db.Column(db.String(100))
    clinic_hospital = db.Column(db.String(200))
    diagnosis = db.Column(db.Text)
    treatment = db.Column(db.Text)
    follow_up_date = db.Column(db.Date)
    attachments = db.Column(db.Text) 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = db.Column(db.Text)

class Milestone(db.Model):
    __tablename__ = 'milestone'
    id = db.Column(db.Integer, primary_key=True)
    child_id = db.Column(db.Integer, db.ForeignKey('child.id'), nullable=False)
    milestone_id = db.Column(db.Integer, nullable=False)  
    category = db.Column(db.String(50), nullable=False)  
    description = db.Column(db.Text)
    min_age = db.Column(db.Integer)  
    max_age = db.Column(db.Integer)  
    achieved_date = db.Column(db.Date)

class Vaccination(db.Model):
    __tablename__ = 'vaccination'
    id = db.Column(db.Integer, primary_key=True)
    child_id = db.Column(db.Integer, db.ForeignKey('child.id'), nullable=False)
    vaccine_name = db.Column(db.String(100), nullable=False)  
    dose_number = db.Column(db.String(20))  
    due_date = db.Column(db.Date)
    administered_date = db.Column(db.Date)
    status = db.Column(db.String(20), default='scheduled') 
    administered_by = db.Column(db.String(100)) 
    location = db.Column(db.String(200))
    batch_number = db.Column(db.String(50))
    notes = db.Column(db.Text)
    
class PendingRegistration(db.Model):
    __tablename__ = 'pending_registration'

    id = db.Column(db.Integer, primary_key=True)

    registration_number = db.Column(db.String(100), unique=True, nullable=False)
    child_name = db.Column(db.String(255), nullable=False)
    child_dob = db.Column(db.Date, nullable=False)
    nationality = db.Column(db.String(100), nullable=False)
    child_number = db.Column(db.String(10), nullable=False)
    language = db.Column(db.String(50), nullable=False)
    mother_name = db.Column(db.String(255), nullable=False)
    mother_dob = db.Column(db.Date, nullable=False)
    mother_email = db.Column(db.String, nullable=False)
    mother_phone = db.Column(db.String, nullable=False)
    birth_location = db.Column(db.String(255), nullable=False)
    birth_hospital = db.Column(db.String(255), nullable=False)
    delivery_type = db.Column(db.String(100), nullable=False)
    surgery = db.Column(db.String(10), nullable=False)
    birth_weight = db.Column(db.Float, nullable=False)
    birth_length = db.Column(db.Float, nullable=False)
    head_circumference = db.Column(db.Float, nullable=False)
    personnel_type = db.Column(db.String(100), nullable=False)
    personnel_name = db.Column(db.String(255), nullable=False)
    living_address = db.Column(db.Text, nullable=False)
    registration_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='pending')

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


with app.app_context():
    db.create_all()

# Login route
@app.route('/login', methods=['POST'])
@cross_origin()
def login():
    try:
        data = request.get_json()

        username = data.get('username')   
        password = data.get('password')

        user = User.query.filter_by(username=username).first()

        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({"message": "Invalid username or password"}), 401

        token = create_access_token(identity=str(user.id))

        return jsonify({
            "token": token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "phone": user.phone,
                "role": user.role
            }
        }), 200

    except Exception as e:
        print("Login Error:", e)
        return jsonify({
            "error": str(e)
        }), 500
    
# JWT Verification route
@app.route('/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({"valid": False}), 401

        return jsonify({
            "valid": True,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "phone": user.phone,
                "role": user.role
            }
        }), 200

    except Exception as e:
        print("Verify token error:", e)
        return jsonify({
            "valid": False,
            "error": "Internal server error"
        }), 500


@app.route('/header', methods=["GET"])
@jwt_required()
def get_child():

    user_id = get_jwt_identity()

    child = Child.query.filter_by(parent_id=user_id).first()
    if not child:
            return jsonify({"message": "Child not found"}), 404    
    
    records = (GrowthRecord.query.filter_by(child_id = child.id).order_by(GrowthRecord.record_date.desc()).limit(2).all())


    current = records[0] if len(records) > 0 else None
    previous = records[1] if len(records) > 1 else None

    return jsonify({
        "id": child.id,
        "name": child.name,
        "date_of_birth": child.date_of_birth.isoformat(),
        "gender": child.gender,

        "blood": child.blood,

         "growth": {
            "weight": {
                "current": current.weight if current else None,
                "previous": previous.weight if previous else None
            },
            "height": {
                "current": current.height if current else None,
                "previous": previous.height if previous else None
            },
            "head": {
                "current": current.head_circumference if current else None,
                "previous": previous.head_circumference if previous else None
            }
        }
    })


@app.route('/growth-trend', methods=["GET"])
@jwt_required()
def growth_trend():

    user_id = get_jwt_identity()

    child = Child.query.filter_by(parent_id=user_id).first()
    if not child:
        return jsonify({"message": "Child not found"}), 404
    
    one_year_ago = datetime.utcnow() - timedelta(days=730)     #  change this to one year (365) its 730 just for testing

    records = GrowthRecord.query.filter(
        GrowthRecord.child_id == child.id,
        GrowthRecord.record_date >= one_year_ago
    ).order_by(GrowthRecord.record_date.asc()).all()

    trend = []
    for r in records:
        trend.append({
            "date": r.record_date.isoformat(),
            "weight": r.weight,
        })

    return jsonify({
        "child_id": child.id,
        "name": child.name,
        "trend": trend
    })





@app.route("/vaccines-status")
@jwt_required()
def vaccines_status():
    try:
        user_id = get_jwt_identity()
        child = Child.query.filter_by(parent_id=user_id).first()
        
        if not child:
            return jsonify([])

        if not child.date_of_birth:
            return jsonify({"error": "Child date_of_birth not set"}), 400

        today = datetime.today().date()
        dob = child.date_of_birth
        if isinstance(dob, datetime):
            dob = dob.date() 

        age_in_months = (today.year - dob.year) * 12 + (today.month - dob.month)

        completed = Vaccination.query.filter_by(child_id=child.id, status='completed').all()
        completed_set = set((v.vaccine_name, v.dose_number) for v in completed)

        vaccines_list = []

        csv_path = os.path.join(os.path.dirname(__file__), "vaccine_schedule.csv")
        if not os.path.exists(csv_path):
            return jsonify({"error": "vaccine_schedule.csv not found"}), 500

        with open(csv_path, newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                age_str = row.get('Age')
                if not age_str:
                    continue
                try:
                    if "weeks" in age_str:
                        scheduled_months = int(int(age_str.split()[0]) / 4)
                    elif "months" in age_str:
                        scheduled_months = int(age_str.split()[0])
                    elif "years" in age_str:
                        scheduled_months = int(age_str.split()[0]) * 12
                    else:
                        continue
                except Exception as ex:
                    print(f"Error parsing age '{age_str}':", ex)
                    continue

                if (row['Vaccine'], row['Dose']) in completed_set:
                    continue

                due_date = dob + relativedelta(months=scheduled_months)

                if scheduled_months < age_in_months:
                    status = "missed"
                elif age_in_months <= scheduled_months <= age_in_months + 26: ## change 26 to like 6 months this is just for testing
                    status = "upcoming"
                else:
                    continue

                vaccines_list.append({
                    "vaccine_name": row['Vaccine'],
                    "dose_number": row['Dose'],
                    "due_date": due_date.isoformat(),
                    "status": status
                })

        return jsonify(vaccines_list)

    except Exception as e:
        print("Vaccines Status Error:", e)
        return jsonify({"error": "Internal server error"}), 500



@app.route("/upcoming-appointments")
@jwt_required()
def upcoming_appointments():

    user_id = get_jwt_identity()
    child = Child.query.filter_by(parent_id=user_id).first()
   
    custom_date = datetime.today().date()
   
    appointments = Appointment.query.filter(
        Appointment.child_id == child.id,
        Appointment.appointment_date >= custom_date
    ).order_by(Appointment.appointment_date.asc()).all()
    return jsonify([
        {"id": a.id,
         "appointment_type": a.appointment_type,
         "doctor_name": a.doctor_name,
         "appointment_date": a.appointment_date.isoformat()
         }
        for a in appointments
    ])



@app.route('/add-appointment', methods=['POST'])
@jwt_required()
def add_appointment():
    try:
        data = request.get_json()
        
        if not data.get('appointment_type'):
            return jsonify({'error': 'Appointment type is required'}), 400
        
        if not data.get('doctor_name'):
            return jsonify({'error': 'Doctor name is required'}), 400
        
        if not data.get('appointment_date'):
            return jsonify({'error': 'Appointment date is required'}), 400
        
        if len(data.get('appointment_type', '')) > 50:
            return jsonify({'error': 'Appointment type cannot exceed 30 characters'}), 400
        
        user_id = get_jwt_identity()
        child = Child.query.filter_by(parent_id=user_id).first()

        if not child:
            return jsonify({'error': 'Child not found'}), 404
        
        try:
            appointment_datetime = datetime.fromisoformat(data['appointment_date'])
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
        
        new_appointment = Appointment(
            child_id=child.id,
            appointment_type=data['appointment_type'].strip(),
            appointment_date=appointment_datetime,
            doctor_name=data['doctor_name'].strip(),
            status='scheduled',
  
        )
        
        db.session.add(new_appointment)
        db.session.commit()
        
        return jsonify({
            'id': new_appointment.id,
            'appointment_type': new_appointment.appointment_type,
            'appointment_date': new_appointment.appointment_date.isoformat(),
            'doctor_name': new_appointment.doctor_name,
            'status': new_appointment.status,
            'message': 'Appointment added successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error adding appointment: {str(e)}")
        return jsonify({'error': 'Failed to add appointment'}), 500


@app.route('/update-appointment/<int:appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment(appointment_id):
    try:
        data = request.get_json()

        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return jsonify({'error': 'Appointment not found'}), 404

        # Validate required fields
        if not data.get('appointment_type'):
            return jsonify({'error': 'Appointment type is required'}), 400

        if not data.get('doctor_name'):
            return jsonify({'error': 'Doctor name is required'}), 400

        if not data.get('appointment_date'):
            return jsonify({'error': 'Appointment date is required'}), 400

        if len(data.get('appointment_type', '')) > 50:
            return jsonify({'error': 'Appointment type too long'}), 400

        try:
            appointment_datetime = datetime.fromisoformat(data['appointment_date'])
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400

        # Update fields
        appointment.appointment_type = data['appointment_type'].strip()
        appointment.doctor_name = data['doctor_name'].strip()
        appointment.appointment_date = appointment_datetime
        appointment.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            'id': appointment.id,
            'appointment_type': appointment.appointment_type,
            'doctor_name': appointment.doctor_name,
            'appointment_date': appointment.appointment_date.isoformat(),
            'status': appointment.status,
            'message': 'Appointment updated successfully'
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error updating appointment: {e}")
        return jsonify({'error': 'Failed to update appointment'}), 500



@app.route('/delete-appointment/<int:appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    try:
        appointment = Appointment.query.get(appointment_id)

        if not appointment:
            return jsonify({'error': 'Appointment not found'}), 404

        db.session.delete(appointment)
        db.session.commit()

        return jsonify({
            'message': 'Appointment deleted successfully',
            'id': appointment_id
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error deleting appointment: {e}")
        return jsonify({'error': 'Failed to delete appointment'}), 500



@app.route('/milestone-status')
@jwt_required()
def milestones_status():

    user_id = get_jwt_identity()
    child = Child.query.filter_by(parent_id=user_id).first()
    if not child:
        return jsonify([])
    
    today = date.today()
    age_months = (today.year - child.date_of_birth.year) * 12 + (today.month - child.date_of_birth.month)

    categories = defaultdict(lambda: {
        "total": 0,
        "completed": 0,
        "milestones": []
    })

    try:
        csv_path = os.path.join(BASE_DIR, "final_milestones.csv")

        with open(csv_path, newline='', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)

            for row in reader:
                min_age = int(row['min_age'])
                max_age = int(row['max_age'])

                if min_age <= age_months <= max_age:
                    category = row['Category']

                    categories[category]["total"] += 1
                    categories[category]["milestones"].append(
                        row['MilestoneDescription']
                    )

        completed_milestones = Milestone.query.filter(Milestone.child_id == child.id, Milestone.min_age <= age_months, Milestone.max_age >= age_months, ).all()

        for m in completed_milestones:
            categories[m.category]["completed"] += 1

        response = []
        for category, data in categories.items():
            percentage = (
                int((data["completed"] / data["total"]) * 100)
                if data["total"] > 0 else 0
            )

            response.append({
                "category": category,
                "total": data["total"],
                "completed": data["completed"],
                "percentage": percentage,
                "description": data["milestones"][0] 
            })

        return jsonify(response)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route("/completed-vaccines")
@jwt_required()
def completed_vaccines():

    user_id = get_jwt_identity()
    child = Child.query.filter_by(parent_id=user_id).first()
    if not child:
        return jsonify([])

    vaccines = (
        Vaccination.query
        .filter_by(child_id=child.id, status="completed")
        .order_by(Vaccination.administered_date.desc())
        .all()
    )

    return jsonify([
        {
            "vaccine_name": v.vaccine_name,
            "dose_number": v.dose_number,
            "administered_date": v.administered_date.isoformat()
        }
        for v in vaccines
    ])


@app.route("/total-vaccines-count")
def total_vaccines_count():
    count = 0

    csv_path = os.path.join(BASE_DIR, "vaccine_schedule.csv")

    with open(csv_path, newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for _ in reader:
            count += 1

    return jsonify({ "total": count })

@app.route("/pending_registration", methods=["POST"])
def pending_registration():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "No data provided"}), 400
        
        password_hash=generate_password_hash(data["password"])

        new_user = User(
            username=data["username"],
            password_hash=password_hash,
            email=data["motherEmail"],
            phone=data["motherPhone"],
            role="parent"
        )

        db.session.add(new_user)
        db.session.flush()

        child_dob = datetime.strptime(data["childDOB"], "%Y-%m-%d").date()
        mother_dob = datetime.strptime(data["motherDOB"], "%Y-%m-%d").date()
        registration_date = datetime.strptime(data["registrationDate"], "%Y-%m-%d").date()
        birth_weight = float(data["birthWeight"])
        birth_length = float(data["birthLength"])
        head_circumference = float(data["headCircumference"])

        pending_registration = PendingRegistration(
            registration_number=data["registrationNumber"],
            child_name=data["childName"],
            child_dob=child_dob,
            nationality=data["nationality"],
            child_number=data["childNumber"],
            language=data["language"],
            mother_name=data["motherName"],
            mother_dob=mother_dob,
            mother_email=data["motherEmail"],
            mother_phone=data["motherPhone"],
            birth_location=data["birthLocation"],
            birth_hospital=data["birthHospital"],
            delivery_type=data["deliveryType"],
            surgery=data["surgery"],
            birth_weight=birth_weight,
            birth_length=birth_length,
            head_circumference=head_circumference,
            personnel_type=data["personnelType"],
            personnel_name=data["personnelName"],
            living_address=data["livingAddress"],
            registration_date=registration_date,
            status=data.get("status", "PENDING")
        )

        # Add to session and commit
        db.session.add(pending_registration)
        db.session.commit()

        return jsonify({"message": "Registration submitted successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        print("Error saving registration:", e)
        return jsonify({"message": str(e)}), 500




@app.route("/age-groups", methods=["GET"])
def get_age_groups():
   
    age_groups = []
    seen = set()
    
    csv_path = os.path.join(BASE_DIR, "final_milestones.csv")

    with open(csv_path, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            group_id = int(row["AgeGroup"])
            if group_id not in seen:
                seen.add(group_id)
                age_groups.append({
                    "id": group_id,
                    "text": f"{row['min_age']}-{row['max_age']}"
                })

    age_groups.sort(key=lambda x: x["id"])
    
    age_groups = [{"id": "all", "text": "All"}] + age_groups

    return jsonify(age_groups)



@app.route("/milestones", methods=["GET"])
@jwt_required()
def get_milestones():
    user_id = get_jwt_identity()
    child = Child.query.filter_by(parent_id=user_id).first()
    if not child:
        return jsonify({})

    age_group = request.args.get("age_group", "all")

    completed_ids = {
        m.milestone_id
        for m in Milestone.query.filter_by(child_id=child.id).all()
    }

    grouped = defaultdict(list)

    csv_path = os.path.join(BASE_DIR, "final_milestones.csv")

    with open(csv_path, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            row_group = int(row["AgeGroup"])
            category = row["Category"]
            milestone_id = int(row["id"])


            if age_group != "all" and row_group != int(age_group):
                continue

            grouped[category].append({
                "id": milestone_id,
                "description": row["MilestoneDescription"],
                "min_age": int(row["min_age"]),
                "max_age": int(row["max_age"]),
                "age_group": row_group,
                "completed": milestone_id in completed_ids
            })

    return jsonify(grouped)




@app.route("/milestones/toggle", methods=["POST"])
@jwt_required()
def toggle_milestone():

    data = request.get_json()

    user_id = get_jwt_identity()
    child = Child.query.filter_by(parent_id=user_id).first()
    if not child:
        return jsonify({})

    milestone_id = data["milestone_id"]
    category = data["category"]

    existing = Milestone.query.filter_by(
        child_id=child.id,
        milestone_id=milestone_id
    ).first()

    if existing:
        db.session.delete(existing)
    else:
        min_age = max_age = None
        description = None


        csv_path = os.path.join(BASE_DIR, "final_milestones.csv")


        with open(csv_path, encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if int(row["id"]) == milestone_id:
                    min_age = int(row["min_age"])
                    max_age = int(row["max_age"])
                    description = row["MilestoneDescription"]
                    break

        db.session.add(Milestone(
            child_id=child.id,
            milestone_id=milestone_id,
            category=category,
            description=description,
            min_age=min_age,
            max_age=max_age,
            achieved_date=date.today()
        ))

    db.session.commit()
    return jsonify({"success": True})


@app.route("/analize", methods=["GET"])
@jwt_required()
def get_growth_records():
    try:
        user_id = get_jwt_identity()
        child = Child.query.filter_by(parent_id=user_id).first()
        if not child:
            return jsonify({"message": "Child not found"}), 404
        records = GrowthRecord.query.filter_by(child_id=child.id)\
            .order_by(GrowthRecord.record_date.asc()).all()
        today = date.today()
        age = today.year - child.date_of_birth.year - ((today.month, today.day) < (child.date_of_birth.month, child.date_of_birth.day))
        measurements = []
        for r in records:
            measurements.append({
                "date": r.record_date.strftime("%Y-%m"), # "2025-01"
                "height": r.height,
                "weight": r.weight
            })
        return jsonify({
            "id": child.id,
            "name": child.name,
            "age": age,
            "gender": child.gender,
            "measurements": measurements
        }), 200
   
    except Exception as e:
        return jsonify({"message": "Server Error", "error": str(e)}), 500
   
@app.route("/vaccine", methods=["GET"])
@jwt_required()
def get_vaccination_data():
    try:
        user_id = get_jwt_identity()
        child = Child.query.filter_by(parent_id=user_id).first()
        if not child:
            return jsonify({"message": "Child not found"}), 404
        vaccines = Vaccination.query.filter_by(child_id=child.id)\
            .order_by(Vaccination.due_date.asc()).all()
        result = []
        for v in vaccines:
            result.append({
                "id": v.id,
                "vaccine": v.vaccine_name,
                "date": v.administered_date.strftime("%Y-%m-%d") if v.administered_date else "-",
                "status": v.status if v.status else "Pending",
                "nextDue": v.due_date.strftime("%Y-%m-%d") if v.due_date else "-"
            })
        return jsonify(result), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": "Server Error"}), 500


genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


MODEL_NAME = 'models/gemini-flash-latest'


def clean_ai_response(text):
    return text.replace("```html", "").replace("```", "")

# 1. MEAL PLAN API 
# React calls this to generate a meal plan
@app.route('/generate-plan', methods=['POST'])
def generate_plan():
    try:
        # Get user input from react
        data = request.json 
        child_age = data.get('age')
        weight = data.get('weight')


        # Prompt engineering for meal plan generation
        # Instructs AI to act as a Nutritionist and strictly output HTML for the frontend
        prompt = f"""
        Act as a highly intelligent Sri Lankan Pediatric Nutritionist.
        
        PATIENT DATA:
        - Age: {child_age} months
        - Weight: {weight} kg
        
        STEP 1: ANALYSIS
        - Calculate if the weight is low, normal, or high for this age.
        - If Low Weight: Focus on "Calorie Boosting" (adding Coconut Milk, Ghee, Oil).
        - If Normal/High: Focus on "Balanced Nutrition" (Vegetables, Fiber).
        
        STEP 2: CREATE A DYNAMIC MEAL PLAN
        - Do NOT use a generic template. Customize the food based on the analysis above.
        - STARCH: Rotate between Red Rice, Sweet Potato (Bathala), or String Hoppers based on age.
        - PROTEIN: Use Dhal, Sprats (Haalmasso), or Egg based on age safety.
        - FRUIT: Select ONE specific vitamin-rich local fruit (Papaya, Mango, Avocado, or Banana) - do NOT always choose Banana.
        - VEGETABLE: Select ONE specific local vegetable (Pumpkin, Spinach, Carrots).
        
        STEP 3: FORMATTING (CRITICAL)
        - Return ONLY raw HTML code (No Markdown).
        - Use the exact structure below.
        
        STRUCTURE:
        <div class="summary-card">
            <h3>Patient Analysis</h3>
            <p><strong>Status:</strong> (Insert specific analysis: e.g., "Weight is slightly low. We added healthy fats.")</p>
            <p><strong>Calorie Goal:</strong> (Estimate daily calories) | <strong>Texture:</strong> (e.g. Puree / Mashed / Finger Food)</p>
        </div>

        <table class="meal-table">
            <thead>
                <tr>
                    <th style="width: 20%;">Time</th>
                    <th style="width: 30%;">Menu Item</th>
                    <th>Portion & Instructions</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Breakfast</strong><br><span class="time">8:00 AM</span></td>
                    <td>(Insert appropriate Starch dish)</td>
                    <td>(Specific portion size in tbsp/cups based on {weight}kg)</td>
                </tr>
                <tr>
                    <td><strong>Lunch</strong><br><span class="time">12:00 PM</span></td>
                    <td>(Insert Rice & Curry combo)</td>
                    <td>(Specific instructions: e.g., "Add 1 tsp Coconut Oil for weight gain")</td>
                </tr>
                <tr>
                    <td><strong>Snack</strong><br><span class="time">3:00 PM</span></td>
                    <td>(Insert Specific Fruit)</td>
                    <td>(Portion size)</td>
                </tr>
                <tr>
                    <td><strong>Dinner</strong><br><span class="time">6:00 PM</span></td>
                    <td>(Insert Light Dinner)</td>
                    <td>(Preparation method)</td>
                </tr>
            </tbody>
        </table>

        <div class="tips-card">
            <h4> Personalized Advice:</h4>
            <ul>
                <li>(Tip specifically for {child_age} month old)</li>
                <li>(Tip specifically about the weight of {weight} kg)</li>
            </ul>
        </div>
        """
        
        # Specific AI call and clean up
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        html_content = clean_ai_response(response.text)
        
        # Send the clean HTML back to React as JSON
        return jsonify({"success": True, "html": html_content})

    # Catch any server errors (like API failures) and return the error message
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

# 2. RESOURCE API 
# React calls this to get book/video recommendations
@app.route('/get-resources', methods=['POST'])
def get_resources():
    try:
        # Extract the user's data (age and specific concern) from the request
        data = request.json
        age = data.get('age')
        concern = data.get('concern')

        # Prompt engineering for educational content generation
        # Ask AI to curate books/videos based on the specific parenting concern
        prompt = f"""
    Act as a Pediatric Media Curator.
    User: Parent of a {age} month old. Topic: "{concern}".

    TASK:
    1. Recommend 3 Verified Books (Amazon Search Links).
    2. Recommend 3 Verified YouTube Videos.

    FORMATTING RULES:
    - Return ONLY raw HTML.
    - LINKS: Titles must be clickable search links.
    - IMAGES: Use https://loremflickr.com/320/180/baby,{concern.split()[0]}?random=(UniqueNumber)
    
    REQUIRED HTML STRUCTURE (SIMPLIFIED):

    <h2 class="section-title"> Verified Reading</h2>
    <div class="media-grid">
        <div class="book-card">
            <h4><a href="https://www.amazon.com/s?k=(Insert Book Title)" target="_blank">📖 (Insert Book Title)</a></h4>
            <p class="author">by (Author)</p>
            <p class="desc">(Brief summary)</p>
        </div>
        </div>

    <h2 class="section-title"> Expert Watchlist</h2>
    <div class="media-grid">
        <div class="video-card">
            <div class="video-thumb">
                <img src="https://loremflickr.com/320/180/parenting,{concern.split()[0]}?random=1" alt="Video Thumbnail">
                <span class="play-icon">▶</span>
            </div>
            <div class="video-info">
                <h4><a href="https://www.youtube.com/results?search_query=(Insert Video Title)" target="_blank">(Insert Video Title)</a></h4>
                <p class="channel">(Channel Name)</p>
            </div>
        </div>
        </div>
    """

        # Specific AI call and clean up
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        html_content = clean_ai_response(response.text)

        # Send the clean HTML back to React as JSON
        return jsonify({"success": True, "html": html_content})

    # Catch any server errors (like API failures) and return the error message
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    
#Doctor Layout Backend


class Allergy(db.Model):
    __tablename__ = "allergy"
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    child_id = db.Column(db.Integer, db.ForeignKey("child.id"), nullable=False)

    child = db.relationship("Child", backref="allergies")


class ActiveCondition(db.Model):
    __tablename__ = "active_condition"
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    child_id = db.Column(db.Integer, db.ForeignKey("child.id"), nullable=False)

    child = db.relationship("Child", backref="active_conditions")




def calculate_age(dob):
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))




@app.route("/", methods=["GET"])
def home():
    return "Flask is running"


@app.route("/children", methods=["GET"])
def get_children():
    children = Child.query.all()
    response = []

    for child in children:
        parent = User.query.get(child.parent_id)

        latest_growth = (
            GrowthRecord.query
            .filter_by(child_id=child.id)
            .order_by(GrowthRecord.record_date.desc())
            .first()
        )

        vaccinations = (
            Vaccination.query
            .filter_by(child_id=child.id)
            .order_by(Vaccination.administered_date.desc())
            .all()
        )

        response.append({
            "id": f"CH{child.id:03d}",
            "name": child.name,
            "age": calculate_age(child.date_of_birth),
            "date_of_birth": child.date_of_birth.isoformat(),
            "gender": child.gender,
            "parent": parent.username if parent else None,
            "phone": parent.email if parent else None,
            "allergies": [a.name for a in child.allergies],
            "activeConditions": [c.name for c in child.active_conditions],
            "growth": {
                "height": latest_growth.height if latest_growth else None,
                "weight": latest_growth.weight if latest_growth else None,
                "head": latest_growth.head_circumference if latest_growth else None,
            } if latest_growth else None,
            "vaccinations": [
                {
                    "vaccine_name": v.vaccine_name,
                    "dose_number": v.dose_number,
                    "administered_date": v.administered_date.isoformat() if v.administered_date else None,
                    "due_date": v.due_date.isoformat() if v.due_date else None,
                    "status": v.status,
                    "administered_by": v.administered_by,
                    "location": v.location
                }
                for v in vaccinations
            ]
        })

    return jsonify(response)

# Admin Management Routes

@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
def get_admin_users():
    """Fetches all users from the database for the Admin panel"""
    try:
        
        current_user_id = get_jwt_identity()
        admin_user = User.query.get(current_user_id)
        
        if not admin_user or admin_user.role != 'admin':
            return jsonify({"message": "Unauthorized access. Admins only."}), 403

        
        users = User.query.all()
        
        
        output = []
        for u in users:
            output.append({
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "role": u.role,
                "phone": u.phone
            })
            
        return jsonify(output), 200
    except Exception as e:
        print(f"Admin API Error: {str(e)}")
        return jsonify({"message": "Server error", "details": str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True)
if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_DEBUG") == "1", port=int(os.getenv("PORT", 5000)))



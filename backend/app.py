import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta,datetime,date, UTC
import os
from flask_cors import CORS, cross_origin
from flask_jwt_extended import (JWTManager, create_access_token, jwt_required, get_jwt_identity, decode_token)
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash
from dateutil.relativedelta import relativedelta
import csv
from collections import defaultdict
from dotenv import load_dotenv
from flask_socketio import SocketIO, join_room, leave_room, emit
import json as _json
import uuid as _uuid


load_dotenv()

_growth_predictor = None

def _get_growth_predictor():
    global _growth_predictor
    if _growth_predictor is None:
        try:
            import sys
            if os.path.join(BASE_DIR, '..') not in sys.path:
                sys.path.insert(0, os.path.join(BASE_DIR, '..'))
            from ml.src.prediction_engine import GrowthPredictor
            _growth_predictor = GrowthPredictor()
            print("[ML] GrowthPredictor loaded and cached \u2713")
        except Exception as e:
            print(f"[ML] Could not load GrowthPredictor: {e}")
            _growth_predictor = None
    return _growth_predictor


app = Flask(__name__)
CORS( app, resources={r"/*": {"origins": os.getenv("FRONTEND_URL")}}, supports_credentials=True)

socketio = SocketIO(app, cors_allowed_origins=os.getenv("FRONTEND_URL"))


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
    MOH_ID = db.Column(db.String(20), unique=True)   


class Child(db.Model):
    __tablename__ = 'child'
    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(10), nullable=True)

    
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
    username = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    registration_number = db.Column(db.String(100), unique=True, nullable=False)
    child_name = db.Column(db.String(255), nullable=False)
    child_dob = db.Column(db.Date, nullable=False)
    child_gender = db.Column(db.String(10), nullable=True)
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
    status = db.Column(db.String(20), default='PENDING')

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    
class RegisteredPatient(db.Model):
    __tablename__ = 'registered_patient'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    registration_number = db.Column(db.String(100), unique=True, nullable=False)
    child_name = db.Column(db.String(255), nullable=False)
    child_dob = db.Column(db.Date, nullable=False)
    child_gender = db.Column(db.String(10), nullable=True)
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
    status = db.Column(db.String(20), default='APPROVED')

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    user = db.relationship("User", backref="registered_patient")

class DeclinedRegistration(db.Model):
    __tablename__ = 'declined_registration'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    registration_number = db.Column(db.String(100), unique=True, nullable=False)
    child_name = db.Column(db.String(255), nullable=False)
    child_dob = db.Column(db.Date, nullable=False)
    child_gender = db.Column(db.String(10), nullable=True)
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
    status = db.Column(db.String(20), default='DECLINED')
    reason = db.Column(db.Text, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
class Conversation(db.Model):   
    __tablename__ = "conversation"
    id = db.Column(db.Integer, primary_key=True)
    user1_id = db.Column(db.Integer, nullable=False)
    user2_id = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


#this is to store each message thats sent so the message history can be stored
class Message(db.Model):
    __tablename__ = "message"
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey("conversation.id"), nullable=False)
    sender_id = db.Column(db.Integer, nullable=False)
    receiver_id = db.Column(db.Integer, nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)


class Event(db.Model):
    __tablename__ = 'event'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    event_type = db.Column(db.String(50), nullable=False)
    date = db.Column(db.Date, nullable=False)
    location = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class ReportRequest(db.Model):
    __tablename__ = 'report_request'
    id = db.Column(db.Integer, primary_key=True)
    report_request_id = db.Column(db.String(20), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    requested_by = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(200), nullable=False)         
    child_id_number = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    email = db.Column(db.String(200), nullable=False)
    reports_requested = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='Pending')
    description = db.Column(db.Text)
    review_date = db.Column(db.DateTime)
    reviewed_by = db.Column(db.String(200))
    collection_date = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='report_requests')


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


# Admin Profile route
@app.route('/admin-profile', methods=['GET'])
def admin_profile():
    try:
        admin = User.query.filter_by(role='admin').first()
        if not admin:
            return jsonify({"error": "Admin not found"}), 404
        return jsonify({
            "username": admin.username,
            "email": admin.email,
            "role": admin.role
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
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


@app.route('/add-health-note', methods=['POST'])
@jwt_required()
def add_health_note():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        child = Child.query.filter_by(parent_id=user_id).first()
        if not child:
            return jsonify({"message": "Child record not found"}), 404

        record_date = datetime.fromisoformat(data.get('noticedAt'))

        new_note = HealthNote(
            child_id=child.id,
            record_type=data.get('type'),
            record_date=record_date,
            symptom_type=data.get('symptomType'),
            severity=data.get('severity'),
            medication_name=data.get('medicationName'),
            medication_dosage=data.get('dosage'),
            reason=data.get('reason'),
            temperature=float(data.get('temperature')) if data.get('temperature') else None,
            title=data.get('subject'),
            description=data.get('description') or data.get('details'),
            notes=f"Entry created via {data.get('type')} form."
        )

        db.session.add(new_note)
        db.session.commit()

        return jsonify({"message": "Successfully recorded health data"}), 201

    except Exception as e:
        db.session.rollback()
        print("Backend Error:", str(e))
        return jsonify({"message": "Internal server error", "error": str(e)}), 500


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


@app.route("/profile", methods=["GET"])
@jwt_required()
def get_profile_data():
    try:
        user_id = get_jwt_identity()

        user = User.query.get(user_id)
        child = Child.query.filter_by(parent_id=user_id).first()

        if not user or not child:
            return jsonify({"message": "Profile not found"}), 404
        
        pending = PendingRegistration.query.filter_by(child_name=child.name).order_by(PendingRegistration.created_at.desc()).first() ##### change with Registration when thats done

        return jsonify({
            "child": {
                "name": child.name,
                "dob": child.date_of_birth.isoformat(),
                "gender": child.gender,
                "reg_number": pending.registration_number if pending else None
            },
            "birth": {
                "hospital": pending.birth_hospital if pending else None,
                "location": pending.birth_location if pending else None,
                "delivery": pending.delivery_type if pending else None,
                "weight": pending.birth_weight if pending else None,
                "length": pending.birth_length if pending else None,
                "head": pending.head_circumference if pending else None,
                "surgery": pending.surgery if pending else None 
            },
            "background": {
                "nationality": pending.nationality if pending else None,
                "language": pending.language if pending else None
            },
            "parent": {
                "name": pending.mother_name if pending else user.username,
                "email": user.email,
                "phone": user.phone,
                "Address":pending.living_address if pending else None
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


#messaging component

@socketio.on("connect")    #the decorator tells the server to run this function when a client connects to the server
def handle_connect(auth):  # auth is a dictionary sent by the client during connection,  containing JWT token.
    token = auth.get("token")  # gets the token from the auth dic
    try:
        decoded = decode_token(token) #decodes the token 
        user_id = decoded["sub"]   # contains the user ID
        join_room(f"user_{user_id}")   #join_room is a Flask-SocketIO function that adds this connection to a room named "user_{user_id}".
        emit("connected", {"message": "Connected"}) # Sends a message back to the client who just connected.
    except Exception:
        return False



@socketio.on("send_message")
def handle_send_message(data): # get and extract the information from the data dic the client sends
    sender_id = data["sender_id"]
    receiver_id = data["receiver_id"]
    content = data["content"]

    user1 = min(sender_id, receiver_id)  # making sure to store the smaller id 1st to make sure that only one convo is recorded for a pair of users
    user2 = max(sender_id, receiver_id)

    conversation = Conversation.query.filter_by(   # checking the db to see if the convo already exissts
        user1_id=user1,
        user2_id=user2
    ).first()

    if not conversation:  # if not createing a new convo and adding to the database
        conversation = Conversation(user1_id=user1, user2_id=user2)
        db.session.add(conversation)
        db.session.commit()

    message = Message(  # create a new message reocord linked to the specific convo and save it in the db
        conversation_id=conversation.id,
        sender_id=sender_id,
        receiver_id=receiver_id,
        content=content
    )

    db.session.add(message)
    db.session.commit()

    msg_data = {   # creating a dic with the messge details to send through the websocket
        "id": message.id,
        "conversation_id": conversation.id,
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "content": content,
        "timestamp": message.timestamp.isoformat()
    }

   
    emit("receive_message", msg_data, room=f"user_{receiver_id}")  # sends the message to the receviers personal room so it updates instantly

    emit("receive_message", msg_data, room=f"user_{sender_id}") # sends the message to the senders personal room so it updates instantly



#route to get the messages of the logged in user
@app.route("/messages/<int:other_user_id>", methods=["GET"])
@jwt_required()
def get_messages(other_user_id):
    current_user = int(get_jwt_identity())

    user1 = min(current_user, other_user_id) 
    user2 = max(current_user, other_user_id)

    conversation = Conversation.query.filter_by(
        user1_id=user1,
        user2_id=user2
    ).first()

    if not conversation:  # checks if there is a convo fo the user if not returns a empty list cause there are no mesg if there are no convos 
        return jsonify([])

    messages = Message.query.filter_by( #get all the messages for the specific convo ordered accendingly
        conversation_id=conversation.id
    ).order_by(Message.timestamp.asc()).all()

    return jsonify([  # Converts each Message object into a dictionary with its data and sends it as a JSON array to the client
        {
            "sender_id": m.sender_id,
            "receiver_id": m.receiver_id,
            "content": m.content,
            "timestamp": m.timestamp.isoformat()
        }
        for m in messages
    ])


#route to search user for messageing with MOH given ID
@app.route("/search-user/<code>", methods=["GET"])
@jwt_required()
def search_user(code):
    user = User.query.filter_by(MOH_ID=code).first()

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "role": user.role
    })


@app.route("/conversations", methods=["GET"])
@jwt_required()
def get_conversations():
    current_user = int(get_jwt_identity())

    conversations = Conversation.query.filter(
        (Conversation.user1_id == current_user) | (Conversation.user2_id == current_user)
    ).order_by(Conversation.created_at.desc()).all()

    conversations_list = []
    for conversation in conversations:

        other_user_id = conversation.user2_id if conversation.user1_id == current_user else conversation.user1_id
        user = User.query.get(other_user_id)

        
        last_message = Message.query.filter_by(conversation_id=conversation.id).order_by(Message.timestamp.desc()).first()
        conversations_list.append({
            "conversation_id": conversation.id,
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role
            },
            "last_message": last_message.content if last_message else "",
            "timestamp": last_message.timestamp.isoformat() if last_message else conversation.created_at.isoformat()
        })

    return jsonify(conversations_list)



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
@jwt_required()  # Add JWT authentication
def generate_plan():
    try:
        # Get the logged-in parent's user_id from JWT token
        parent_id = get_jwt_identity()
        
        # Fetch the child belonging to this parent
        child = Child.query.filter_by(parent_id=parent_id).first()
        
        if not child:
            return jsonify({"success": False, "error": "No child found for this parent"}), 404
        
        # Get the latest growth record for this child
        latest_growth = (
            GrowthRecord.query
            .filter_by(child_id=child.id)
            .order_by(GrowthRecord.record_date.desc())
            .first()
        )
        
        if not latest_growth or not latest_growth.weight:
            return jsonify({"success": False, "error": "No weight data found for this child"}), 404
        
        # --- ADDED: Fetch Allergies ---
        allergies = Allergy.query.filter_by(child_id=child.id).all()
        allergy_list = [a.name for a in allergies]
        allergy_display = ", ".join(allergy_list) if allergy_list else "None"
        # ------------------------------

        # Calculate age in months
        today = date.today()
        child_age = (today.year - child.date_of_birth.year) * 12 + (today.month - child.date_of_birth.month)
        if today.day < child.date_of_birth.day:
            child_age -= 1
        
        # Get weight from latest growth record
        weight = latest_growth.weight

        # Prompt engineering for meal plan generation
        prompt = f"""
        Act as a highly intelligent Sri Lankan Pediatric Nutritionist.
        
        PATIENT DATA:
        - Age: {child_age} months
        - Weight: {weight} kg
        - KNOWN ALLERGIES: {allergy_display}
        
        CRITICAL SAFETY REQUIREMENT:
        - Check the KNOWN ALLERGIES list carefully.
        - You MUST NOT include any foods containing {allergy_display} in the meal plan.
        - If the child is allergic to Dairy, replace milk/ghee with Coconut Milk or oil.
        - If the child is allergic to Eggs or Seafood, ensure proteins are sourced from Dhal, Chickpeas, or alternative legumes.

        STEP 1: ANALYSIS
        - Calculate if the weight is low, normal, or high for this age.
        - If Low Weight: Focus on "Calorie Boosting" (adding Coconut Milk, Ghee, Oil - if not allergic).
        - If Normal/High: Focus on "Balanced Nutrition" (Vegetables, Fiber).
        
        STEP 2: CREATE A DYNAMIC MEAL PLAN
        - Do NOT use a generic template. Customize the food based on the analysis above.
        - STARCH: Rotate between Red Rice, Sweet Potato (Bathala), or String Hoppers based on age.
        - PROTEIN: Use Dhal, Sprats (Haalmasso), or Egg based on age safety AND allergy constraints.
        - FRUIT: Select ONE specific vitamin-rich local fruit (Papaya, Mango, Avocado, or Banana).
        - VEGETABLE: Select ONE specific local vegetable (Pumpkin, Spinach, Carrots).
        
        STEP 3: FORMATTING (CRITICAL)
        - Return ONLY raw HTML code (No Markdown).
        - Use the exact structure below.
        
        STRUCTURE:
        <div class="summary-card">
            <h3>Patient Analysis & Safety</h3>
            <p><strong>Status:</strong> (Insert specific analysis: e.g., "Weight is slightly low.")</p>
            <p><strong>Allergies Noted:</strong> {allergy_display} (Confirmed excluded from plan)</p>
            <p><strong>Calorie Goal:</strong> (Estimate daily calories) | <strong>Texture:</strong> (e.g. Puree / Mashed / Finger Food)</p>
        </div>

        <table class="meal-table">
            <thead>
                <tr>
                    <th style="width: 20%;">Time</th>
                    <th style="width: 30%;">Menu Item</th>
                    <th>Portion & Allergy-Safe Instructions</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Breakfast</strong><br><span class="time">8:00 AM</span></td>
                    <td>(Insert appropriate Starch dish)</td>
                    <td>(Specific portion size in tbsp/cups based on {weight}kg. Confirm it is allergy-safe.)</td>
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
                <li>(Safety tip regarding {allergy_display} management in Sri Lankan cooking)</li>
            </ul>
        </div>
        """
        
        # Specific AI call and clean up
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        html_content = clean_ai_response(response.text)
        
        # Send the clean HTML back to React as JSON
        return jsonify({"success": True, "html": html_content})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
        
        # Specific AI call and clean up
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        html_content = clean_ai_response(response.text)
        
        # Send the clean HTML back to React as JSON
        return jsonify({"success": True, "html": html_content})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500



# 2. RESOURCE API 
# React calls this to get book/video recommendations
@app.route('/get-resources', methods=['POST'])
@jwt_required()  # Add JWT authentication
def get_resources():
    try:
        # Get the logged-in parent's user_id from JWT token
        parent_id = get_jwt_identity()
        
        # Fetch the child belonging to this parent
        child = Child.query.filter_by(parent_id=parent_id).first()
        
        if not child:
            return jsonify({"success": False, "error": "No child found for this parent"}), 404
        
        # Calculate age in months
        today = date.today()
        age = (today.year - child.date_of_birth.year) * 12 + (today.month - child.date_of_birth.month)
        if today.day < child.date_of_birth.day:
            age -= 1
        
        # Extract the user's concern from the request
        data = request.json
        concern = data.get('concern')
        
        if not concern:
            return jsonify({"success": False, "error": "Please select a topic"}), 400

        # Prompt engineering for educational content generation
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
            <h4><a href="https://www.amazon.com/s?k=(Insert Book Title)" target="_blank"> (Insert Book Title)</a></h4>
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

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    







    
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
class DoctorProfile(db.Model):
    __tablename__ = "doctor_profile"

    id             = db.Column(db.Integer, primary_key=True)
    user_id        = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, unique=True)
    avatar         = db.Column(db.Text)
    first_name     = db.Column(db.String(100))
    last_name      = db.Column(db.String(100))
    title          = db.Column(db.String(20))
    gender         = db.Column(db.String(30))
    dob            = db.Column(db.String(20))
    phone          = db.Column(db.String(30))
    email          = db.Column(db.String(120))
    bio            = db.Column(db.Text)
    specialty        = db.Column(db.String(100))
    sub_specialty    = db.Column(db.String(100))
    license_number   = db.Column(db.String(50))
    license_expiry   = db.Column(db.String(20))
    slmc_number      = db.Column(db.String(50))
    years_experience = db.Column(db.String(10))
    current_hospital = db.Column(db.String(200))
    department       = db.Column(db.String(100))
    consultation_fee = db.Column(db.String(20))
    emergency_available = db.Column(db.Boolean, default=False)
    emergency_max       = db.Column(db.String(10))
    telehealth          = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("User", backref="doctor_profile")
    qualifications = db.relationship("DoctorQualification", backref="profile", cascade="all, delete-orphan")
    experience     = db.relationship("DoctorExperience",     backref="profile", cascade="all, delete-orphan")
    certifications = db.relationship("DoctorCertification",  backref="profile", cascade="all, delete-orphan")
    languages      = db.relationship("DoctorLanguage",       backref="profile", cascade="all, delete-orphan")
    expertise      = db.relationship("DoctorExpertise",      backref="profile", cascade="all, delete-orphan")
    publications   = db.relationship("DoctorPublication",    backref="profile", cascade="all, delete-orphan")
    availability   = db.relationship("DoctorAvailability",   backref="profile", cascade="all, delete-orphan")


class DoctorQualification(db.Model):
    __tablename__ = "doctor_qualification"

    id          = db.Column(db.Integer, primary_key=True)
    profile_id  = db.Column(db.Integer, db.ForeignKey("doctor_profile.id"), nullable=False)
    degree      = db.Column(db.String(100))
    institution = db.Column(db.String(200))
    year        = db.Column(db.String(10))
    country     = db.Column(db.String(100))


class DoctorExperience(db.Model):
    __tablename__ = "doctor_experience"

    id          = db.Column(db.Integer, primary_key=True)
    profile_id  = db.Column(db.Integer, db.ForeignKey("doctor_profile.id"), nullable=False)
    role        = db.Column(db.String(100))
    hospital    = db.Column(db.String(200))
    from_date   = db.Column(db.String(20))
    to_date     = db.Column(db.String(20))
    current     = db.Column(db.Boolean, default=False)


class DoctorCertification(db.Model):
    __tablename__ = "doctor_certification"

    id           = db.Column(db.Integer, primary_key=True)
    profile_id   = db.Column(db.Integer, db.ForeignKey("doctor_profile.id"), nullable=False)
    name         = db.Column(db.String(200))
    issuing_body = db.Column(db.String(200))
    issue_date   = db.Column(db.String(20))
    expiry_date  = db.Column(db.String(20))


class DoctorLanguage(db.Model):
    __tablename__ = "doctor_language"

    id         = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey("doctor_profile.id"), nullable=False)
    language   = db.Column(db.String(100))


class DoctorExpertise(db.Model):
    __tablename__ = "doctor_expertise"

    id         = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey("doctor_profile.id"), nullable=False)
    area       = db.Column(db.String(200))


class DoctorPublication(db.Model):
    __tablename__ = "doctor_publication"

    id         = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey("doctor_profile.id"), nullable=False)
    title      = db.Column(db.String(300))
    journal    = db.Column(db.String(200))
    year       = db.Column(db.String(10))


class DoctorAvailability(db.Model):
    __tablename__ = "doctor_availability"

    id         = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey("doctor_profile.id"), nullable=False)
    day        = db.Column(db.String(20))
    available  = db.Column(db.Boolean, default=False)
    from_time  = db.Column(db.String(10))
    to_time    = db.Column(db.String(10))


_DAYS_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]


_WHO_W_SD = {
    'boy': {
        'months': list(range(25)),
        'sd2neg': [2.5,3.4,4.3,5.0,5.6,6.0,6.4,6.7,7.0,7.2,7.5,7.7,7.8,8.0,8.2,8.4,8.6,8.7,8.9,9.1,9.2,9.4,9.5,9.7,9.8],
        'sd3neg': [2.1,2.9,3.8,4.4,4.9,5.3,5.7,5.9,6.2,6.4,6.6,6.8,6.9,7.1,7.2,7.4,7.5,7.7,7.8,8.0,8.1,8.2,8.4,8.5,8.6],
        'sd2pos': [4.4,5.8,7.1,8.0,8.7,9.3,9.8,10.3,10.7,11.0,11.4,11.7,12.0,12.3,12.6,12.8,13.1,13.4,13.7,13.9,14.2,14.5,14.7,15.0,15.3],
    },
    'girl': {
        'months': list(range(25)),
        'sd2neg': [2.4,3.2,4.0,4.5,5.0,5.4,5.7,6.0,6.3,6.5,6.7,6.9,7.1,7.2,7.4,7.6,7.8,8.0,8.2,8.4,8.6,8.8,9.0,9.2,9.4],
        'sd3neg': [2.0,2.7,3.4,3.9,4.3,4.7,5.0,5.3,5.5,5.7,5.9,6.0,6.2,6.4,6.5,6.7,6.9,7.0,7.2,7.4,7.5,7.7,7.9,8.0,8.2],
        'sd2pos': [4.2,5.5,6.6,7.5,8.2,8.8,9.3,9.8,10.2,10.5,10.9,11.2,11.5,11.8,12.1,12.4,12.6,12.9,13.2,13.5,13.8,14.1,14.4,14.7,15.0],
    }
}

_WHO_H_SD = {
    'boy': {
        'months': list(range(25)),
        'sd2neg': [46.1,50.8,54.4,57.3,59.7,61.7,63.3,64.8,66.2,67.5,68.7,69.9,71.0,72.1,73.1,74.1,75.0,75.9,76.9,77.7,78.6,79.4,80.2,81.0,81.7],
        'sd3neg': [44.2,48.9,52.4,55.3,57.6,59.6,61.2,62.7,64.0,65.2,66.4,67.6,68.6,69.6,70.6,71.6,72.5,73.3,74.2,75.0,75.8,76.5,77.2,77.9,78.7],
    },
    'girl': {
        'months': list(range(25)),
        'sd2neg': [45.4,49.8,53.0,55.6,57.8,59.6,61.2,62.7,64.0,65.2,66.4,67.5,68.6,69.6,70.6,71.5,72.4,73.3,74.2,75.0,75.9,76.7,77.5,78.3,79.1],
        'sd3neg': [43.6,47.8,51.0,53.5,55.6,57.4,58.9,60.3,61.5,62.7,63.8,64.9,65.8,66.8,67.7,68.6,69.4,70.2,71.0,71.8,72.6,73.3,74.0,74.8,75.4],
    }
}


class HealthAlert(db.Model):
    __tablename__ = 'health_alert'
    id         = db.Column(db.Integer, primary_key=True)
    child_id   = db.Column(db.Integer, db.ForeignKey('child.id'), nullable=False)
    alert_type = db.Column(db.String(50),  nullable=False)
    severity   = db.Column(db.String(20),  nullable=False)
    title      = db.Column(db.String(200), nullable=False)
    message    = db.Column(db.Text,        nullable=False)
    value      = db.Column(db.Float)  
    threshold  = db.Column(db.Float)   
    age_months = db.Column(db.Integer)
    is_read    = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


def _interp(x, xs, ys):
    if x <= xs[0]:  return ys[0]
    if x >= xs[-1]: return ys[-1]
    for i in range(len(xs) - 1):
        if xs[i] <= x <= xs[i+1]:
            t = (x - xs[i]) / (xs[i+1] - xs[i])
            return ys[i] + t * (ys[i+1] - ys[i])
    return ys[-1]


def _check_growth_alerts(child, record_date, weight, height, age_months):

    alerts = []
    gk  = 'boy' if child.gender.upper() in ('M', 'MALE', 'BOY') else 'girl'
    wsd = _WHO_W_SD[gk]
    hsd = _WHO_H_SD[gk]

    if weight:
        sd3w  = _interp(age_months, wsd['months'], wsd['sd3neg'])
        sd2w  = _interp(age_months, wsd['months'], wsd['sd2neg'])
        sd2pw = _interp(age_months, wsd['months'], wsd['sd2pos'])

        if weight < sd3w:
            alerts.append(HealthAlert(child_id=child.id, alert_type='weight_severe',
                severity='critical', title='⚠️ Severely Underweight',
                message=f"{child.name} weighs {weight} kg at {age_months} months, below WHO -3SD ({sd3w:.1f} kg). Immediate nutritional assessment and medical review is recommended.",
                value=weight, threshold=sd3w, age_months=age_months))
        elif weight < sd2w:
            alerts.append(HealthAlert(child_id=child.id, alert_type='weight_moderate',
                severity='warning', title='⚠️ Moderately Underweight',
                message=f"{child.name} weighs {weight} kg at {age_months} months, below WHO -2SD ({sd2w:.1f} kg). Dietary review and close monitoring advised.",
                value=weight, threshold=sd2w, age_months=age_months))
        elif weight > sd2pw:
            alerts.append(HealthAlert(child_id=child.id, alert_type='overweight',
                severity='warning', title='⚠️ Overweight / Obese',
                message=f"{child.name} weighs {weight} kg at {age_months} months, above WHO +2SD ({sd2pw:.1f} kg). Dietary and lifestyle review recommended.",
                value=weight, threshold=sd2pw, age_months=age_months))

    if height:
        sd3h = _interp(age_months, hsd['months'], hsd['sd3neg'])
        sd2h = _interp(age_months, hsd['months'], hsd['sd2neg'])

        if height < sd3h:
            alerts.append(HealthAlert(child_id=child.id, alert_type='height_severe',
                severity='critical', title='⚠️ Severely Stunted',
                message=f"{child.name}'s height {height} cm at {age_months} months is below WHO -3SD ({sd3h:.1f} cm). Urgent medical evaluation recommended.",
                value=height, threshold=sd3h, age_months=age_months))
        elif height < sd2h:
            alerts.append(HealthAlert(child_id=child.id, alert_type='height_moderate',
                severity='warning', title='⚠️ Stunted Growth',
                message=f"{child.name}'s height {height} cm at {age_months} months is below WHO -2SD ({sd2h:.1f} cm). Growth monitoring and nutritional support advised.",
                value=height, threshold=sd2h, age_months=age_months))

    prev = (GrowthRecord.query.filter_by(child_id=child.id)
            .filter(GrowthRecord.record_date < record_date)
            .order_by(GrowthRecord.record_date.desc()).first())
    if prev and prev.weight and weight:
        loss_pct = (prev.weight - weight) / prev.weight * 100
        gain_pct = (weight - prev.weight) / prev.weight * 100
        if loss_pct > 5:
            alerts.append(HealthAlert(child_id=child.id, alert_type='rapid_loss',
                severity='critical', title='⚠️ Rapid Weight Loss',
                message=f"{child.name} lost {loss_pct:.1f}% weight ({prev.weight} kg → {weight} kg) since last measurement. Medical review recommended.",
                value=weight, threshold=prev.weight, age_months=age_months))
        elif gain_pct > 20:
            alerts.append(HealthAlert(child_id=child.id, alert_type='rapid_gain',
                severity='warning', title='⚠️ Unusually Rapid Weight Gain',
                message=f"{child.name} gained {gain_pct:.1f}% weight ({prev.weight} kg → {weight} kg) since last measurement. Review dietary intake.",
                value=weight, threshold=prev.weight, age_months=age_months))

    return alerts


@app.route("/", methods=["GET"])
def home():
    return "Flask is running"


@app.route("/children", methods=["GET"])
def get_children():
    children = Child.query.all()
    response = []

    for child in children:
        parent = User.query.get(child.parent_id)

        registered_patient = RegisteredPatient.query.filter_by(
            child_name=child.name,
            child_dob=child.date_of_birth
        ).first()

        growth_history = (
            GrowthRecord.query
            .filter_by(child_id=child.id)
            .order_by(GrowthRecord.record_date.desc())
            .all()
        )

        latest_growth = growth_history[0] if growth_history else None

        vaccinations = (
            Vaccination.query
            .filter_by(child_id=child.id)
            .order_by(Vaccination.administered_date.desc())
            .all()
        )

        health_notes = (
            HealthNote.query
            .filter_by(child_id=child.id)
            .order_by(HealthNote.record_date.desc())
            .all()
        )

        response.append({
            "id": f"CH{child.id:03d}",
            "name": child.name,
            "age": calculate_age(child.date_of_birth),
            "date_of_birth": child.date_of_birth.isoformat(),
            "gender": child.gender,
            "parent": registered_patient.mother_name if registered_patient else None,
            "phone": parent.email if parent else None,
            "moh_id": parent.MOH_ID if parent else None,
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
            ],
            "healthNotes": [
                {
                    "record_type": h.record_type,
                    "title": h.title,
                    "description": h.description,
                    "temperature": h.temperature,
                    "severity": h.severity,
                    "medication_name": h.medication_name,
                    "medication_dosage": h.medication_dosage,
                    "notes": h.notes,
                    "record_date": h.record_date.isoformat()
                }
                for h in health_notes
            ],
            "growthHistory": [
                {
                    "record_date": r.record_date.isoformat(),
                    "weight": r.weight,
                    "height": r.height,
                    "head": r.head_circumference,
                    "notes": r.notes
                }
                for r in growth_history
            ],
            "healthRecords": [
                {
                    "record_type": r.record_type,
                    "title": r.title,
                    "doctor_name": r.doctor_name,
                    "diagnosis": r.diagnosis,
                    "treatment": r.treatment,
                    "medication_name": r.medication_name,
                    "medication_dosage": r.medication_dosage,
                    "notes": r.notes,
                    "record_date": r.record_date.isoformat()
                }
                for r in HealthRecord.query.filter_by(child_id=child.id)
                    .order_by(HealthRecord.record_date.desc()).all()
            ]
        })

    return jsonify(response)


@app.route('/children/<int:child_id>/growth', methods=['POST'])
def add_growth_record(child_id):
    try:
        child = Child.query.get(child_id)
        if not child:
            return jsonify({'error': 'Child not found'}), 404

        data        = request.get_json()
        weight      = float(data['weight']) if data.get('weight') else None
        height      = float(data['height']) if data.get('height') else None
        head        = float(data['head'])   if data.get('head')   else None
        notes       = data.get('notes', '')
        date_str    = data.get('date')
        record_date = datetime.strptime(date_str, '%Y-%m-%d') if date_str else datetime.utcnow()

        dob = child.date_of_birth
        rd  = record_date.date() if hasattr(record_date, 'date') else record_date
        age_months = (rd.year - dob.year) * 12 + (rd.month - dob.month)

        bmi = round(weight / ((height / 100) ** 2), 1) if weight and height else None

        record = GrowthRecord(
            child_id=child_id, record_date=record_date,
            weight=weight, height=height, head_circumference=head,
            bmi=bmi, age_at_record=age_months, notes=notes
        )
        db.session.add(record)

        new_alerts = _check_growth_alerts(child, record_date, weight, height, age_months)
        for a in new_alerts:
            db.session.add(a)

        db.session.commit()

        if new_alerts:
            parent = User.query.get(child.parent_id)
            if parent:
                for a in new_alerts:
                    socketio.emit('health_alert', {
                        'id': a.id, 'alert_type': a.alert_type,
                        'severity': a.severity, 'title': a.title,
                        'message': a.message, 'value': a.value,
                        'threshold': a.threshold, 'age_months': a.age_months,
                        'is_read': False, 'created_at': a.created_at.isoformat()
                    }, room=f'user_{parent.id}')

        return jsonify({
            'success': True, 'record_id': record.id,
            'bmi': bmi, 'age_months': age_months,
            'alerts': [{'id': a.id, 'severity': a.severity, 'title': a.title,
                        'message': a.message, 'alert_type': a.alert_type}
                       for a in new_alerts]
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f'[AddGrowth] Error: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/health-alerts', methods=['GET'])
@jwt_required()
def get_health_alerts():
    parent_id = get_jwt_identity()
    child = Child.query.filter_by(parent_id=parent_id).first()
    if not child:
        return jsonify([]), 200

    alerts = (HealthAlert.query
              .filter_by(child_id=child.id)
              .order_by(HealthAlert.created_at.desc())
              .all())
    return jsonify([{
        'id': a.id, 'alert_type': a.alert_type, 'severity': a.severity,
        'title': a.title, 'message': a.message, 'value': a.value,
        'threshold': a.threshold, 'age_months': a.age_months,
        'is_read': a.is_read, 'created_at': a.created_at.isoformat()
    } for a in alerts]), 200


@app.route('/health-alerts/<int:alert_id>/read', methods=['POST'])
@jwt_required()
def mark_alert_read(alert_id):
    parent_id = get_jwt_identity()
    child = Child.query.filter_by(parent_id=parent_id).first()
    alert = HealthAlert.query.get(alert_id)
    if not alert or (child and alert.child_id != child.id):
        return jsonify({'error': 'Not found'}), 404
    alert.is_read = True
    db.session.commit()
    return jsonify({'success': True}), 200


@app.route('/health-alerts/read-all', methods=['POST'])
@jwt_required()
def mark_all_alerts_read():
    parent_id = get_jwt_identity()
    child = Child.query.filter_by(parent_id=parent_id).first()
    if child:
        HealthAlert.query.filter_by(child_id=child.id, is_read=False).update({'is_read': True})
        db.session.commit()
    return jsonify({'success': True}), 200
    

@app.route("/children/<int:child_id>/vaccinations", methods=["POST"])
@cross_origin()
def add_vaccination(child_id):
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data received"}), 400

        child = Child.query.get(child_id)
        if not child:
            return jsonify({"error": "Child not found"}), 404

        if not data.get("vaccineName"):
            return jsonify({"error": "Vaccine name is required"}), 400

        if not data.get("dateAdministered"):
            return jsonify({"error": "Date administered is required"}), 400

        # Safe date parsing
        try:
            administered_date = datetime.strptime(data["dateAdministered"], "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "Invalid date format"}), 400

        next_due_date = None
        if data.get("nextDueDate"):
            try:
                next_due_date = datetime.strptime(data["nextDueDate"], "%Y-%m-%d").date()
            except ValueError:
                pass

        new_vaccination = Vaccination(
            child_id=child_id,
            vaccine_name=data["vaccineName"].strip(),
            dose_number=str(data.get("doseNumber", "")).strip() or None,
            administered_date=administered_date,
            due_date=next_due_date,
            administered_by=data.get("administeredBy", "").strip() or None,
            batch_number=data.get("batchNumber", "").strip() or None,
            notes=data.get("notes", "").strip() or None,
            status="completed"
        )

        db.session.add(new_vaccination)
        db.session.commit()

        return jsonify({
            "message": "Vaccination recorded successfully",
            "id": new_vaccination.id
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Vaccination record error: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route("/children/<int:child_id>/health-records", methods=["GET"])
@cross_origin()
def get_health_records(child_id):
    child = Child.query.get(child_id)
    if not child:
        return jsonify({"error": "Child not found"}), 404

    record_type = request.args.get("type")          

    query = HealthRecord.query.filter_by(child_id=child_id)
    if record_type:
        query = query.filter_by(record_type=record_type)

    records = query.order_by(HealthRecord.record_date.desc()).all()

    return jsonify([
        {
            "id":               r.id,
            "record_type":      r.record_type,
            "title":            r.title,
            "doctor_name":      r.doctor_name,
            # ── Doctor Note fields ──
            "diagnosis":        r.diagnosis,
            "treatment":        r.treatment,
            "notes":            r.notes,
            # ── Prescription fields ──
            "medication_name":  r.medication_name,
            "medication_dosage": r.medication_dosage,
            "record_date":      r.record_date.isoformat() if r.record_date else None,
        }
        for r in records
    ]), 200


@app.route("/children/<int:child_id>/health-records/notes", methods=["POST"])
@cross_origin()
def add_doctor_note(child_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data received"}), 400

        child = Child.query.get(child_id)
        if not child:
            return jsonify({"error": "Child not found"}), 404

        if not data.get("notes"):
            return jsonify({"error": "Note content is required"}), 400

        new_record = HealthRecord(
            child_id=child_id,
            record_type="Doctor Note",
            title=data.get("title", "Doctor Note").strip(),
            doctor_name=data.get("doctor_name", "").strip() or None,
            diagnosis=data.get("diagnosis", "").strip() or None,
            treatment=data.get("treatment", "").strip() or None,
            notes=data["notes"].strip(),
            record_date=datetime.utcnow()
        )

        db.session.add(new_record)
        db.session.commit()

        return jsonify({
            "message": "Doctor note saved successfully",
            "id": new_record.id,
            "record_date": new_record.record_date.isoformat()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Doctor note error: {e}")
        return jsonify({"error": str(e)}), 500



@app.route("/children/<int:child_id>/health-records/prescriptions", methods=["POST"])
@cross_origin()
def add_prescription(child_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data received"}), 400

        child = Child.query.get(child_id)
        if not child:
            return jsonify({"error": "Child not found"}), 404

        if not data.get("medication_name"):
            return jsonify({"error": "Medicine name is required"}), 400

        title = data["medication_name"].strip()
        if data.get("medication_dosage"):
            title += f" - {data['medication_dosage'].strip()}"

        notes_text = data.get("notes", "").strip()
        if data.get("longTerm"):
            notes_text = f"Long-term. {notes_text}".strip()

        new_record = HealthRecord(
            child_id=child_id,
            record_type="Prescription",
            title=title,
            doctor_name=data.get("doctor_name", "").strip() or None,
            medication_name=data["medication_name"].strip(),
            medication_dosage=data.get("medication_dosage", "").strip() or None,
            treatment=data.get("frequency", "").strip() or None,
            notes=notes_text or None,
            record_date=datetime.utcnow()
        )

        db.session.add(new_record)
        db.session.commit()

        return jsonify({
            "message": "Prescription saved successfully",
            "id": new_record.id,
            "record_date": new_record.record_date.isoformat()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Prescription error: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route("/doctor-recent-activity", methods=["GET"])
def get_doctor_recent_activity():
    try:
        activities = []

        def fmt(dt):
            if not dt:
                return ""
            if hasattr(dt, 'isoformat'):
                return dt.isoformat() + "Z"
            return str(dt) + "Z"

        growth_records = GrowthRecord.query.order_by(GrowthRecord.created_at.desc()).limit(5).all()
        for r in growth_records:
            child = Child.query.get(r.child_id)
            if not child:
                continue
            activities.append({
                "type": "Growth Data Recorded",
                "category": "growth",
                "patient": child.name,
                "detail": f"Height: {r.height} cm, Weight: {r.weight} kg, BMI: {r.bmi}",
                "recorded_by": "Doctor",
                "timestamp": fmt(r.created_at or r.record_date)
            })

        vaccinations = Vaccination.query.filter_by(status="completed")\
            .order_by(Vaccination.administered_date.desc()).limit(5).all()
        for v in vaccinations:
            child = Child.query.get(v.child_id)
            if not child:
                continue
            activities.append({
                "type": "Vaccine Administered",
                "category": "vaccination",
                "patient": child.name,
                "detail": f"{v.vaccine_name} — {v.dose_number or 'N/A'} at {v.location or 'clinic'}",
                "recorded_by": v.administered_by or "Doctor",
                "timestamp": fmt(v.administered_date)
            })

        prescriptions = HealthRecord.query.filter_by(record_type="Prescription")\
            .order_by(HealthRecord.created_at.desc()).limit(5).all()
        for p in prescriptions:
            child = Child.query.get(p.child_id)
            if not child:
                continue
            activities.append({
                "type": "Prescription Issued",
                "category": "prescription",
                "patient": child.name,
                "detail": f"{p.medication_name or 'Medicine'} {p.medication_dosage or ''} — {p.treatment or ''}".strip(" —"),
                "recorded_by": p.doctor_name or "Doctor",
                "timestamp": fmt(p.created_at or p.record_date)
            })

        doctor_notes = HealthRecord.query.filter_by(record_type="Doctor Note")\
            .order_by(HealthRecord.created_at.desc()).limit(5).all()
        for n in doctor_notes:
            child = Child.query.get(n.child_id)
            if not child:
                continue
            activities.append({
                "type": "Doctor Note Added",
                "category": "note",
                "patient": child.name,
                "detail": n.title or "Clinical note recorded",
                "recorded_by": n.doctor_name or "Doctor",
                "timestamp": fmt(n.created_at or n.record_date)
            })

        doctor_visits = HealthRecord.query.filter_by(record_type="Doctor Visit")\
            .order_by(HealthRecord.created_at.desc()).limit(5).all()
        for v in doctor_visits:
            child = Child.query.get(v.child_id)
            if not child:
                continue
            activities.append({
                "type": "Patient Visit Recorded",
                "category": "visit",
                "patient": child.name,
                "detail": f"Diagnosis: {v.diagnosis or 'N/A'} — Treatment: {v.treatment or 'N/A'}",
                "recorded_by": v.doctor_name or "Doctor",
                "timestamp": fmt(v.created_at or v.record_date)
            })

        activities.sort(key=lambda x: x["timestamp"], reverse=True)
        return jsonify(activities[:12])

    except Exception as e:
        print(f"Doctor recent activity error: {e}")
        return jsonify({"error": str(e)}), 500
@app.route("/doctor-profile", methods=["GET"])
@jwt_required()
def get_doctor_profile():
    try:
        user_id = int(get_jwt_identity())
        user    = User.query.get(user_id)

        if not user or user.role not in ("doctor", "admin"):
            return jsonify({"message": "Unauthorized"}), 403

        profile = DoctorProfile.query.filter_by(user_id=user_id).first()

        if not profile:
            return jsonify({
                "avatar": None,
                "basic": {
                    "firstName": "", "lastName": "", "title": "Dr.",
                    "gender": "", "dob": "",
                    "phone": user.phone or "", "email": user.email or "", "bio": ""
                },
                "professional": {
                    "specialty": "", "subSpecialty": "", "licenseNumber": "",
                    "licenseExpiry": "", "slmcNumber": "", "yearsExperience": "",
                    "currentHospital": "", "department": "", "consultationFee": ""
                },
                "qualifications":  [],
                "experience":      [],
                "certifications":  [],
                "languages":       [],
                "expertise":       [],
                "publications":    [],
                "availability":    [],
                "emergency": {"available": False, "maxPatients": "", "telehealth": False}
            }), 200

        return jsonify({
            "avatar": profile.avatar,
            "basic": {
                "firstName":  profile.first_name or "",
                "lastName":   profile.last_name  or "",
                "title":      profile.title      or "Dr.",
                "gender":     profile.gender     or "",
                "dob":        profile.dob        or "",
                "phone":      profile.phone      or "",
                "email":      profile.email      or "",
                "bio":        profile.bio        or ""
            },
            "professional": {
                "specialty":       profile.specialty        or "",
                "subSpecialty":    profile.sub_specialty    or "",
                "licenseNumber":   profile.license_number   or "",
                "licenseExpiry":   profile.license_expiry   or "",
                "slmcNumber":      profile.slmc_number      or "",
                "yearsExperience": profile.years_experience or "",
                "currentHospital": profile.current_hospital or "",
                "department":      profile.department       or "",
                "consultationFee": profile.consultation_fee or ""
            },
            "qualifications": [
                {
                    "degree":      q.degree      or "",
                    "institution": q.institution or "",
                    "year":        q.year        or "",
                    "country":     q.country     or ""
                }
                for q in profile.qualifications
            ],
            "experience": [
                {
                    "role":     e.role      or "",
                    "hospital": e.hospital  or "",
                    "from":     e.from_date or "",
                    "to":       e.to_date   or "",
                    "current":  e.current
                }
                for e in profile.experience
            ],
            "certifications": [
                {
                    "name":        c.name         or "",
                    "issuingBody": c.issuing_body or "",
                    "issueDate":   c.issue_date   or "",
                    "expiryDate":  c.expiry_date  or ""
                }
                for c in profile.certifications
            ],
            "languages": [l.language for l in profile.languages],
            "expertise":  [x.area    for x in profile.expertise],
            "publications": [
                {
                    "title":   p.title   or "",
                    "journal": p.journal or "",
                    "year":    p.year    or ""
                }
                for p in profile.publications
            ],
            "availability": [
                {
                    "day":       a.day,
                    "available": a.available,
                    "from":      a.from_time or "09:00",
                    "to":        a.to_time   or "17:00"
                }
                for a in sorted(
                    profile.availability,
                    key=lambda x: _DAYS_ORDER.index(x.day) if x.day in _DAYS_ORDER else 99
                )
            ],
            "emergency": {
                "available":   profile.emergency_available,
                "maxPatients": profile.emergency_max or "",
                "telehealth":  profile.telehealth
            }
        }), 200

    except Exception as e:
        print(f"GET /doctor-profile error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/doctor-profile", methods=["PUT"])
@jwt_required()
def save_doctor_profile():
    try:
        user_id = int(get_jwt_identity())
        user    = User.query.get(user_id)

        if not user or user.role not in ("doctor", "admin"):
            return jsonify({"message": "Unauthorized"}), 403

        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        basic        = data.get("basic",        {})
        professional = data.get("professional", {})
        emergency    = data.get("emergency",    {})

        profile = DoctorProfile.query.filter_by(user_id=user_id).first()
        if not profile:
            profile = DoctorProfile(user_id=user_id)
            db.session.add(profile)
            db.session.flush()

        profile.avatar         = data.get("avatar")
        profile.first_name     = basic.get("firstName", "")
        profile.last_name      = basic.get("lastName",  "")
        profile.title          = basic.get("title",     "Dr.")
        profile.gender         = basic.get("gender",    "")
        profile.dob            = basic.get("dob",       "")
        profile.phone          = basic.get("phone",     "")
        profile.email          = basic.get("email",     "")
        profile.bio            = basic.get("bio",       "")
        profile.specialty        = professional.get("specialty",        "")
        profile.sub_specialty    = professional.get("subSpecialty",     "")
        profile.license_number   = professional.get("licenseNumber",    "")
        profile.license_expiry   = professional.get("licenseExpiry",    "")
        profile.slmc_number      = professional.get("slmcNumber",       "")
        profile.years_experience = professional.get("yearsExperience",  "")
        profile.current_hospital = professional.get("currentHospital",  "")
        profile.department       = professional.get("department",       "")
        profile.consultation_fee = professional.get("consultationFee",  "")
        profile.emergency_available = bool(emergency.get("available",   False))
        profile.emergency_max       = str( emergency.get("maxPatients", ""))
        profile.telehealth          = bool(emergency.get("telehealth",  False))
        profile.updated_at          = datetime.utcnow()

        DoctorQualification.query.filter_by(profile_id=profile.id).delete()
        for q in data.get("qualifications", []):
            db.session.add(DoctorQualification(
                profile_id  = profile.id,
                degree      = q.get("degree",      ""),
                institution = q.get("institution", ""),
                year        = q.get("year",        ""),
                country     = q.get("country",     "")
            ))

        DoctorExperience.query.filter_by(profile_id=profile.id).delete()
        for e in data.get("experience", []):
            db.session.add(DoctorExperience(
                profile_id = profile.id,
                role       = e.get("role",     ""),
                hospital   = e.get("hospital", ""),
                from_date  = e.get("from",     ""),
                to_date    = e.get("to",       ""),
                current    = bool(e.get("current", False))
            ))

        DoctorCertification.query.filter_by(profile_id=profile.id).delete()
        for c in data.get("certifications", []):
            db.session.add(DoctorCertification(
                profile_id   = profile.id,
                name         = c.get("name",        ""),
                issuing_body = c.get("issuingBody", ""),
                issue_date   = c.get("issueDate",   ""),
                expiry_date  = c.get("expiryDate",  "")
            ))

        DoctorLanguage.query.filter_by(profile_id=profile.id).delete()
        for lang in data.get("languages", []):
            db.session.add(DoctorLanguage(profile_id=profile.id, language=lang))

        DoctorExpertise.query.filter_by(profile_id=profile.id).delete()
        for area in data.get("expertise", []):
            db.session.add(DoctorExpertise(profile_id=profile.id, area=area))

        DoctorPublication.query.filter_by(profile_id=profile.id).delete()
        for p in data.get("publications", []):
            db.session.add(DoctorPublication(
                profile_id = profile.id,
                title      = p.get("title",   ""),
                journal    = p.get("journal", ""),
                year       = p.get("year",    "")
            ))

        DoctorAvailability.query.filter_by(profile_id=profile.id).delete()
        for a in data.get("availability", []):
            db.session.add(DoctorAvailability(
                profile_id = profile.id,
                day        = a.get("day",       ""),
                available  = bool(a.get("available", False)),
                from_time  = a.get("from",      "09:00"),
                to_time    = a.get("to",        "17:00")
            ))

        db.session.commit()
        return jsonify({"message": "Profile saved successfully"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"PUT /doctor-profile error: {e}")
        return jsonify({"error": str(e)}), 500


    
_WHO_STANDARDS = {
    'boy': {
        'months':  [0,    3,    6,    9,    12,   15,   18,   21,   24],
        'height':  [49.9, 61.4, 67.6, 72.0, 75.7, 79.1, 82.3, 85.1, 87.8],
        'weight':  [3.3,  6.4,  7.9,  8.9,  9.6,  10.2, 10.9, 11.5, 12.2]
    },
    'girl': {
        'months':  [0,    3,    6,    9,    12,   15,   18,   21,   24],
        'height':  [49.1, 59.8, 65.7, 70.1, 74.0, 77.5, 80.7, 83.7, 86.4],
        'weight':  [3.2,  5.8,  7.3,  8.2,  8.9,  9.6,  10.2, 10.9, 11.5]
    }
}

@app.route('/who-standards/<gender>', methods=['GET'])
@jwt_required()
def who_standards(gender):
    key = 'boy' if gender.lower() in ('male', 'm', 'boy') else 'girl'
    return jsonify(_WHO_STANDARDS[key])


@app.route('/predict-growth/<int:child_id>', methods=['GET'])
@jwt_required()
def predict_growth_for_child(child_id):
    try:
        import numpy as np
        child = Child.query.get(child_id)
        if not child:
            return jsonify({"error": "Child not found"}), 404

        records = (GrowthRecord.query.filter_by(child_id=child.id)
                   .order_by(GrowthRecord.record_date.asc()).all())
        if not records:
            return jsonify({"error": "No growth records found. Please add measurements first."}), 400

        dob = child.date_of_birth
        visits = []
        for r in records:
            rd = r.record_date.date() if hasattr(r.record_date, 'date') else r.record_date
            age_months = (rd.year - dob.year) * 12 + (rd.month - dob.month)
            if r.height and r.weight:
                visits.append({"age_months": age_months, "height": r.height, "weight": r.weight})

        if not visits:
            return jsonify({"error": "No valid height/weight records found."}), 400

        gender = "male" if child.gender.upper() in ('M', 'MALE', 'BOY') else "female"
        gender_str = 'boy' if gender == 'male' else 'girl'
        CHECKPOINTS = [0, 3, 6, 9, 12, 15, 18, 21, 24]
        last_age = visits[-1]['age_months']
        future = [m for m in CHECKPOINTS if m > last_age]
        who = _WHO_STANDARDS[gender_str]

        try:
            predictor = _get_growth_predictor()
            if predictor is None:
                raise RuntimeError("ML model unavailable — see Flask startup logs")
            result = predictor.predict(visits=visits, gender=gender)
        except Exception as ml_err:
            print(f"[ML] Fallback for child {child_id}: {ml_err}")
            last_h = visits[-1]['height']
            last_w = visits[-1]['weight']
            h_ratio = last_h / np.interp(last_age, who['months'], who['height'])
            w_ratio = last_w / np.interp(last_age, who['months'], who['weight'])
            predictions = [{"age_months": m,
                "height": round(float(np.interp(m, who['months'], who['height']) * h_ratio), 1),
                "weight": round(float(np.interp(m, who['months'], who['weight']) * w_ratio), 2)}
                for m in future]
            result = {"actuals": visits, "predictions": predictions,
                      "who_median": who, "gender": gender_str, "model_used": "who_fallback"}

        return jsonify(result), 200
    except Exception as e:
        print(f"[PredictGrowthChild] Error: {e}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


@app.route('/predict-growth', methods=['POST'])
@jwt_required()
def predict_growth():
    try:
        import numpy as np
        parent_id = get_jwt_identity()
        child = Child.query.filter_by(parent_id=parent_id).first()
        if not child:
            return jsonify({"error": "Child not found"}), 404

        records = (GrowthRecord.query.filter_by(child_id=child.id)
                   .order_by(GrowthRecord.record_date.asc()).all())
        if not records:
            return jsonify({"error": "No growth records found. Please add measurements first."}), 400

        dob = child.date_of_birth
        visits = []
        for r in records:
            rd = r.record_date.date() if hasattr(r.record_date, 'date') else r.record_date
            age_months = (rd.year - dob.year) * 12 + (rd.month - dob.month)
            if r.height and r.weight:
                visits.append({"age_months": age_months, "height": r.height, "weight": r.weight})

        if not visits:
            return jsonify({"error": "No valid height/weight records found."}), 400

        gender = "male" if child.gender.upper() in ('M', 'MALE', 'BOY') else "female"
        gender_str = 'boy' if gender == 'male' else 'girl'
        CHECKPOINTS = [0, 3, 6, 9, 12, 15, 18, 21, 24]
        last_age = visits[-1]['age_months']
        future = [m for m in CHECKPOINTS if m > last_age]
        who = _WHO_STANDARDS[gender_str]

        try:
            predictor = _get_growth_predictor()
            if predictor is None:
                raise RuntimeError("ML model unavailable — see Flask startup logs")
            result = predictor.predict(visits=visits, gender=gender)
        except Exception as ml_err:
            print(f"[ML] Model not available ({ml_err}), using WHO fallback.")
            last_h = visits[-1]['height']
            last_w = visits[-1]['weight']
            h_ratio = last_h / np.interp(last_age, who['months'], who['height'])
            w_ratio = last_w / np.interp(last_age, who['months'], who['weight'])
            predictions = [{"age_months": m,
                "height": round(float(np.interp(m, who['months'], who['height']) * h_ratio), 1),
                "weight": round(float(np.interp(m, who['months'], who['weight']) * w_ratio), 2)}
                for m in future]
            result = {"actuals": visits, "predictions": predictions,
                      "who_median": who, "gender": gender_str, "model_used": "who_fallback"}

        return jsonify(result), 200
    except Exception as e:
        print(f"[PredictGrowth] Error: {e}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


@app.route('/doctor/ai-insights/<int:child_id>', methods=['GET'])
@jwt_required()
def doctor_ai_insights(child_id):
    
    import json as _json

    try:
        child = Child.query.get(child_id)
        if not child:
            return jsonify({"error": "Child not found"}), 404

        today = date.today()
        age_months = (today.year - child.date_of_birth.year) * 12 + (today.month - child.date_of_birth.month)
        if today.day < child.date_of_birth.day:
            age_months -= 1

        growth_records = (GrowthRecord.query.filter_by(child_id=child_id)
                          .order_by(GrowthRecord.record_date.asc()).all())
        vaccinations   = Vaccination.query.filter_by(child_id=child_id).all()
        health_notes   = (HealthNote.query.filter_by(child_id=child_id)
                          .order_by(HealthNote.record_date.desc()).limit(20).all())
        milestones     = Milestone.query.filter_by(child_id=child_id).all()
        allergies         = [a.name for a in child.allergies]
        active_conditions = [c.name for c in child.active_conditions]

        growth_summary = []
        for r in growth_records[-8:]:
            rd = r.record_date.date() if hasattr(r.record_date, 'date') else r.record_date
            rec_age = (rd.year - child.date_of_birth.year) * 12 + (rd.month - child.date_of_birth.month)
            growth_summary.append(
                f"Age {rec_age}mo: weight={r.weight}kg, height={r.height}cm"
                + (f", head={r.head_circumference}cm" if r.head_circumference else "")
                + (f", notes='{r.notes}'" if r.notes else "")
            )

        vacc_given   = [v.vaccine_name for v in vaccinations if v.status == 'administered']
        vacc_pending = [v.vaccine_name for v in vaccinations if v.status != 'administered']

        notes_summary = []
        for h in health_notes[:10]:
            entry = f"[{h.record_date.date() if hasattr(h.record_date,'date') else h.record_date}] {h.record_type}"
            if h.title:           entry += f" — {h.title}"
            if h.description:     entry += f": {h.description[:200]}"
            if h.temperature:     entry += f" (temp: {h.temperature}°C)"
            if h.severity:        entry += f" severity={h.severity}"
            if h.medication_name: entry += f", medication={h.medication_name} {h.medication_dosage or ''}"
            notes_summary.append(entry)

        milestone_achieved = [m.category for m in milestones if m.achieved_date]
        milestone_pending  = [m.category for m in milestones if not m.achieved_date]

        prompt = f"""
You are an expert pediatric AI clinical decision support system for Sri Lankan doctors.
Analyse the following REAL patient data and return ONLY a valid JSON object — no markdown, no explanation.

PATIENT DATA:
- Name: {child.name}
- Age: {age_months} months
- Gender: {child.gender}
- Date of Birth: {child.date_of_birth}
- Allergies: {', '.join(allergies) if allergies else 'None known'}
- Active Conditions: {', '.join(active_conditions) if active_conditions else 'None recorded'}

GROWTH HISTORY (chronological):
{chr(10).join(growth_summary) if growth_summary else 'No growth records available'}

VACCINATION STATUS:
- Given: {', '.join(vacc_given) if vacc_given else 'None recorded'}
- Pending/Overdue: {', '.join(vacc_pending) if vacc_pending else 'None'}

HEALTH NOTES & VISITS (most recent first):
{chr(10).join(notes_summary) if notes_summary else 'No health notes recorded'}

DEVELOPMENTAL MILESTONES:
- Achieved: {', '.join(set(milestone_achieved)) if milestone_achieved else 'None recorded'}
- Pending:  {', '.join(set(milestone_pending))  if milestone_pending  else 'None'}

Return EXACTLY this JSON structure (base all fields on the real data above):

{{
  "aiConfidence": <integer 0-100>,
  "dataPoints": <integer count of data points analysed>,
  "lastAnalyzed": "Just now",
  "insights": {{
    "criticalAlerts": [{{ "id":1, "severity":"<high|medium|low>", "title":"...", "probability":<int>,
      "timeframe":"...", "reasoning":["..."], "recommendation":"...", "evidenceBased":"..." }}],
    "redFlags": [{{ "flag":"...", "status":"<Monitor|Action Required|Resolved>", "details":"...", "action":"..." }}],
    "aiRecommendations": [{{ "type":"<Clinical Action|Preventive|Educational|Referral>",
      "priority":"<High|Medium|Low>", "title":"...", "rationale":"...", "timing":"...", "automated":<bool> }}]
  }},
  "diagnostics": {{
    "diagnosticSupport": [{{ "symptomCluster":"...", "likelyDiagnoses":[{{"condition":"...","probability":<int>,"confidence":"..."}}],
      "differentialFactors":["..."], "suggestedTests":["..."] }}],
    "medicationAnalysis": {{
      "currentMedications": [{{"name":"...","adherence":<int>,"effectiveness":"...","sideEffects":"...","aiInsight":"...","durationAnalysis":"..."}}],
      "interactions":[], "alternatives":[]
    }}
  }},
  "patterns": {{
    "patternRecognition": [{{"pattern":"...","finding":"...","visualData":"...","clinicalAction":"...","confidence":<int>}}],
    "populationComparison": {{
      "similarCases":<int>,
      "outcomeData":[{{"metric":"...","thisPatient":<number>,"cohortAverage":<number>,"status":"..."}}],
      "successfulProtocols":["..."]
    }}
  }},
  "compliance": {{
    "overallAdherence":<int 0-100>,
    "missedDoses":<int>,
    "patterns":[{{"issue":"...","frequency":"...","suggestion":"..."}}],
    "parentEngagement":{{"appUsage":"...","logCompleteness":<int>,"responseTime":"...","concernLevel":"..."}}
  }},
  "literatureInsights": [{{"topic":"...","finding":"...","relevance":"...","citation":"...","action":"..."}}]
}}
"""
        model    = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        raw      = clean_ai_response(response.text).strip()

        try:
            data = _json.loads(raw)
        except _json.JSONDecodeError:
            import re
            match = re.search(r'\{.*\}', raw, re.DOTALL)
            if match:
                data = _json.loads(match.group())
            else:
                return jsonify({"error": "AI returned invalid JSON", "raw": raw[:500]}), 500

        return jsonify(data), 200

    except Exception as e:
        print(f"[DoctorAIInsights] Error: {e}")
        err = str(e).lower()
        if "api_key" in err or ("invalid" in err and "key" in err):
            return jsonify({"error": str(e), "error_type": "invalid_api_key",
                "error_title": "Gemini API Key Invalid",
                "error_detail": "The GEMINI_API_KEY in your .env file is missing or incorrect.",
                "error_fix": "Open backend/.env and set GEMINI_API_KEY=your_key_here, then restart the backend."}), 500
        elif "quota" in err or "rate" in err or "limit" in err or "429" in err:
            return jsonify({"error": str(e), "error_type": "quota_exceeded",
                "error_title": "API Quota Exceeded",
                "error_detail": "Your Gemini API quota or rate limit has been reached.",
                "error_fix": "Wait a few minutes and try again, or check your quota at aistudio.google.com."}), 429
        elif "permission" in err or "403" in err or "forbidden" in err:
            return jsonify({"error": str(e), "error_type": "permission_denied",
                "error_title": "API Permission Denied",
                "error_detail": "Your API key does not have access to the Gemini model.",
                "error_fix": "Ensure the Gemini API is enabled in your Google Cloud project."}), 403
        elif "connect" in err or "network" in err or "timeout" in err:
            return jsonify({"error": str(e), "error_type": "network_error",
                "error_title": "Network Error",
                "error_detail": "Could not reach the Gemini API. Check your internet connection.",
                "error_fix": "Ensure the backend server has internet access and try again."}), 503
        else:
            return jsonify({"error": str(e), "error_type": "unknown",
                "error_title": "AI Analysis Failed",
                "error_detail": str(e),
                "error_fix": "Check the backend console for more details."}), 500



# Admin Management Routes

@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
def get_admin_users():
    try:
        user_id = get_jwt_identity()
        current_user = db.session.get(User, int(user_id))
        
        if not current_user or current_user.role.lower() != 'admin':
            return jsonify({"message": "Unauthorized"}), 403

        users = User.query.all()
        return jsonify([
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "phone": u.phone,
                "MOH_ID": u.MOH_ID, 
                "role": u.role
            } for u in users
        ]), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@app.route('/api/admin/create-user', methods=['POST'])
@jwt_required()
def create_staff_user():
    try:
        user_id = get_jwt_identity()
        admin = db.session.get(User, int(user_id))
        if not admin or admin.role.lower() != 'admin':
            return jsonify({"message": "Unauthorized"}), 403

        data = request.get_json()
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"message": "Email already registered"}), 400

        new_user = User(
            username=data['username'],
            email=data['email'],
            phone=data.get('phone'),
            MOH_ID=data.get('moh_id') or data.get('MOH_ID'),
            role=data.get('role', 'doctor'),
            password_hash=generate_password_hash(data['password'])
        )
        
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Staff created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    try:
        admin_id = get_jwt_identity()
        admin = db.session.get(User, int(admin_id))
        if not admin or admin.role.lower() != 'admin':
            return jsonify({"message": "Unauthorized"}), 403

        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        data = request.get_json()

        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        user.phone = data.get('phone', user.phone)
        user.MOH_ID = data.get('moh_id', user.MOH_ID) or data.get('MOH_ID', user.MOH_ID)
        user.role = data.get('role', user.role)

        if data.get('password'):
            user.password_hash = generate_password_hash(data['password'])

        if user.role.lower() == 'parent':
            reg = PendingRegistration.query.filter_by(mother_email=user.email).first()
            if reg:
                reg.child_name = data.get('child_name', reg.child_name)
                reg.nationality = data.get('nationality', reg.nationality)
                reg.child_number = data.get('child_number', reg.child_number)
                reg.language = data.get('language', reg.language)
                reg.mother_name = data.get('username', reg.mother_name)
                reg.mother_phone = data.get('phone', reg.mother_phone)
                reg.birth_location = data.get('birth_location', reg.birth_location)
                reg.birth_hospital = data.get('birth_hospital', reg.birth_hospital)
                reg.delivery_type = data.get('delivery_type', reg.delivery_type)
                reg.surgery = data.get('surgery', reg.surgery)
                
                if data.get('birth_weight'): 
                    reg.birth_weight = float(data['birth_weight'])
                if data.get('birth_length'): 
                    reg.birth_length = float(data['birth_length'])
                if data.get('head_circumference'): 
                    reg.head_circumference = float(data['head_circumference'])
                
                reg.personnel_type = data.get('personnel_type', reg.personnel_type)
                reg.personnel_name = data.get('personnel_name', reg.personnel_name)
                reg.living_address = data.get('living_address', reg.living_address)
                reg.registration_number = data.get('registration_number', reg.registration_number)

                if data.get('child_dob'):
                    reg.child_dob = datetime.strptime(data['child_dob'], "%Y-%m-%d").date()
                if data.get('mother_dob'):
                    reg.mother_dob = datetime.strptime(data['mother_dob'], "%Y-%m-%d").date()
                if data.get('registration_date'):
                    reg.registration_date = datetime.strptime(data['registration_date'], "%Y-%m-%d").date()

        db.session.commit()
        return jsonify({"message": "User updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    try:
        current_admin_id = int(get_jwt_identity())
        admin_user = db.session.get(User, current_admin_id)
        
        if not admin_user or admin_user.role.lower() != 'admin':
            return jsonify({"message": "Unauthorized"}), 403

        if user_id == current_admin_id:
            return jsonify({"message": "Cannot delete your own account"}), 400

        user_to_delete = db.session.get(User, user_id)
        if not user_to_delete:
            return jsonify({"message": "User not found"}), 404

        db.session.delete(user_to_delete)
        db.session.commit()
        
        return jsonify({"message": "User deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500
    
    
@app.route('/api/admin/dashboard-stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    try:
        user_id = get_jwt_identity()
        current_user = db.session.get(User, int(user_id))
        
        if not current_user or current_user.role.lower() != 'admin':
            return jsonify({"message": "Unauthorized"}), 403

        total_users = User.query.count()
        total_doctors = User.query.filter(User.role.ilike('%doctor%')).count()
        users_with_phones = User.query.filter(User.phone.isnot(None), User.phone != '').count()

        total_events = Event.query.count()
        
        try:
            total_children = Child.query.count()
        except Exception:
            total_children = 0 

        all_users = User.query.all()
        role_counts = {}
        action_required = []
        
        for u in all_users:
            role = u.role or 'Unknown'
            role_counts[role] = role_counts.get(role, 0) + 1
            
            missing_fields = []
            if not u.phone or str(u.phone).strip() == '':
                missing_fields.append('Phone Number')
            
            is_doctor = u.role and 'doctor' in u.role.lower()
            if is_doctor and (not u.MOH_ID or str(u.MOH_ID).strip() == ''):
                missing_fields.append('MOH ID')
            
            if missing_fields:
                action_required.append({
                    "id": u.id,
                    "username": u.username,
                    "role": u.role or "N/A",
                    "missing": ", ".join(missing_fields)
                })
                
        chart_data = [{"name": k.upper(), "value": v} for k, v in role_counts.items()]

        recent_users_query = User.query.order_by(User.id.desc()).limit(5).all()
        recent_users = [
            {
                "id": u.id, 
                "username": u.username, 
                "role": u.role or "N/A", 
                "email": u.email
            } for u in recent_users_query
        ]

        reg_data = [
            {"name": "Sep", "users": 12},
            {"name": "Oct", "users": 19},
            {"name": "Nov", "users": 14},
            {"name": "Dec", "users": 8},
            {"name": "Jan", "users": 23},
            {"name": "Feb", "users": 31}
        ]

        return jsonify({
            "adminName": current_user.username, 
            "totalUsers": total_users,
            "activeDoctors": total_doctors,
            "totalChildren": total_children,
            "totalEvents": total_events,
            "chartData": chart_data,
            "registrationData": reg_data,
            "recentUsers": recent_users,
            "actionRequired": action_required[:5]
        }), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 500
    
@app.route('/api/admin/events', methods=['GET'])
def get_events():
    try:
        today = date.today()
        one_month_ago = today - relativedelta(months=1)
        events = Event.query.filter(Event.date >= one_month_ago).order_by(Event.date.asc()).all()

        results = []
        for e in events:
            if e.date > today:
                status = "Upcoming"
            elif e.date == today:
                status = "Ongoing"
            else:
                status = "Finished"

            results.append({
                "id": e.id,
                "title": e.title,
                "type": e.event_type,
                "date": e.date.strftime('%Y-%m-%d'),
                "location": e.location,
                "description": e.description,
                "status": status
            })
        return jsonify(results), 200
    except Exception as ex:
        return jsonify({"error": str(ex)}), 500

@app.route('/api/admin/events', methods=['POST'])
def create_event():
    try:
        data = request.get_json()
        event_date = datetime.strptime(data['date'], '%Y-%m-%d').date()

        new_event = Event(
            title=data['title'],
            event_type=data['type'],
            date=event_date,
            location=data['location'],
            description=data.get('description', '')
        )
        db.session.add(new_event)
        db.session.commit()
        return jsonify({"message": "Event created!"}), 201
    except Exception as ex:
        db.session.rollback()
        return jsonify({"error": str(ex)}), 500

@app.route('/api/admin/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    try:
        event = Event.query.get(event_id)
        if not event:
            return jsonify({"error": "Event not found"}), 404
        db.session.delete(event)
        db.session.commit()
        return jsonify({"message": "Event deleted!"}), 200
    except Exception as ex:
        db.session.rollback()
        return jsonify({"error": str(ex)}), 500


# Pending Registrations Management Routes
@app.route("/pending_registrations", methods=["GET", "OPTIONS"])
@cross_origin()
@jwt_required(optional=True)
def list_pending_registrations():
    # respond to preflight without requiring token
    if request.method == "OPTIONS":
        return jsonify({}), 200

    user = User.query.get(get_jwt_identity())
    if not user or user.role not in ("doctor", "admin", "nurse"):
        return jsonify({"message": "Unauthorized access"}), 403

    pendings = PendingRegistration.query.filter_by(status="PENDING").all()
    out = []
    for p in pendings:
        out.append({
            "id": p.id,
            "registration_number": p.registration_number,
            "child_name": p.child_name,
            "child_dob": p.child_dob.isoformat() if p.child_dob else None,
            "gender": p.child_gender,
            "nationality": p.nationality,
            "child_number": p.child_number,
            "language": p.language,
            "mother_name": p.mother_name,
            "mother_dob": p.mother_dob.isoformat() if p.mother_dob else None,
            "mother_email": p.mother_email,
            "mother_phone": p.mother_phone,
            "birth_location": p.birth_location,
            "birth_hospital": p.birth_hospital,
            "delivery_type": p.delivery_type,
            "surgery": p.surgery,
            "birth_weight": p.birth_weight,
            "birth_length": p.birth_length,
            "head_circumference": p.head_circumference,
            "personnel_type": p.personnel_type,
            "personnel_name": p.personnel_name,
            "living_address": p.living_address,
            "registration_date": p.registration_date.isoformat() if p.registration_date else None,
            "status": p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "updated_at": p.updated_at.isoformat() if p.updated_at else None,
            "username": p.username,
        })
    return jsonify(out)

@app.route('/pending_registration', methods=['POST', 'OPTIONS'])
@cross_origin()
def create_pending_registration():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided"}), 400
    
    required_fields = [
        'registrationNumber', 'username', 'password', 'childName', 'childDOB', 
        'nationality', 'childNumber', 'language', 'motherName', 'motherDOB', 
        'motherEmail', 'motherPhone', 'birthLocation', 'birthHospital', 
        'deliveryType', 'surgery', 'birthWeight', 'birthLength', 
        'headCircumference', 'personnelType', 'personnelName', 'livingAddress'
    ]
    
    for field in required_fields:
        if field not in data:
            return jsonify({"message": f"Missing required field: {field}"}), 400
    
    # Check if username or registration number already exists
    existing_user = User.query.filter_by(username=data['username']).first()
    if existing_user:
        return jsonify({"message": "Username already exists"}), 400
    
    existing_reg = PendingRegistration.query.filter_by(registration_number=data['registrationNumber']).first()
    if existing_reg:
        return jsonify({"message": "Registration number already exists"}), 400
    
    try:
        # Parse dates
        child_dob = datetime.strptime(data['childDOB'], '%Y-%m-%d').date()
        mother_dob = datetime.strptime(data['motherDOB'], '%Y-%m-%d').date()
        registration_date = date.today()
        
        # Hash password
        password_hash = generate_password_hash(data['password'])
        
        new_registration = PendingRegistration(
            username=data['username'],
            password_hash=password_hash,
            registration_number=data['registrationNumber'],
            child_name=data['childName'],
            child_dob=child_dob,
            child_gender=data.get('gender', 'Unknown'),
            nationality=data['nationality'],
            child_number=data['childNumber'],
            language=data['language'],
            mother_name=data['motherName'],
            mother_dob=mother_dob,
            mother_email=data['motherEmail'],
            mother_phone=data['motherPhone'],
            birth_location=data['birthLocation'],
            birth_hospital=data['birthHospital'],
            delivery_type=data['deliveryType'],
            surgery=data['surgery'],
            birth_weight=float(data['birthWeight']),
            birth_length=float(data['birthLength']),
            head_circumference=float(data['headCircumference']),
            personnel_type=data['personnelType'],
            personnel_name=data['personnelName'],
            living_address=data['livingAddress'],
            registration_date=registration_date,
            status='PENDING'
        )
        
        db.session.add(new_registration)
        db.session.commit()
        
        return jsonify({"message": "Registration submitted successfully", "registration_number": data['registrationNumber']}), 201
    
    except ValueError as e:
        return jsonify({"message": f"Invalid data format: {str(e)}"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Internal server error: {str(e)}"}), 500

@app.route('/pending_registrations/approve/<int:registration_id>', methods=['POST'])
@cross_origin()
@jwt_required()
def approve_registration(registration_id):
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    if not current_user or current_user.role.lower() not in ['admin', 'doctor']:
        return jsonify({"message": "Unauthorized"}), 403
    pending = PendingRegistration.query.get_or_404(registration_id)
    if pending.status != 'PENDING':
        return jsonify({'error': 'Registration already processed'}), 400
    try:
        # Create User
        new_user = User(
            username=pending.username,
            password_hash=pending.password_hash,
            email=pending.mother_email,
            phone=pending.mother_phone,
            role='parent',
            MOH_ID=pending.registration_number
        )
        db.session.add(new_user)
        db.session.flush()
        # Create Child
        child = Child(
            parent_id=new_user.id,
            name=pending.child_name,
            date_of_birth=pending.child_dob,
            gender=pending.child_gender
        )
        db.session.add(child)
        # create initial growth record
        growth_record = GrowthRecord(
            child=child,
            record_date=pending.child_dob,
            height=pending.birth_length,
            weight=pending.birth_weight,
            head_circumference=pending.head_circumference,
            notes="Initial measurements at birth"
        )
        db.session.add(growth_record)
        # Create RegisteredPatient
        new_registered = RegisteredPatient(
            user_id=new_user.id,
            registration_number=pending.registration_number,
            child_name=pending.child_name,
            child_dob=pending.child_dob,
            child_gender=pending.child_gender,
            nationality=pending.nationality,
            child_number=pending.child_number,
            language=pending.language,
            mother_name=pending.mother_name,
            mother_dob=pending.mother_dob,
            mother_email=pending.mother_email,
            mother_phone=pending.mother_phone,
            birth_location=pending.birth_location,
            birth_hospital=pending.birth_hospital,
            delivery_type=pending.delivery_type,
            surgery=pending.surgery,
            birth_weight=pending.birth_weight,
            birth_length=pending.birth_length,
            head_circumference=pending.head_circumference,
            personnel_type=pending.personnel_type,
            personnel_name=pending.personnel_name,
            living_address=pending.living_address,
            registration_date=pending.registration_date,
            status='APPROVED'
        )
        db.session.add(new_registered)
        db.session.delete(pending)
        # Update pending status
        pending.status = 'APPROVED'
        db.session.commit()
        return jsonify({'message': 'Registration approved successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/pending_registrations/decline/<int:registration_id>', methods=['POST'])
@cross_origin()
@jwt_required()
def decline_registration(registration_id):
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    if not current_user or current_user.role.lower() not in ['admin', 'doctor']:
        return jsonify({"message": "Unauthorized"}), 403
    data = request.get_json()
    reason = data.get('reason', '')
    if not reason:
        return jsonify({'error': 'Reason is required for decline'}), 400
    pending = PendingRegistration.query.get_or_404(registration_id)
    if pending.status != 'PENDING':
        return jsonify({'error': 'Registration already processed'}), 400
    try:
        # Create DeclinedRegistration
        new_declined = DeclinedRegistration(
            username=pending.username,
            password_hash=pending.password_hash,
            registration_number=pending.registration_number,
            child_name=pending.child_name,
            child_dob=pending.child_dob,
            child_gender=pending.child_gender,
            nationality=pending.nationality,
            child_number=pending.child_number,
            language=pending.language,
            mother_name=pending.mother_name,
            mother_dob=pending.mother_dob,
            mother_email=pending.mother_email,
            mother_phone=pending.mother_phone,
            birth_location=pending.birth_location,
            birth_hospital=pending.birth_hospital,
            delivery_type=pending.delivery_type,
            surgery=pending.surgery,
            birth_weight=pending.birth_weight,
            birth_length=pending.birth_length,
            head_circumference=pending.head_circumference,
            personnel_type=pending.personnel_type,
            personnel_name=pending.personnel_name,
            living_address=pending.living_address,
            registration_date=pending.registration_date,
            status='DECLINED',
            reason=reason
        )
        db.session.add(new_declined)
        db.session.delete(pending)
        # Update pending status
        pending.status = 'DECLINED'
        db.session.commit()
        return jsonify({'message': 'Registration declined successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/search_registration/<string:reg_num>', methods=['GET'])
@jwt_required()
def search_registration(reg_num):
    try:
        # Helper to convert model object to dictionary for all columns
        def to_dict(obj):
            return {c.name: getattr(obj, c.name).isoformat() if isinstance(getattr(obj, c.name), (date, datetime)) else getattr(obj, c.name) for c in obj.__table__.columns}

        # 1. Check Pending
        pending = PendingRegistration.query.filter_by(registration_number=reg_num).first()
        if pending:
            return jsonify({"type": "PENDING", "data": to_dict(pending)}), 200

        # 2. Check Registered
        registered = RegisteredPatient.query.filter_by(registration_number=reg_num).first()
        if registered:
            return jsonify({"type": "REGISTERED", "data": to_dict(registered)}), 200

        # 3. Check Declined
        declined = DeclinedRegistration.query.filter_by(registration_number=reg_num).first()
        if declined:
            return jsonify({"type": "DECLINED", "data": to_dict(declined)}), 200

        return jsonify({"message": "No record found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/report-request', methods=['POST'])
@jwt_required()
def create_report_request():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        name = (data.get('name') or '').strip()
        child_id_number = (data.get('child_id_number') or '').strip()
        phone = (data.get('phone') or '').strip()
        email = (data.get('email') or '').strip()
        reports_requested = data.get('reports_requested', [])

        if not name:
            return jsonify({'error': 'Child name is required'}), 400
        if not (data.get('requested_by') or '').strip():
            return jsonify({'error': 'Requester name (Who request) is required'}), 400
        if not child_id_number:
            return jsonify({'error': 'Child ID is required'}), 400
        if not phone:
            return jsonify({'error': 'Phone number is required'}), 400
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        if not reports_requested:
            return jsonify({'error': 'Please select at least one report'}), 400

        date_part = datetime.utcnow().strftime('%Y%m%d')
        unique_part = _uuid.uuid4().hex[:6].upper()
        report_request_id = f'RR-{date_part}-{unique_part}'

        while ReportRequest.query.filter_by(report_request_id=report_request_id).first():
            unique_part = _uuid.uuid4().hex[:6].upper()
            report_request_id = f'RR-{date_part}-{unique_part}'

        new_request = ReportRequest(
            report_request_id=report_request_id,
            user_id=int(user_id),
            requested_by=(data.get('requested_by') or '').strip(),
            name=name,
            child_id_number=child_id_number,
            phone=phone,
            email=email,
            reports_requested=_json.dumps(reports_requested),
            status='Pending'
        )
        db.session.add(new_request)
        db.session.commit()

        return jsonify({
            'message': 'Report request submitted successfully',
            'report_request_id': report_request_id
        }), 201

    except Exception as e:
        db.session.rollback()
        print('Create Report Request Error:', e)
        return jsonify({'error': str(e)}), 500


@app.route('/report-requests', methods=['GET'])
@jwt_required()
def get_report_requests():
    try:
        user_id = get_jwt_identity()
        requests_list = ReportRequest.query.filter_by(user_id=int(user_id)).order_by(
            ReportRequest.created_at.desc()
        ).all()

        result = []
        for r in requests_list:
            result.append({
                'id': r.id,
                'report_request_id': r.report_request_id,
                'requested_by': r.requested_by,
                'name': r.name,
                'child_id_number': r.child_id_number,
                'phone': r.phone,
                'email': r.email,
                'reports_requested': _json.loads(r.reports_requested),
                'status': r.status,
                'description': r.description,
                'review_date': r.review_date.isoformat() if r.review_date else None,
                'reviewed_by': r.reviewed_by,
                'collection_date': r.collection_date,
                'created_at': r.created_at.isoformat()
            })

        return jsonify(result), 200

    except Exception as e:
        print('Get Report Requests Error:', e)
        return jsonify({'error': str(e)}), 500


@app.route('/admin/report-requests', methods=['GET'])
@jwt_required()
def admin_get_report_requests():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or user.role not in ['doctor', 'nurse', 'admin']:
            return jsonify({'message': 'Unauthorized'}), 403

        requests_list = ReportRequest.query.order_by(ReportRequest.created_at.desc()).all()

        result = []
        for r in requests_list:
            result.append({
                'id': r.id,
                'report_request_id': r.report_request_id,
                'requested_by': r.requested_by,
                'name': r.name,
                'child_id_number': r.child_id_number,
                'phone': r.phone,
                'email': r.email,
                'reports_requested': _json.loads(r.reports_requested),
                'status': r.status,
                'description': r.description,
                'review_date': r.review_date.isoformat() if r.review_date else None,
                'reviewed_by': r.reviewed_by,
                'collection_date': r.collection_date,
                'created_at': r.created_at.isoformat()
            })

        return jsonify(result), 200

    except Exception as e:
        print('Admin Get Report Requests Error:', e)
        return jsonify({'error': str(e)}), 500


@app.route('/admin/report-requests/review/<int:request_id>', methods=['POST'])
@jwt_required()
def review_report_request(request_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or user.role not in ['doctor', 'nurse', 'admin']:
            return jsonify({'message': 'Unauthorized'}), 403

        data = request.get_json()
        report_request = ReportRequest.query.get(request_id)
        if not report_request:
            return jsonify({'message': 'Report request not found'}), 404

        action = data.get('action') # 'approve' or 'reject'
        description = data.get('description', '').strip()
        collection_date = data.get('collection_date', '').strip()

        if action not in ['approve', 'reject']:
            return jsonify({'message': 'Invalid action'}), 400

        report_request.status = 'Approved' if action == 'approve' else 'Rejected'
        report_request.description = description
        report_request.collection_date = collection_date
        report_request.reviewed_by = user.username
        report_request.review_date = datetime.utcnow()

        db.session.commit()

        return jsonify({'message': f'Report request {report_request.status.lower()} successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print('Review Report Request Error:', e)
        return jsonify({'error': str(e)}), 500


@app.route('/report-requests/cancel/<int:request_id>', methods=['POST'])
@jwt_required()
def cancel_report_request(request_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or user.role != 'parent':
            return jsonify({'message': 'Unauthorized'}), 403

        report_request = ReportRequest.query.filter_by(id=request_id, user_id=user.id).first()
        if not report_request:
            return jsonify({'message': 'Report request not found'}), 404

        if report_request.status != 'Pending':
            return jsonify({'message': 'Cannot cancel a request that has already been reviewed'}), 400

        db.session.delete(report_request)
        db.session.commit()

        return jsonify({'message': 'Report request cancelled successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print('Cancel Report Request Error:', e)
        return jsonify({'error': str(e)}), 500


# SocketIO and Main Block 
@socketio.on("connect")
def handle_connect(auth):
    token = auth.get("token")
    try:
        decoded = decode_token(token)
        user_id = decoded["sub"]
        join_room(f"user_{user_id}")
    except Exception as e:
        print("Socket connection error:", e)

if __name__ == '__main__':
    _get_growth_predictor()
    socketio.run(app, debug=True, port=5000)
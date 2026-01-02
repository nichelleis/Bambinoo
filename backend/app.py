from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta,datetime
import os
from flask_cors import CORS
from flask_jwt_extended import (JWTManager, create_access_token, jwt_required, get_jwt_identity)
from werkzeug.security import check_password_hash
from flask import session

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)


BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'bambinoo.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'bambinoo-secret-key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=6)


app.secret_key = "3245567562534q4534635q"


db = SQLAlchemy(app)
jwt = JWTManager(app)


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    role = db.Column(db.String(50), nullable=False, default='parent')


class Child(db.Model):
    __tablename__ = 'child'
    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(10), nullable=False)

    
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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


    

with app.app_context():
    db.create_all()

# Login route
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        username = data.get('username')   
        password = data.get('password')

        user = User.query.filter_by(username=username).first()

        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({"message": "Invalid username or password"}), 401

        token = create_access_token(identity=user.id)

        session['user_id'] = user.id

        return jsonify({
            "token": token,
            "user": {
                "id": user.id,
                "username": user.username,
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
def get_child():

    user_id = session.get('user_id')

    if not user_id:
        return jsonify({"message": "Not logged in"}), 401
    
    child = Child.query.filter_by(parent_id=user_id).first()
    
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



if __name__ == "__main__":
    app.run(debug=True)


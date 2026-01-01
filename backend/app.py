from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta,datetime
import os

app = Flask(__name__)


BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'bambinoo.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db = SQLAlchemy(app)


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




if __name__ == "__main__":
    app.run(debug=True)


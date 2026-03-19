# Tests - Performance Tests by simulating concurrent parent, doctor, nurse, and admin users performing typical tasks
# Covers NFR3 - Performance

# if anyone forgets how to run, in the test folder: locust -f locustfile.py --host=http://localhost:5000 --headless -u 50 -r 5 --run-time 60s

from locust import HttpUser, task, between
from datetime import datetime, timedelta
import json
import random


# Simulates a logged-on parent checking their child's health data
class ParentUser(HttpUser):
    wait_time = between(1, 3)
    weight = 3  # 50% of load is parents to mirrors real usage case

    def on_start(self):
        resp = self.client.post("/login", json={
            "username": "parent_male",
            "password": "parent123"
        }, name="/login [parent]")
        if resp.status_code == 200:
            self.token = resp.json().get("token")
        else:
            self.token = None

    def _auth(self):
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    @task(4)
    def view_header(self):
        self.client.get("/header", headers=self._auth(), name="GET /header")

    @task(3)
    def view_growth_trend(self):
        self.client.get("/growth-trend", headers=self._auth(), name="GET /growth-trend")

    @task(2)
    def view_vaccines(self):
        self.client.get("/vaccines-status", headers=self._auth(), name="GET /vaccines-status")

    @task(2)
    def view_analytics(self):
        self.client.get("/analize", headers=self._auth(), name="GET /analize")

    @task(2)
    def view_milestones(self):
        self.client.get("/milestones", headers=self._auth(), name="GET /milestones")

    @task(2)
    def view_completed_vaccines(self):
        self.client.get("/completed-vaccines", headers=self._auth(), name="GET /completed-vaccines")

    @task(1)
    def view_events(self):
        self.client.get("/upcoming-appointments", headers=self._auth(), name="GET /upcoming-appointments")

    @task(1)
    def view_conversations(self):
        self.client.get("/conversations", headers=self._auth(), name="GET /conversations")

    @task(1)
    def verify_token(self):
        self.client.get("/verify-token", headers=self._auth(), name="GET /verify-token")

    @task(1)
    def view_profile(self):
        self.client.get("/profile", headers=self._auth(), name="GET /profile")

    @task(1)
    def view_health_alerts(self):
        self.client.get("/health-alerts", headers=self._auth(), name="GET /health-alerts")

    @task(1)
    def view_report_requests(self):
        self.client.get("/report-requests", headers=self._auth(), name="GET /report-requests")

    @task(1)
    def view_vaccine_schedule(self):
        self.client.get("/vaccine", headers=self._auth(), name="GET /vaccine")

    @task(1)
    def add_appointment(self):
        future_date = (datetime.now() + timedelta(days=random.randint(1, 30))).isoformat()
        self.client.post("/add-appointment", headers=self._auth(), json={
            "appointment_type": "General Checkup",
            "doctor_name": "Dr. Silva",
            "appointment_date": future_date
        }, name="POST /add-appointment")

    @task(1)
    def toggle_milestone(self):
        self.client.post("/milestones/toggle", headers=self._auth(), json={
            "milestone_id": random.randint(1, 10),
            "category": "motor",
            "description": "Can sit without support",
            "min_age": 4,
            "max_age": 8
        }, name="POST /milestones/toggle")

 

#simulates a doctor reviewing and updating patient records
class DoctorUser(HttpUser):
    wait_time = between(2, 5)
    weight = 2  # 33% of load is doctors to mirror real usage

    def on_start(self):
        resp = self.client.post("/login", json={
            "username": "doctor",
            "password": "doctor123"
        }, name="/login [doctor]")
        self.token = resp.json().get("token") if resp.status_code == 200 else None
        self.child_id = 1  

    def _auth(self):
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    
    @task(4)
    def view_all_children(self):
        self.client.get("/children", headers=self._auth(), name="GET /children")

    @task(3)
    def view_doctor_profile(self):
        self.client.get("/doctor-profile", headers=self._auth(), name="GET /doctor-profile")

    @task(3)
    def view_recent_activity(self):
        self.client.get("/doctor-recent-activity", headers=self._auth(), name="GET /doctor-recent-activity")

    @task(2)
    def view_health_alerts(self):
        self.client.get("/health-alerts", headers=self._auth(), name="GET /health-alerts [doctor]")

    @task(2)
    def view_child_health_records(self):
        self.client.get(f"/children/{self.child_id}/health-records",
                        headers=self._auth(), name="GET /children/:id/health-records")

    @task(2)
    def view_conversations(self):
        self.client.get("/conversations", headers=self._auth(), name="GET /conversations [doctor]")

    @task(1)
    def view_who_standards(self):
        gender = random.choice(["male", "female"])
        self.client.get(f"/who-standards/{gender}", headers=self._auth(),
                        name="GET /who-standards/:gender")

    @task(1)
    def view_growth_prediction(self):
        self.client.get(f"/predict-growth/{self.child_id}",
                        headers=self._auth(), name="GET /predict-growth/:id")

    @task(1)
    def view_ai_insights(self):
        self.client.get(f"/doctor/ai-insights/{self.child_id}",
                        headers=self._auth(), name="GET /doctor/ai-insights/:id")

    @task(1)
    def view_age_groups(self):
        self.client.get("/age-groups", headers=self._auth(), name="GET /age-groups")


    @task(2)
    def add_growth_record(self):
        self.client.post(f"/children/{self.child_id}/growth",
                         headers=self._auth(), json={
                             "weight": round(random.uniform(5.0, 20.0), 1),
                             "height": round(random.uniform(50.0, 110.0), 1),
                             "head_circumference": round(random.uniform(30.0, 52.0), 1),
                             "record_date": datetime.now().isoformat(),
                             "notes": "Routine checkup"
                         }, name="POST /children/:id/growth")

    @task(1)
    def add_prescription(self):
        self.client.post(f"/children/{self.child_id}/health-records/prescriptions",
                         headers=self._auth(), json={
                             "medication_name": "Paracetamol",
                             "medication_dosage": "5ml",
                             "reason": "Fever management",
                             "record_date": datetime.now().isoformat()
                         }, name="POST /children/:id/health-records/prescriptions")



#simulates a nurse handling registrations, vaccinations, and growth records 
class NurseUser(HttpUser):
    wait_time = between(2, 4)
    weight = 2  # 33% of load are nurses 

    def on_start(self):
        resp = self.client.post("/login", json={
            "username": "nurse",
            "password": "nurse123"
        }, name="/login [nurse]")
        self.token = resp.json().get("token") if resp.status_code == 200 else None
        self.child_id = 1 

    def _auth(self):
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    @task(4)
    def view_all_children(self):
        self.client.get("/children", headers=self._auth(), name="GET /children [nurse]")

    @task(3)
    def view_pending_registrations(self):
        self.client.get("/pending_registrations", headers=self._auth(),
                        name="GET /pending_registrations")

    @task(3)
    def view_child_health_records(self):
        self.client.get(f"/children/{self.child_id}/health-records",
                        headers=self._auth(), name="GET /children/:id/health-records [nurse]")

    @task(2)
    def view_health_alerts(self):
        self.client.get("/health-alerts", headers=self._auth(),
                        name="GET /health-alerts [nurse]")

    @task(2)
    def view_conversations(self):
        self.client.get("/conversations", headers=self._auth(),
                        name="GET /conversations [nurse]")

    @task(2)
    def view_report_requests(self):
        self.client.get("/admin/report-requests", headers=self._auth(),
                        name="GET /admin/report-requests [nurse]")

    @task(1)
    def view_age_groups(self):
        self.client.get("/age-groups", headers=self._auth(),
                        name="GET /age-groups [nurse]")

    @task(1)
    def view_who_standards(self):
        gender = random.choice(["male", "female"])
        self.client.get(f"/who-standards/{gender}", headers=self._auth(),
                        name="GET /who-standards/:gender [nurse]")

    @task(3)
    def add_growth_record(self):
        """Nurses frequently record growth measurements during visits"""
        self.client.post(f"/children/{self.child_id}/growth",
                         headers=self._auth(), json={
                             "weight": round(random.uniform(5.0, 20.0), 1),
                             "height": round(random.uniform(50.0, 110.0), 1),
                             "head_circumference": round(random.uniform(30.0, 52.0), 1),
                             "record_date": datetime.now().isoformat(),
                             "notes": "Nurse routine measurement"
                         }, name="POST /children/:id/growth [nurse]")
 

    @task(1)
    def mark_alert_read(self):
        self.client.post("/health-alerts/read-all", headers=self._auth(),
                         name="POST /health-alerts/read-all [nurse]")



#simulates an admin managing users, events, and monitoring system health
class AdminUser(HttpUser):
    wait_time = between(5, 10)
    weight = 1  # 17% of load are admins as they use the system less frequently

    def on_start(self):
        resp = self.client.post("/login", json={
            "username": "admin",
            "password": "admin123"
        }, name="/login [admin]")
        self.token = resp.json().get("token") if resp.status_code == 200 else None

    def _auth(self):
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    @task(3)
    def system_health(self):
        self.client.get("/api/admin/system-health",
                        headers=self._auth(), name="GET /api/admin/system-health")

    @task(2)
    def list_users(self):
        self.client.get("/api/admin/users", headers=self._auth(),
                        name="GET /api/admin/users")

    @task(2)
    def list_events(self):
        self.client.get("/api/admin/events", headers=self._auth(),
                        name="GET /api/admin/events")

    @task(2)
    def dashboard_stats(self):
        self.client.get("/api/admin/dashboard-stats", headers=self._auth(),
                        name="GET /api/admin/dashboard-stats")

    @task(2)
    def view_report_requests(self):
        self.client.get("/admin/report-requests", headers=self._auth(),
                        name="GET /admin/report-requests [admin]")

    @task(1)
    def view_pending_registrations(self):
        self.client.get("/pending_registrations", headers=self._auth(),
                        name="GET /pending_registrations [admin]")

    @task(1)
    def admin_profile(self):
        self.client.get("/admin-profile", headers=self._auth(),
                        name="GET /admin-profile")

    @task(1)
    def create_user(self):
        uid = random.randint(1000, 9999)
        self.client.post("/api/admin/create-user", headers=self._auth(), json={
            "username": f"testuser_{uid}",
            "password": "Test@1234",
            "email": f"testuser_{uid}@example.com",
            "role": random.choice(["doctor", "nurse"]),
            "phone": "0771234567"
        }, name="POST /api/admin/create-user")


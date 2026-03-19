# Integration Tests 
# 6 end-to-end integration tests covering all four user roles (parent, doctor, nurse, admin) and the full child-registration lifecycle.


import json
import pytest
from datetime import date, datetime



def _auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# Dummy data for registering a new child account
def _pending_registration_payload(
    username: str = "new_parent_reg",
    reg_number: str = "REG-2024-0001",
    child_name: str = "Baby Bambinoo",
) -> dict:
    return {
        "registrationNumber": reg_number,
        "username": username,
        "password": "SecurePass@123",
        "childName": child_name,
        "childDOB": "2024-01-15",
        "gender": "Female",
        "nationality": "Sri Lankan",
        "childNumber": "10",
        "language": "Sinhala",
        "motherName": "Amara Perera",
        "motherDOB": "1992-06-20",
        "motherEmail": f"{username}@bambinoo.lk",
        "motherPhone": "0771234567",
        "birthLocation": "Colombo",
        "birthHospital": "Lady Ridgeway Hospital",
        "deliveryType": "Normal",
        "surgery": "No",
        "birthWeight": 3.2,
        "birthLength": 50.0,
        "headCircumference": 34.0,
        "personnelType": "Doctor",
        "personnelName": "Dr. Nimal Silva",
        "livingAddress": "12, Galle Road, Colombo 03",
    }



# Integration Test 1 - Login -> Token Verification -> Logout for all four roles
class TestAuthLifecycle:

    def test_all_roles_can_login_verify_and_invalid_login_is_rejected(
        self,
        client,
        admin_token,
        doctor_token,
        nurse_token,
        parent_token,
        admin_user,
        doctor_user,
        nurse_user,
        parent_user,
    ):
        #  each user logs in
        login_cases = [
            (admin_user.username,  "admin"),
            (doctor_user.username, "doctor"),
            (nurse_user.username,  "nurse"),
            (parent_user.username, "parent"),
        ]
        for username, expected_role in login_cases:
            resp = client.post(
                "/login",
                json={"username": username, "password": "Password@123"},
            )
            assert resp.status_code == 200, (
                f"Login failed for {expected_role}: {resp.get_json()}"
            )
            body = resp.get_json()
            assert "token" in body, f"No token returned for {expected_role}"
            assert body["user"]["role"] == expected_role, (
                f"Wrong role returned for {expected_role}"
            )


        # Token verification works using the dummy tokens
        for token, role in [
            (admin_token,  "admin"),
            (doctor_token, "doctor"),
            (nurse_token,  "nurse"),
            (parent_token, "parent"),
        ]:
            resp = client.get("/verify-token", headers=_auth_headers(token))
            assert resp.status_code == 200, (
                f"verify-token failed for {role}: {resp.get_json()}"
            )
            data = resp.get_json()
            assert data["valid"] is True
            assert data["user"]["role"] == role


        # 401 error is a user inputs a wrong password
        resp = client.post(
            "/login",
            json={"username": admin_user.username, "password": "WrongPassword!"},
        )
        assert resp.status_code == 401
        assert "Invalid" in resp.get_json().get("message", "")


        # 401 error if trying to login to a non existing account
        resp = client.post(
            "/login",
            json={"username": "ghost_user_xyz", "password": "anything"},
        )
        assert resp.status_code == 401


        # 500 error if trying to login with out a password
        resp = client.post("/login", json={"username": admin_user.username})
        assert resp.status_code in (400, 401, 500) 






# Test 2 – New Child Registration  (submit request → list → approve/deny → verify)
class TestChildRegistrationLifecycle:
   
    def test_registration_submit_list_approve_and_child_appears(
        self,
        client,
        app,
        admin_token,
        doctor_token,
        nurse_token,
        admin_user,
    ):
        

        # anyone can submit a pending registration (no token required)
        payload = _pending_registration_payload(
            username="reg_parent_approve",
            reg_number="REG-2024-APPR",
            child_name="Approved Baby",
        )
        resp = client.post("/pending_registration", json=payload)
        assert resp.status_code == 201, f"Registration submit failed: {resp.get_json()}"
        assert resp.get_json()["registration_number"] == "REG-2024-APPR"


        # duplicate registration number is rejected
        resp_dup = client.post("/pending_registration", json=payload)
        assert resp_dup.status_code == 400
        assert "already exists" in resp_dup.get_json().get("message", "")


        # doctor/nurse can see pending registrations
        resp = client.get(
            "/pending_registrations", headers=_auth_headers(nurse_token)
        )
        assert resp.status_code == 200
        registrations = resp.get_json()
        assert isinstance(registrations, list)
        reg_ids = [r["registration_number"] for r in registrations]
        assert "REG-2024-APPR" in reg_ids


        # Grab the database id for approval
        pending_id = next(
            r["id"] for r in registrations if r["registration_number"] == "REG-2024-APPR"
        )


        # doctor/nurse approves registration
        resp = client.post(
            f"/pending_registrations/approve/{pending_id}",
            headers=_auth_headers(admin_token),
        )
        assert resp.status_code == 200, f"Approval failed: {resp.get_json()}"
        assert "approved" in resp.get_json()["message"].lower()

        

        # newly approved child appears in child table in database
        resp = client.get("/children")
        assert resp.status_code == 200
        children = resp.get_json()
        child_names = [c["name"] for c in children]
        assert "Approved Baby" in child_names


        # submit a second registration and doctor/nurse declines it
        payload2 = _pending_registration_payload(
            username="reg_parent_decline",
            reg_number="REG-2024-DECL",
            child_name="Declined Baby",
        )
        client.post("/pending_registration", json=payload2)

        resp_list = client.get(
            "/pending_registrations", headers=_auth_headers(doctor_token)
        )
        pending2 = next(
            r for r in resp_list.get_json()
            if r["registration_number"] == "REG-2024-DECL"
        )
        resp = client.post(
            f"/pending_registrations/decline/{pending2['id']}",
            json={"reason": "Incomplete supporting documents"},
            headers=_auth_headers(doctor_token),
        )
        assert resp.status_code == 200
        assert "declined" in resp.get_json()["message"].lower()


        # check if searching by registration number works
        resp = client.get(
            "/search_registration/REG-2024-APPR",
            headers=_auth_headers(admin_token),
        )
        assert resp.status_code == 200
        result = resp.get_json()
        assert result["type"] == "REGISTERED"



# Test 3 - Complete integration test for parent dashboard 
class TestParentDashboard:
   
    def test_parent_can_traverse_full_dashboard(
        self,
        client,
        parent_token,
        child_record,
        parent_user
    ):
        headers = _auth_headers(parent_token)


        # Header returns child name and latest growth figures 
        resp = client.get("/header", headers=headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["name"] == "Baby Test"
        assert data["growth"]["weight"]["current"] is not None


        # Growth trend returns a non-empty list
        resp = client.get("/growth-trend", headers=headers)
        assert resp.status_code == 200
        trend = resp.get_json()
        assert "trend" in trend
        assert len(trend["trend"]) > 0


        # Upcoming appointments starts empty
        resp = client.get("/upcoming-appointments", headers=headers)
        assert resp.status_code == 200
        assert isinstance(resp.get_json(), list)


        # Add a valid appointment 
        appt_payload = {
            "appointment_type": "Growth Check",
            "doctor_name": "Dr. Kumari",
            "appointment_date": "2027-06-15T10:00:00",
        }
        resp = client.post("/add-appointment", json=appt_payload, headers=headers)
        assert resp.status_code == 201, f"Add appointment failed: {resp.get_json()}"
        appt_id = resp.get_json()["id"]


        # Missing required fields shows proper validation errors
        resp = client.post(
            "/add-appointment",
            json={"appointment_type": "Check"},
            headers=headers,
        )
        assert resp.status_code == 400


        # Appointment type too long shows proper validation errors
        resp = client.post(
            "/add-appointment",
            json={
                "appointment_type": "X" * 60,
                "doctor_name": "Dr. Test",
                "appointment_date": "2027-07-01T09:00:00",
            },
            headers=headers,
        )
        assert resp.status_code == 400


        # Update the appointment
        resp = client.put(
            f"/update-appointment/{appt_id}",
            json={
                "appointment_type": "Vaccination",
                "doctor_name": "Dr. Saman",
                "appointment_date": "2027-08-20T11:00:00",
            },
            headers=headers,
        )
        assert resp.status_code == 200
        assert resp.get_json()["appointment_type"] == "Vaccination"


        # Delete the appointment
        resp = client.delete(f"/delete-appointment/{appt_id}")
        assert resp.status_code == 200
        assert "deleted" in resp.get_json()["message"].lower()


        # Health alerts endpoint returns a list 
        resp = client.get("/health-alerts", headers=headers)
        assert resp.status_code == 200
        assert isinstance(resp.get_json(), list)


        # Parent logs a health note
        note_payload = {
            "type": "symptom",
            "noticedAt": "2025-03-01T08:00:00",
            "symptomType": "Fever",
            "severity": "mild",
            "temperature": 37.8,
            "subject": "Mild fever noticed",
            "description": "Child had a slight fever after dinner.",
        }
        resp = client.post("/add-health-note", json=note_payload, headers=headers)
        assert resp.status_code == 201, f"Health note failed: {resp.get_json()}"

        # Parent submits a report request
        report_payload = {
            "requested_by": "Amara Perera",
            "name": "Baby Test",
            "child_id_number": "CH001",
            "phone": "0771234567",
            "email": parent_user.email,
            "reports_requested": ["Growth Report", "Vaccination History"],
        }
        resp = client.post(
            "/report-request", json=report_payload, headers=headers
        )
        assert resp.status_code == 201, f"Report request failed: {resp.get_json()}"
        report_request_id = resp.get_json()["report_request_id"]

        # Parent views their own report requests
        resp = client.get("/report-requests", headers=headers)
        assert resp.status_code == 200
        requests_list = resp.get_json()
        ids = [r["report_request_id"] for r in requests_list]
        assert report_request_id in ids




# Test 4 – Complete integration test for doctor dashboard
class TestDoctorWorkflows:

    def test_doctor_can_record_clinical_data_and_view_patients(
        self,
        client,
        doctor_token,
        child_record,
    ):
        headers = _auth_headers(doctor_token)
        child_id = child_record.id


        # Doctor sees all registered children
        resp = client.get("/children")
        assert resp.status_code == 200
        children = resp.get_json()
        ids = [c["id"] for c in children]
        assert f"CH{child_id:03d}" in ids


        # Adds a new growth record
        growth_payload = {
            "weight": 6.5,
            "height": 62.0,
            "head": 41.0,
            "notes": "Healthy growth at 5-month check.",
            "date": "2023-06-01",
        }
        resp = client.post(f"/children/{child_id}/growth", json=growth_payload)
        assert resp.status_code == 201, f"Growth record failed: {resp.get_json()}"
        body = resp.get_json()
        assert body["success"] is True
        assert body["bmi"] is not None


        # Adds vaccination record 
        vacc_payload = {
            "vaccineName": "BCG",
            "doseNumber": "1",
            "dateAdministered": "2023-01-15",
            "administeredBy": "Dr. doctor_one",
            "batchNumber": "BCH-2023-001",
            "notes": "No adverse reactions.",
        }
        resp = client.post(f"/children/{child_id}/vaccinations", json=vacc_payload)
        assert resp.status_code == 201, f"Vaccination failed: {resp.get_json()}"


        # Missing vaccine name give a 400 error
        resp = client.post(
            f"/children/{child_id}/vaccinations",
            json={"dateAdministered": "2023-02-01"},
        )
        assert resp.status_code == 400


        # Retrieve health records
        resp = client.get(f"/children/{child_id}/health-records")
        assert resp.status_code == 200
        assert isinstance(resp.get_json(), list)


        # Add a doctor note
        note_payload = {
            "title": "5-Month Review",
            "doctor_name": "Dr. doctor_one",
            "diagnosis": "Healthy infant, on track",
            "treatment": "Continue breastfeeding",
            "notes": "Child appears alert and responsive. Growth within normal range.",
        }
        resp = client.post(
            f"/children/{child_id}/health-records/notes",
            json=note_payload,
        )
        assert resp.status_code == 201
        assert "saved" in resp.get_json()["message"].lower()
        resp = client.post(
            f"/children/{child_id}/health-records/notes",
            json={"title": "No notes"},
        )
        assert resp.status_code == 400


        # Issues a prescription
        rx_payload = {
            "medication_name": "Paracetamol",
            "medication_dosage": "120 mg/5 ml",
            "frequency": "Three times daily",
            "doctor_name": "Dr. doctor_one",
            "notes": "For fever management.",
        }
        resp = client.post(
            f"/children/{child_id}/health-records/prescriptions",
            json=rx_payload,
        )
        assert resp.status_code == 201
        assert "saved" in resp.get_json()["message"].lower()


        # Missing medicine name gives a 400 error
        resp = client.post(
            f"/children/{child_id}/health-records/prescriptions",
            json={"frequency": "daily"},
        )
        assert resp.status_code == 400


        # Doctor recent activity returns data
        resp = client.get("/doctor-recent-activity")
        assert resp.status_code == 200
        assert isinstance(resp.get_json(), list)


        # Doctor can see pending registrations
        resp = client.get("/pending_registrations", headers=headers)
        assert resp.status_code == 200


#Test5 - Complete integration test for Nurse dashboard
class TestNurseWorkflows:

    def test_nurse_workflows_and_access_controls(
        self,
        client,
        app,
        nurse_token,
        admin_token,
        child_record,
    ):
        headers = _auth_headers(nurse_token)
        child_id = child_record.id

       
        # Nurse can see all registered children
        resp = client.get("/children")
        assert resp.status_code == 200
        children = resp.get_json()
        ids = [c["id"] for c in children]
        assert f"CH{child_id:03d}" in ids

        
        # Nurse records a growth measurement
        resp = client.post(
            f"/children/{child_id}/growth",
            json={
                "weight": 7.1,
                "height": 64.5,
                "head": 42.0,
                "notes": "Nurse-recorded growth at 6-month visit.",
                "date": "2023-07-01",
            },
        )
        assert resp.status_code == 201, f"Growth record failed: {resp.get_json()}"
        assert resp.get_json()["success"] is True
        assert resp.get_json()["bmi"] is not None

       
       
        # Nurse records a vaccination
        resp = client.post(
            f"/children/{child_id}/vaccinations",
            json={
                "vaccineName": "OPV",
                "doseNumber": "2",
                "dateAdministered": "2023-07-01",
                "administeredBy": "Nurse nurse_one",
                "batchNumber": "OPV-2023-007",
                "notes": "Child tolerated well.",
            },
        )
        assert resp.status_code == 201, f"Vaccination failed: {resp.get_json()}"

        
       
        # Missing vaccine name gives 400 status code
        resp = client.post(
            f"/children/{child_id}/vaccinations",
            json={"dateAdministered": "2023-07-01"},
        )
        assert resp.status_code == 400

       
       
        # Nurse reads health records
        resp = client.get(f"/children/{child_id}/health-records")
        assert resp.status_code == 200
        assert isinstance(resp.get_json(), list)

      
        # Nurse cannot create Doctor notes
        resp = client.post(
            f"/doctor/notes/{child_id}",
            json={"title": "Test Note", "description": "Should be forbidden"},
            headers={"Authorization": f"Bearer {nurse_token}"}
        )
        assert resp.status_code not in (200, 201)


        
        # Nurse can view pending registrations 
        resp = client.get("/pending_registrations", headers=headers)
        assert resp.status_code == 200
        pending_list = resp.get_json()
        assert isinstance(pending_list, list)

  
        # Nurse can view all report requests
        resp = client.get("/admin/report-requests", headers=headers)
        assert resp.status_code == 200
        assert isinstance(resp.get_json(), list)

  
 


#Test 6 - Complete integration test for the admin dashboard
class TestAdminManagement:
   
    def test_admin_management(
        self,
        client,
        app,
        admin_token,
        admin_user,
        nurse_token,
        nurse_user,
        parent_token,
        parent_user,
        child_record,
    ):
        admin_headers = _auth_headers(admin_token)
        nurse_headers = _auth_headers(nurse_token)
        parent_headers = _auth_headers(parent_token)


        # Admin lists all users
        resp = client.get("/api/admin/users", headers=admin_headers)
        assert resp.status_code == 200
        users = resp.get_json()
        assert isinstance(users, list)
        assert len(users) >= 3  


        # Admin creates a new staff member
        new_staff = {
            "username": "new_nurse_2025",
            "email": "new_nurse_2025@bambinoo.lk",
            "phone": "0712345678",
            "moh_id": "MOH-NUR999",
            "role": "nurse",
            "password": "StaffPass@456",
        }
        resp = client.post(
            "/api/admin/create-user", json=new_staff, headers=admin_headers
        )
        assert resp.status_code == 201, f"Create staff failed: {resp.get_json()}"


        # Using a duplicate email when creating new account gives 400 status code
        resp = client.post(
            "/api/admin/create-user", json=new_staff, headers=admin_headers
        )
        assert resp.status_code == 400
        assert "already registered" in resp.get_json().get("message", "")


        # Non-admin cannot create users
        resp = client.post(
            "/api/admin/create-user", json=new_staff, headers=nurse_headers
        )
        assert resp.status_code == 403

        # Admin updates a user
        resp = client.get("/api/admin/users", headers=admin_headers)
        all_users = resp.get_json()
        nurse_entry = next(u for u in all_users if u["username"] == nurse_user.username)
        nurse_id = nurse_entry["id"]

        resp = client.put(
            f"/api/admin/users/{nurse_id}",
            json={"phone": "0719999999"},
            headers=admin_headers,
        )
        assert resp.status_code == 200
        assert "updated" in resp.get_json()["message"].lower()


        
        # Admin cannot delete their own account
        resp = client.delete(
            f"/api/admin/users/{admin_user.id}", headers=admin_headers
        )
        assert resp.status_code == 400
        assert "Cannot delete your own account" in resp.get_json()["message"]



        # Admin can delete different users
        resp = client.delete(
            f"/api/admin/users/{nurse_id}", headers=admin_headers
        )
        assert resp.status_code == 200
        assert "deleted" in resp.get_json()["message"].lower()

        
        # Admin dashboard stats
        resp = client.get("/api/admin/dashboard-stats", headers=admin_headers)
        assert resp.status_code == 200
        stats = resp.get_json()
        assert "totalUsers" in stats
        assert "totalChildren" in stats



        # Admin creates and deletes an event
        event_payload = {
            "title": "Child Health Awareness Day",
            "type": "Health",
            "date": "2027-09-15",
            "location": "Colombo Town Hall",
            "description": "Free health screening for children under 5.",
        }
        resp = client.post("/api/admin/events", json=event_payload)
        assert resp.status_code == 201
        resp = client.get("/api/admin/events")
        assert resp.status_code == 200
        events = resp.get_json()
        event_ids = [e["id"] for e in events]
        assert isinstance(events, list)

        resp = client.post(
            "/api/admin/events",
            json={**event_payload, "title": "Temporary Event", "date": "2027-10-01"},
        )
        assert resp.status_code == 201
        resp = client.get("/api/admin/events")
        temp_event = next(
            (e for e in resp.get_json() if e["title"] == "Temporary Event"), None
        )
        if temp_event:
            resp = client.delete(f"/api/admin/events/{temp_event['id']}")
            assert resp.status_code == 200



        #  admin-profile can view their own profile
        resp = client.get("/admin-profile")
        assert resp.status_code == 200
        profile = resp.get_json()
        assert profile["role"] == "admin"
        assert "username" in profile
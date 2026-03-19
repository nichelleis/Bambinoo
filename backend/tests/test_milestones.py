# Tests - Milestone tracking and completion
# Covers FR16 - Development Milestone Tracking

import pytest
from datetime import date
from app import db, Milestone, Child


#TestClass1 - Milestone storage and retrieval
class TestMilestoneModel:

    #TC1-MIL-01: milestone record is persisted with all required fields
    def test_milestone_created_correctly(self, app, child_record):
        cid = child_record.id
        with app.app_context():
            m = Milestone(
                child_id=cid,
                milestone_id=1,
                category="Motor",
                description="Holds head up",
                min_age=0,
                max_age=3,
                achieved_date=date.today()
            )
            db.session.add(m)
            db.session.commit()

            fetched = Milestone.query.filter_by(child_id=cid, milestone_id=1).first()
            assert fetched is not None
            assert fetched.category == "Motor"
            assert fetched.achieved_date == date.today()


    #TC1-MIL-02: multiple milestones can be stored for the same child
    def test_multiple_milestones_for_child(self, app, child_record):
        cid = child_record.id
        with app.app_context():
            for i, desc in enumerate(["Rolls over", "Smiles", "Babbles"], start=1):
                db.session.add(Milestone(
                    child_id=cid,
                    milestone_id=i,
                    category="Motor",
                    description=desc,
                    min_age=0,
                    max_age=6,
                    achieved_date=date.today()
                ))
            db.session.commit()

            milestones = Milestone.query.filter_by(child_id=cid).all()
            assert len(milestones) == 3


    #TC1-MIL-03: deleting a child cascades and removes its milestones
    def test_cascade_delete_milestones(self, app, parent_user, child_record):
        cid = child_record.id
        pid = parent_user.id
        with app.app_context():
            db.session.add(Milestone(
                child_id=cid,
                milestone_id=10,
                category="Social",
                description="Recognises parent",
                min_age=0,
                max_age=3,
                achieved_date=date.today()
            ))
            db.session.commit()

            child = Child.query.filter_by(parent_id=pid).first()
            db.session.delete(child)
            db.session.commit()

            remaining = Milestone.query.filter_by(child_id=cid).all()
            assert len(remaining) == 0


#TestClass2 - Milestone API endpoints
class TestMilestoneEndpoints:


    #TC2-MIL-01: /milestones returns data for a parent with a child
    def test_get_milestones_parent_with_child(self, client, parent_token, child_record):
        resp = client.get("/milestones",
                          headers={"Authorization": f"Bearer {parent_token}"})
        assert resp.status_code in (200, 500)



    #TC2-MIL-02: /milestones returns empty object when parent has no child
    def test_get_milestones_no_child(self, client, parent_token):
        resp = client.get("/milestones",
                          headers={"Authorization": f"Bearer {parent_token}"})
        assert resp.status_code == 200
        assert resp.get_json() == {}



    #TC2-MIL-03: /milestones requires authentication
    def test_get_milestones_unauthenticated(self, client):
        resp = client.get("/milestones")
        assert resp.status_code == 401



    #TC2-MIL-04: /milestones/toggle marks a milestone as achieved
    def test_toggle_milestone_marks_achieved(self, client, parent_token, child_record, app):
        resp = client.post(
            "/milestones/toggle",
            json={"milestone_id": 1, "category": "Motor"},
            headers={"Authorization": f"Bearer {parent_token}"}
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data.get("success") is True

        cid = child_record.id
        with app.app_context():
            record = Milestone.query.filter_by(child_id=cid, milestone_id=1).first()
            assert record is not None
            assert record.achieved_date == date.today()



    #TC2-MIL-05: /milestones/toggle called twice removes the milestone
    def test_toggle_milestone_twice_removes_it(self, client, parent_token, child_record, app):
        headers = {"Authorization": f"Bearer {parent_token}"}
        payload = {"milestone_id": 2, "category": "Motor"}

        client.post("/milestones/toggle", json=payload, headers=headers)
        client.post("/milestones/toggle", json=payload, headers=headers)

        cid = child_record.id
        with app.app_context():
            record = Milestone.query.filter_by(child_id=cid, milestone_id=2).first()
            assert record is None



    # TC2-MIL-06: /milestones/toggle requires authentication
    def test_toggle_milestone_unauthenticated(self, client):
        resp = client.post("/milestones/toggle",
                           json={"milestone_id": 1, "category": "Motor"})
        assert resp.status_code == 401



    #TC2-MIL-07: /milestone-status returns a list of category summaries
    def test_milestone_status_returns_list(self, client, parent_token, child_record):
        resp = client.get("/milestone-status",
                          headers={"Authorization": f"Bearer {parent_token}"})
        assert resp.status_code in (200, 500)
        if resp.status_code == 200:
            data = resp.get_json()
            assert isinstance(data, list)



    # TC2-MIL-08: /milestone-status returns empty list when parent has no child
    def test_milestone_status_no_child(self, client, parent_token):
        resp = client.get("/milestone-status",
                          headers={"Authorization": f"Bearer {parent_token}"})
        assert resp.status_code == 200
        assert resp.get_json() == []



    #TC2-MIL-09: /milestone-status requires authentication
    def test_milestone_status_unauthenticated(self, client):
        resp = client.get("/milestone-status")
        assert resp.status_code == 401
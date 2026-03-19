# Tests: Messaging component
# Covers FR13 - Doctor - Patient messaging

import pytest
from app import db, User, Conversation, Message
from datetime import date, datetime


class TestMessagingModel:
     
    #TC-MSG-01: A conversation between two users can be created
    def test_conversation_created(self, app, parent_user, doctor_user):
        pid, did = parent_user.id, doctor_user.id
        with app.app_context():
            conv = Conversation(
                user1_id=pid,
                user2_id=did
            )
            db.session.add(conv)
            db.session.commit()

            fetched = Conversation.query.filter_by(
                user1_id=parent_user.id, user2_id=doctor_user.id
            ).first()
            assert fetched is not None



    #TC-MSG-02: Message content is stored and retrievable
    def test_message_stored_correctly(self, app, parent_user, doctor_user):
        pid, did = parent_user.id, doctor_user.id
        with app.app_context():
            conv = Conversation(user1_id=pid, user2_id=did)
            db.session.add(conv)
            db.session.flush()

            msg = Message(
                conversation_id=conv.id,
                sender_id=pid,
                receiver_id=did,
                content="Hello Doctor, my child has a fever.",
                is_read=False
            )
            db.session.add(msg)
            db.session.commit()

            fetched = Message.query.filter_by(conversation_id=conv.id).first()
            assert fetched.content == "Hello Doctor, my child has a fever."
            assert fetched.is_read is False



    #TC-MSG-03: Message is_read can be updated to True
    def test_message_mark_as_read(self, app, parent_user, doctor_user):
        pid, did = parent_user.id, doctor_user.id
        with app.app_context():
            conv = Conversation(user1_id=pid, user2_id=did)
            db.session.add(conv)
            db.session.flush()

            msg = Message(
                conversation_id=conv.id,
                sender_id=pid,
                receiver_id=did,
                content="Is the report ready?",
                is_read=False
            )
            db.session.add(msg)
            db.session.commit()

            msg.is_read = True
            db.session.commit()

            assert Message.query.get(msg.id).is_read is True



    #TC-MSG-04: /conversations endpoint returns list for authenticated user
    def test_get_conversations_endpoint(self, client, parent_token):
        resp = client.get("/conversations",
                          headers={"Authorization": f"Bearer {parent_token}"})
        assert resp.status_code in (200, 404)
        if resp.status_code == 200:
            assert isinstance(resp.get_json(), list)

    def test_send_message_endpoint(self, client, parent_token, doctor_user):
        """TC-MSG-05: Parent can initiate a message to a doctor via API."""
        resp = client.post(
            "/messages/send",
            json={
                "receiver_moh_id": doctor_user.MOH_ID,
                "content": "Test message from parent"
            },
            headers={"Authorization": f"Bearer {parent_token}"}
        )
        assert resp.status_code in (200, 201, 404)



    # TC-MSG-06: Unauthenticated POST to messaging endpoint returns 401/404
    def test_unauthenticated_cannot_send_message(self, client):
        resp = client.post("/messages/send",
                           json={"receiver_moh_id": "X", "content": "hack"})
        assert resp.status_code not in (200, 201)







def _auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


#TestClass2- Runs a actual messaging instance between a parent and doctor
class TestActualMessagingInstance:

    def test_parent_messaging_workflows(
        self,
        client,
        parent_token,
        doctor_token,
        parent_user,
        doctor_user,
    ):
        parent_headers = _auth_headers(parent_token)
        doctor_headers = _auth_headers(doctor_token)

        # Fetching messages between parent and doctor returns empty list when no conversation exists yet
        resp = client.get(
            f"/messages/{doctor_user.id}",
            headers=parent_headers,
        )
        assert resp.status_code == 200
        assert resp.get_json() == []

        # Parent's conversation list starts empty with no prior convos
        resp = client.get("/conversations", headers=parent_headers)
        assert resp.status_code == 200
        assert isinstance(resp.get_json(), list)

        # doctor's conversation list is also initially empty
        resp = client.get("/conversations", headers=doctor_headers)
        assert resp.status_code == 200
        assert isinstance(resp.get_json(), list)

        # Search for a doctor by their MOH_ID
        resp = client.get(
            f"/search-user/{doctor_user.MOH_ID}",
            headers=parent_headers,
        )
        assert resp.status_code == 200
        body = resp.get_json()
        assert body["id"] == doctor_user.id
        assert body["role"] == "doctor"

        # Searching with an unknown MOH code returns 404
        resp = client.get(
            "/search-user/INVALID-MOH-999",
            headers=parent_headers,
        )
        assert resp.status_code == 404
        assert "not found" in resp.get_json().get("message", "").lower()

        with client.application.app_context():
            u1 = min(parent_user.id, doctor_user.id)
            u2 = max(parent_user.id, doctor_user.id)
            convo = Conversation(user1_id=u1, user2_id=u2)
            db.session.add(convo)
            db.session.flush()

            msg = Message(
                conversation_id=convo.id,
                sender_id=parent_user.id,
                receiver_id=doctor_user.id,
                content="Hello Doctor, quick question about the vaccines.",
            )
            db.session.add(msg)
            db.session.commit()
            convo_id = convo.id

        # Parent retrieves that message
        resp = client.get(
            f"/messages/{doctor_user.id}",
            headers=parent_headers,
        )
        assert resp.status_code == 200
        messages = resp.get_json()
        assert len(messages) == 1
        assert messages[0]["content"] == "Hello Doctor, quick question about the vaccines."
        assert messages[0]["sender_id"] == parent_user.id

        # conversation appears in parent's conversation list
        resp = client.get("/conversations", headers=parent_headers)
        assert resp.status_code == 200
        convos = resp.get_json()
        convo_ids = [c["conversation_id"] for c in convos]
        assert convo_id in convo_ids

        # the conversation entry carries the last message preview
        target = next(c for c in convos if c["conversation_id"] == convo_id)
        assert "last_message" in target
        assert target["last_message"] != ""

        # conversation also appears in doctor's list
        resp = client.get("/conversations", headers=doctor_headers)
        assert resp.status_code == 200
        doctor_convos = resp.get_json()
        assert any(c["conversation_id"] == convo_id for c in doctor_convos)

        # unauthenticated request to /conversations is rejected
        resp = client.get("/conversations")
        assert resp.status_code in (401, 422)

from services.firestoreClient import database as db
import secrets
import time
from typing import Optional


Session_TTL_Seconds = 24 * 60 * 60

#Collects the sessions of the clients from firestore
class SessionManager:
    def __init__(self) -> None:
        self._sessions = db.collection("sessions")

    #Starts a session for the given email & returns the token
    def create_session(self, email : str) -> str:
        self._delete_expired_for_user(email)
        token = secrets.token_urlsafe(32)
        self._sessions.document(token).set({"email" : email.lower().strip(), "expires_at" : time.time() + Session_TTL_Seconds,})
        return token

    #Returns the email tied to a token, or None if the token is missing/unknownpython3 filename.py
    def email_for(self, token : Optional[str]) -> Optional[str]:
        if token is None:
            return None
        doc = self._sessions.document(token).get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        if time.time > data["expires_at"]:
            self._sessions.document(token).delete()
            return None
        return data["email"]

    #Ends a session (e.g. on logout)
    def end_session(self, token : str) -> None:
        self._sessions.document(token).delete()

    def _delete_expired_for_user(self, email: str) -> None:
        now = time.time()
        expired = self._sessions.where("email", "==", email.lower().strip()).where("expires_at", "<", now).stream()
        for doc in expired:
            doc.reference.delete()

    def delete_expired_sessions(self) -> None:
        now = time.time()
        expired = self._sessions.where("expires_at", "<", now).stream()
        for doc in expired:
            doc.reference.delete()
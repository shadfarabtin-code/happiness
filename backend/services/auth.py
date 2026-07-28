import time
import secrets
from dataclasses import replace
from typing import Optional
from models.user import User, PendingVerification
from services.security import hash_password, password_matches, is_work_email
import firebase_admin
from firebase_admin import firestore
token_ttl_seconds = 10 * 60


#Provider is verified only if the role is provider, is_verified, & work email
def is_verified_provider ( user : User) -> bool:
    return user.role == "provider" and user.is_verified and is_work_email(user.email)

#Holds all the users data & Handles registering
class AccountManager:
    #Holds all the users and registers 
    def __init__(self) -> None:
        self._users = firestore.client().collection("users")
        self._tokens = firestore.client().collection( "verification_tokens")
    
    #Creates a new account, gives the user an unique id in strings 
    def register( self, email : str, password : str, role : str) -> User:
        email = email.lower().strip()
        if self._users.document(email).get().exists:
            raise ValueError( "Email already in use.")
        user = User ( id = uuid.uuid4().hex, email = email, password_hash = hash_password(password), role = role)
        self._users.document(email).set({"id" : user.id , "email" : user.email, "password_hash" : user.password_hash, "role" : user.role, "is_verified" : user. is_verified})
        return user

    def _user_from_doc(self, doc) -> Optional[User]:
        if not doc.exists:
            return None
        d = doc.to_dict()
        return User(d["id"], d["email"], d["password_hash"], d["role"], d["is_verified"])

    def get(self, email : str) -> Optional[User]:
        return self._user_from_doc(self._users.document(email.lower().strip()).get())

    #Return user if email & password match, otherwise None
    def authenticate( self, email : str, password : str) -> Optional[User]:
        user = self.get(email)
        if user is None:
            return None
        if password_matches(password, user.password_hash):
            return user
        return None

    #Proves that you own the inbox by creating a token & token expiration timer
    def create_verification_token( self, email : str , ttl_seconds : float = token_ttl_seconds) -> str:
        email = email.lower().strip()
        if email not in self._users:
            raise ValueError("No such account")
        token = secrets.token_urlsafe(32)
        self._pending_tokens[token] = PendingVerification(email=email, expires_at=time.time() + ttl_seconds)
        return token

    #Verifies the token and marks the user as verified
    def verify( self, token : str) -> bool:
        pending = self._pending_tokens.pop(token , None)
        if pending is None:
            return False
        if pending.expires_at < time.time():
            return False
        email = pending.email
        old = self._users[email]
        self._users[email] = replace(old, is_verified=True)
        return True 

    #Returns the user for the given email if it exists
    def get( self, email : str) -> Optional[User]:
        return self._users.get(email.lower().strip())

#Holds active login sessions, mapping a session token back to the email that owns it
#Make sures an "app already exists" crash doesn't happen
if not firebase_admin._apps:
    firebase_admin.initialize_app()

Session_TTL_Seconds = 24 * 60 * 60

#Collects the sessions of the clients from firestore
class SessionManager:
    def __init__(self) -> None:
        self._sessions = firestore.client().collections("sessions")

    #Starts a session for the given email & returns the token
    def create_session(self, email : str) -> str:
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

accounts = AccountManager()
sessions = SessionManager()

#Pulls the token out of an "Authorization: Bearer <token>" header value
def _token_from_request(authorization : Optional[str]) -> Optional[str]:
    if authorization is None:
        return None
    prefix = "Bearer "
    if authorization.startswith(prefix):
        return authorization[len(prefix):]
    return None

#Resolves the logged in user from the Authorization header, returns user or None if the token is missing/bad/expired
def current_user(authorization : Optional[str]) -> Optional[User]:
    email = sessions.email_for(_token_from_request(authorization))
    if email is None:
        return None
    return accounts.get(email)


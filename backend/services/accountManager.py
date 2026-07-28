import time
import secrets
import uuid
from dataclasses import replace, asdict
from typing import Optional

from services.firestoreClient import database as db
from models.user import User, PendingVerification
from services.security import hash_password, password_matches, is_work_email

token_ttl_seconds = 10 * 60

#Holds all the users data & Handles registering
class AccountManager:
    #Holds all the users and registers 
    def __init__(self) -> None:
        self._users = db.collection("users")
        self._tokens = db.collection( "verification_tokens")
    
    #Creates a new account, gives the user an unique id in strings 
    def register(self, email : str, password : str, first_name : str, last_name : str, role : str, company_name : str = None) -> User:
        email = email.lower().strip()
        if self._users.document(email).get().exists:
            raise ValueError( "Email already in use.")
        user = User(
            id = uuid.uuid4().hex, 
            email = email,
            password_hash = hash_password(password), 
            first_name = first_name,
            last_name = last_name,
            role = role,
            company_name = company_name
        )
        self._users.document(email).set(asdict(user))
        return user

    def _user_from_doc(self, doc) -> Optional[User]:
        if not doc.exists:
            return None
        d = doc.to_dict()
        return User(d["id"], d["email"], d["password_hash"], d["role"], d["is_verified"])

    def _get(self, email : str) -> Optional[User]:
        return self._user_from_doc(self._users.document(email.lower().strip()).get())

    #Return user if email & password match, otherwise None
    def authenticate( self, email : str, password : str) -> Optional[User]:
        user = self._get(email)
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









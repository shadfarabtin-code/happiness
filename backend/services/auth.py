import time
import secrets
from dataclasses import replace
from typing import Optional

from models.user import User, PendingVerification
from services.security import hash_password, password_matches, is_work_email

token_ttl_seconds = 10 * 60

#Provider is verified only if the role is provider, is_verified, & work email
def is_verified_provider ( user : User) -> bool:
    return user.role == "provider" and user.is_verified and is_work_email(user.email)

#Holds all the users data & Handles registering
class AccountManager:
    #Holds all the users and registers 
    def __init__(self) -> None:
        self._users : dict[str, User] = {}
        self._next_id : int = 1
        self._pending_tokens : dict[str, str] = {}
    
    #Creates a new account
    def register( self, email : str, password : str, role : str) -> User:
        email = email.lower().strip()
        if email in self._users:
            raise ValueError("Email already in use.")
        
        user = User( id = self._next_id, email = email, password_hash = hash_password (password), role = role,)
        self._users[email] = user
        self._next_id += 1 
        return user

    #Return user if email & password match, otherwise None
    def authenticate( self, email : str, password : str) -> Optional[User]:
        email = email.lower().strip()
        user = self._users.get(email)
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
import csv
from typing import *
from dataclasses import dataclass
import unittest
import math
from typing import Optional
import sys
import bcrypt

#Accounts & Authroization
#Two users: Seekers & Providers
#Providers: Name, Picture, Role, Company, Bio, What they can help with
#Seekers: Name, Picture, University, Companies they want to target, what they need help with
@dataclass (frozen=True)
class User:
    id : int
    email : str
    password_hash : str
    role : str
    is_verified : bool = False

#Ignores anything passed 72 bytes of password,
def hash_password(password : str)->str:
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt() #Salts the password
    hashed = bcrypt.hashpw(password_bytes, salt) #Does the one-way hash
    return hashed.decode('utf-8') #Returns the hashed password as a string

#To check if the password matches the hashedpassword
def password_matches( password : str , password_hash : str) ->bool:
    return bcrypt.checkpw( password.encode("utf-8"), password_hash.encode("utf-8"))
     


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

    #Proves that you own the inbox by creating a token
    def create_verification_token( self, email : str) -> str:
        email = email.lower().strip()
        if email not in self._users:
            raise ValueError("No such account")
        token = secrets.token_urlsafe(32)
        self._pending_tokens[token] = email
        return token

    #Verifies the token and marks the user as verified
    def verify( self, token : str) -> bool:
        email = self._pending_tokens.pop(token , None)
        if email is None:
            return False
        old = self._users[email]
        self._users[email] = replace(old, is_verified=True)
        return True 
        
    #Returns the user for the given email if it exists
    def get( self, email : str) -> Optional[User]:
        return self._users.get(email.lower().strip())









#Button System
#Green for active, Red for offline, Yellow for active in the scheduled time

















#Chat Backend











#Search/Browse
#Filter company, role, whos active...






#Notifications, user preference










#Verification, via workemail, linkedin authroization (Later once we get the app), or manual approval
#Verify badge next to users name
#Verification via workemail 
Free_email_domains = { "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "aol.com", "protonmail.com", "proton.me", "live.com", "msn.com","gmx.com", "yandex.com", "mail.com", "me.com",}





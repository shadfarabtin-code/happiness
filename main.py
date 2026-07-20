import csv
from typing import *
from dataclasses import dataclass
import unittest
import math
import sys
from werkzeug.security import generate_password_hash, check_password_hash

#Accounts & Authroization
#Two users: Seekers & Providers
#Providers: Name, Picture, Role, Company, Bio, What they can help with
#Seekers: Name, Picture, University, Companies they want to target, what they need help with
#Change this to one way hash
@dataclass (frozen=True)
class User:
    id : int
    email : str
    password_hash : str
    role : str
    is_verified : bool = False

#Holds all the users data & Handles registering
class AccountManager: 
    def __init__(self) -> None:
        self._users : dict[str, User] = {}
        self._next_id : int = 1
    
    #Creates a new account
    def register( self, email : str, password_hash : str, role : str) -> User:
        email = email.lower().strip()
        if email in self._users:
            raise ValueError("Email already in use.")
        
        user = User( id = self._next_id, email = email, password_hash = generate_password_hash (password_hash), role = role,)
        self._users[email] = user
        self._next_id += 1 
        return user











#Button System
#Green for active, Red for offline, Yellow for active in the scheduled time


#Chat Backend











#Search/Browse
#Filter company, role, whos active...






#Notifications, user preference










#Verification, via workemail, linkedin authroization, or mannual approval
#Verify badge next to users name








def main():
    entries = load_entries("data.csv")
    print(f"Average happiness: {average_score(entries):.2f}")
if __name__ == "__main__":
    main()

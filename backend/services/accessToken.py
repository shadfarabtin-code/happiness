from typing import Optional
from models.user import User
from services.firestoreClient import accounts, sessions
from fastapi import Header, HTTPException



#Pulls the token out of an "Authorization: Bearer <token>" header value
def _token_from_request(authorization : Optional[str]) -> Optional[str]:
    if authorization is None:
        return None
    prefix = "Bearer "
    if authorization.startswith(prefix):
        return authorization[len(prefix):]
    return None

#Resolves the logged in user from the Authorization header, returns user or None if the token is missing/bad/expired

def get_current_user(authorization : Optional[str] = Header(None)) -> User:
    email = sessions.email_for(_token_from_request(authorization))
    if email is None:
        raise HTTPException(401, "Invalid or expired session")
    user =  accounts._get(email)
    if user is None:
        raise HTTPException(401, "Invalid or expired session")
    return user
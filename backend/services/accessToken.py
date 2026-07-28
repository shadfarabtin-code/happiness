from typing import Optional
from models.user import User
from firestoreClient import accounts, sessions



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
    return accounts._get(email)
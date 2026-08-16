from dataclasses import dataclass
from typing import Optional

@dataclass (frozen=True)
class User:
    id : str
    email : str
    first_name : str
    last_name : str
    password_hash : str
    role : str
    company_name : Optional[str] = None
    is_verified : bool = False


@dataclass (frozen = True)
class PendingVerification:
    email : str
    expires_at : float

@dataclass (frozen=True)
class Session:
    email : str
    expires_at : float



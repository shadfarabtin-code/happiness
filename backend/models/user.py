from dataclasses import dataclass

@dataclass (frozen=True)
class User:
    id : int
    email : str
    password_hash : str
    role : str
    is_verified : bool = False


@dataclass (frozen = True)
class PendingVerification:
    email : str
    expires_at : float

@dataclass (frozen=True)
class Session:
    email : str
    expires_at : float
from dataclasses import dataclass

@dataclass (frozen=True)
class User:
    id : str
    email : str
    password_hash : str
    role : str
    is_verified : bool = False


@dataclass (frozen = True)
class PendingVerification:
    email : str
    expires_at : float

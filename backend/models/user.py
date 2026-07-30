from dataclasses import dataclass

@dataclass (frozen=True)
class User:
    id : str
    email : str
    first_name : str
    last_name : str
    password_hash : str
    role : str
    company_name : str | None = None
    is_verified : bool = False


@dataclass (frozen = True)
class PendingVerification:
    email : str
    expires_at : float

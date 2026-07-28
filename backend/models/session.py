from dataclasses import dataclass

@dataclass (frozen=True)
class Session:
    email : str
    expires_at : float
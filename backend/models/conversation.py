from dataclasses import dataclass

@dataclass (frozen=True)
class Conversation:
    id : str
    participants : list [str]
    created_at : float
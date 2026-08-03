from dataclasses import dataclass
from typing import Optional

@dataclass ( frozen = True)
class Message:
    id : str
    thread_id : str
    parents_id : Optional[str]
    author_email : str
    created_at : float
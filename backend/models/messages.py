from dataclasses import dataclass
from typing import Optional

@dataclass ( frozen = True)
class Message:
    id : str
    thread_id : str
    parent_id : Optional[str]
    author_email : str
    author_first_name : str
    author_last_name : str
    body : str
    created_at : float
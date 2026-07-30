from dataclasses import dataclass

@dataclass (frozen = True)
class Thread:
    id : str
    title : str
    tags : list[str]
    author_email : str
    created_at : float 

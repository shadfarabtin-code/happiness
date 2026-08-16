from dataclasses import dataclass

@dataclass (frozen = True)
class ChatMessage:
    id : str
    sender_email : str
    body : str
    created_at : float
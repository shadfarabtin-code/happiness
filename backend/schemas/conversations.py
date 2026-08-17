from typing import Optional
from pydantic import BaseModel, ConfigDict

from schemas.user import UserOut


class StartChat(BaseModel):
    other_email: str


class ChatMessageIn(BaseModel):
    body: str


class ConversationOut(BaseModel):
    id: str
    participants: list[str]
    created_at: float
    # Looked up live from the accounts collection (not stored on the conversation), so this
    # always reflects the other person's current profile - including fields added later, like
    # a profile photo, without needing to backfill every existing conversation document.
    other_user: UserOut
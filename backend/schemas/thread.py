from typing import Optional

from pydantic import BaseModel, ConfigDict

class NewThread(BaseModel):
    title: str
    tags: list[str]

class NewMessage(BaseModel):
    body: str
    parent_id: Optional[str] = None


class ThreadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    tags: list[str]
    author_email: str
    created_at: float


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    thread_id: str
    parent_id: Optional[str]
    author_email: str
    body: str
    created_at: float


class MessageNode(BaseModel):
    id: str
    thread_id: str
    parent_id: Optional[str]
    author_email: str
    body: str
    created_at: float
    replies: list["MessageNode"] = []

MessageNode.model_rebuild()
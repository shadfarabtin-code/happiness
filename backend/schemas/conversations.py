from typing import Optional
from pydantic import BaseModel, ConfigDict


class StartChat(BaseModel):
    other_email: str          


class ChatMessageIn(BaseModel):
    body: str
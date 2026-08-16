from pydantic import BaseModel, EmailStr
from typing import Optional
#data validation from react front end to back end server

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: str  # "seeker" or "provider"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    role: str
    is_verified: bool

class LoginResponse(BaseModel):
    token: str
    user: UserOut

class NewThread(BaseModel):
    title: str
    tags: list[str]

class NewMessage(BaseModel):
    body : str
    parent_id : Optional[ str] = None



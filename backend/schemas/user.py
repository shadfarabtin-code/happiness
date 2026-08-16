from pydantic import BaseModel, EmailStr
from typing import Optional
#data validation from react front end to back end server

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: str  # "seeker" or "provider"
    company_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: str
    company_name: Optional[str] = None
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



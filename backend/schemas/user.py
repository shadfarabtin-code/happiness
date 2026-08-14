from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr
#data validation from react front end to back end server

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: Literal["seeker", "provider"]
    company_name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    first_name: str
    last_name: str
    role: str
    company_name: str | None = None
    is_verified: bool

class LoginResponse(BaseModel):
    token: str
    user: UserResponse
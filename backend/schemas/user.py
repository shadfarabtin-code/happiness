from pydantic import BaseModel, EmailStr
#data validation from react front end to back end server

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: str  # "seeker" or "provider"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    role: str
    is_verified: bool
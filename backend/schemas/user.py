from pydantic import BaseModel, EmailStr
#data validation from react front end to back end server

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: str
    company_name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
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
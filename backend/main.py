from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from services.auth import AccountManager
from schemas.user import RegisterRequest, LoginRequest, UserOut

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], #change to specific origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = AccountManager() #for testing purposes will use a live in-memory account manager (must link proper DB later)

@app.post("/register", response_model=UserOut)
def register(payload: RegisterRequest):
    try:
        user = manager.register(payload.email, payload.password, payload.role)
    except ValueError as e:
        raise HTTPException(400, str(e))
    return user


@app.post("/login", response_model=UserOut)
def login(payload: LoginRequest):
    user = manager.authenticate(payload.email, payload.password)
    if not user:
        raise HTTPException(401, "Invalid email or password")
    return user
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware

from services.accountManager import AccountManager
from services.sessionManager import SessionManager
from schemas.user import RegisterRequest, LoginRequest, LoginResponse
from models.user import User

from typing import Optional

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], #change to specific origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = AccountManager()
sessions = SessionManager()

@app.post("/register", response_model=LoginResponse)
def register(payload: RegisterRequest):
    try:
        user: User = manager.register(payload.email, payload.password, payload.role)
        token: str = sessions.create_session(user.email)    
    except ValueError as e:
        raise HTTPException(400, str(e))
    return {"token": token, "user": user}

@app.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    user: User = manager.authenticate(payload.email, payload.password)
    if not user:
        raise HTTPException(401, "Invalid email or password")
    token: str = sessions.create_session(user.email)      
    return {"token": token, "user": user}

#@app.post("/chat/send")
#def chat_send(payload: ChatMessage, user: User = Depends(current_user)):
#    return {"from": user.email, "message": payload.message}
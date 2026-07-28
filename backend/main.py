from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware

from services.firestoreClient import accounts, sessions
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

@app.post("/register", response_model=LoginResponse)
def register(payload: RegisterRequest):
    try:
        user: User = accounts.register(payload.email, payload.password, payload.first_name, payload.last_name, payload.role, payload.company_name)
        token: str = sessions.create_session(user.email)    
    except ValueError as e:
        raise HTTPException(400, str(e))
    return {"token": token, "user": user}

@app.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    user: User = accounts.authenticate(payload.email, payload.password)
    if not user:
        raise HTTPException(401, "Invalid email or password")
    token: str = sessions.create_session(user.email)      
    return {"token": token, "user": user}

#@app.post("/chat/send")
#def chat_send(payload: ChatMessage, user: User = Depends(current_user)):
#    return {"from": user.email, "message": payload.message}
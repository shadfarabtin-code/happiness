from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from services.auth import AccountManager
from schemas.user import RegisterRequest, LoginRequest, UserOut
from fastapi import Header, Depends

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], #change to specific origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = AccountManager() #for testing purposes will use a live in-memory account manager (must link proper DB later)



@app.post("/register", response_model=LoginResponse)
def register(payload: RegisterRequest):
    try:
        user = manager.register(payload.email, payload.password, payload.role)
        token = sessions.create_session(user.email)    
    except ValueError as e:
        raise HTTPException(400, str(e))
    return {"token": token, "user": user}


@app.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    user = manager.authenticate(payload.email, payload.password)
    if not user:
        raise HTTPException(401, "Invalid email or password")
    token = sessions.create_session(user.email)      
    return {"token": token, "user": user}

#Reads the token
def get_current_user(authorization: Optional[str] = Header(default=None)) -> User:
    user = current_user(authorization)          # reuses your existing function!
    if user is None:
        raise HTTPException(401, "Not authenticated")
    return user


#@app.post("/chat/send")
#def chat_send(payload: ChatMessage, user: User = Depends(get_current_user)):
#    return {"from": user.email, "message": payload.message}
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware

from services.firestoreClient import accounts, sessions
from schemas.user import RegisterRequest, LoginRequest, LoginResponse
from models.user import User
from pydantic import BaseModel
from typing import Optional

forum = ForumManager()
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
        user: User = accounts.register(payload.email, payload.password, payload.role)
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

# Not sure if I did this right.

@app.post("/threads")
#Only loggged in person with a token get in
def create_threads( payload : NewThread, user : User = Depends (get_current_user)):
    return forum.create_thread( payload.title, payload.tags, user.email)

#List threads
@app.post( "/threads")
def get_threads( tag : Optional[str] = None):
    #Filters if tag was given, if not is everything else
    return forum.list_by_tag(tag) if tag else forum.list_threads()


#Frontend sends this when they are replying to a message 
@app.post( "/threads/{thread_id}/messages")
def post_message( thread_id : str, payload : NewMessage, user : User = Depends ( get_current_user)):
    return forum.post_message( thread_id, user.email, payload.body, payload.parent_id)

#The tree is ready for frontend to render
@app.post("/threads/{thread_id}/tree")
def get_tree ( thread_id : str):
    return forum.get_thread_tree(thread_id)


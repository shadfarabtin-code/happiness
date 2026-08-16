from typing import Optional

from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware

from services.firestoreClient import accounts, sessions, forums
from services.accessToken import get_current_user, _token_from_request

from schemas.user import RegisterRequest, LoginRequest, LoginResponse, UserResponse
from schemas.thread import NewThread, NewMessage, ThreadOut, MessageOut, MessageNode
from schemas.conversations import StartChat, ChatMessageIn

from models.user import User
from models.thread import Thread




app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], #change to specific origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# User Authentication
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

@app.get("/me", response_model=UserResponse)
def get_me(user : User = Depends(get_current_user)): #Frontend calls this on launch to check a stored token is still valid
    return user

@app.post("/logout")
def logout(authorization : Optional[str] = Header(None)): #Invalidates the session server-side so a leaked/old token stops working immediately
    token = _token_from_request(authorization)
    if token:
        sessions.end_session(token)
    return {"ok": True}

# Forum Management
@app.post("/threads", response_model=ThreadOut)
def create_threads( payload : NewThread, user : User = Depends(get_current_user)): #Only loggged in person with a token get in
    try:
        thread: Thread = forums.create_thread(payload.title, payload.tags, user.email)
    except ValueError as e:
        raise HTTPException(400, str(e))
    return thread

@app.get( "/threads", response_model=list[ThreadOut])
def get_threads( tag : Optional[str] = None): #List threads
    #Filters if tag was given, if not is everything else
    return forums.list_by_tag(tag) if tag else forums.list_threads()

@app.post( "/threads/{thread_id}/messages", response_model=MessageOut)
def post_message( thread_id : str, payload : NewMessage, user : User = Depends(get_current_user)): #Frontend sends this when they are replying to a message
    try:
        return forums.post_message( thread_id, user.email, payload.body, payload.parent_id)
    except ValueError as e:
        raise HTTPException(400, str(e))

@app.post("/threads/{thread_id}/tree", response_model=list[MessageNode])
def get_tree ( thread_id : str): #The tree is ready for frontend to render
    return forums.get_thread_tree(thread_id)


# Opens the chat with the person
@app.post("/conversations")
def start_conversation(payload: StartChat, user: User = Depends(get_current_user)):
    return convos.get_or_create(user.email, payload.other_email)   # "me" is from the token

# The inbox, list of conversations your in
@app.get("/conversations")
def my_conversations(user: User = Depends(get_current_user)):
    return convos.list_my_conversations(user.email)

# block anyone who isn't one of the two people in this conversation
def _require_participant(conversation_id: str, user: User):
    conv = convos.get(conversation_id)
    if conv is None or user.email not in conv.participants:
        raise HTTPException(403, "You're not part of this conversation")
    return conv

@app.get("/conversations/{conversation_id}/messages")
def get_messages(conversation_id: str, user: User = Depends(get_current_user)):
    _require_participant(conversation_id, user)         # can't read a chat you're not in
    return convos.list_messages(conversation_id)

@app.post("/conversations/{conversation_id}/messages")
def send_message(conversation_id: str, payload: ChatMessageIn, user: User = Depends(get_current_user)):
    _require_participant(conversation_id, user)         # can't post to a chat you're not in
    return convos.send_message(conversation_id, user.email, payload.body)
import time
import uuid
from typing import Optional

from google.cloud.firestore_v1.base_query import FieldFilter
from services.firestoreClient import database as db      
from models.conversation import Conversation
from models.chatMessage import ChatMessage


class ConversationManager:
    def __init__(self) -> None:
        self._conversations = db.collection( "conversations")

    #Creates one ID so there is no duplicates
    def _conversation_id( self, a : str, b : str) -> str:
        return ":".join(sorted([a.lower().strip(), b.lower().strip()]))

    #The way into the chats, reopens the conversation or makes it
    def get_or_create (self, me : str, other : str) -> Conversation:
        cid = self._conversation_id( me, other)
        ref = self._conversations.document(cid)
        doc = ref.get()
        #Same conversation, if not create a new one
        if doc.exists:
            return self._from_doc(doc)
        conv = Conversation( id = cid, participants = sorted( [me.lower().strip(), other.lower().strip()]), created_at = time.time())
        ref.set( {"id" : conv.id, "participants" : conv.participants , "created_at" : conv.created_at})
        return conv

    def _from_doc( self, doc) -> Conversation: 
        d = doc.to_dict()
        return Conversation ( d["id"], d["participants"], d["created_at"])

    #Check the conversation by id, check the participants before letting someone in
    def get( self, conversation_id : str ) -> Optional[Conversation]:
        doc = self._conversations.document(conversation_id).get()
        return self._from_doc(doc) if doc.exists else None

    #The users inbox, every chat they are participants in
    def list_my_conversations ( self, me : str) -> list[Conversation]:
        query = self._conversations.where ( filter = FieldFilter ("participants", "array_contains", me.lower().strip()))
        return [self._from_doc(doc) for doc in query.stream()]

    #add a message to a conversation, the route checks your id first
    def send_message( self, conversation_id : str, sender_email : str, body : str) -> ChatMessage:
        m = ChatMessage( uuid.uuid4().hex, sender_email.lower().strip(), body.strip(), time.time())
        self._conversations.document( conversation_id).collection("messages").document(m.id).set({ "id" : m.id, "sender_email" : m.sender_email, "body" : m.body, "created_at" : m.created_at,})
        return m

    #list every message, oldest comes first
    def list_messages( self, conversation_id : str) -> list[ChatMessage]:
        docs = (self._conversations.document(conversation_id)).collection("messages").order_by("created_at").stream()
        return [ChatMessage( d.to_dict()["id"], d.to_dict()["sender_email"], d.to_dict()["body"], d.to_dict()["created_at"]) for d in docs]



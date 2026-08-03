import time
import uuid
from typing import Optional
from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter
from models.thread import Thread
from services.firestoreClient import database as db

#Creates the thread & reads it back from firestore
class ForumManager:
    def __init__(self) -> None:
        self._threads = db.collection( "threads")
        self._notifications = db.collection("notifications")   # top-level inbox bucket

    #Builds a new topic, saves it to firestore & then returns it
    def create_thread( self, title : str , tags : list[str], author_email : str ) -> Thread:
        thread = Thread ( id = uuid.uuid4().hex, title = title.strip(), tags = [t.lower().strip() for t in tags], author_email = author_email.lower().strip(), created_at = time.time(),)
        #Goes to the slot for the id & writes the data
        self_threads.document( thread.id).set ({ "id " : thread.id , "title" : thread.title , "tags" : thread.tags, "author_email" : thread.author_email, "created_at" : thread.created_at})
        return thread

    #Turn one firestore document backinto a thread object
    def _thread_from_doc( self, doc) -> Optional[Thread]:
        if not doc.exists:
            return None
        d = doc.to_dict()
        return Thread( d ["id"], d[ "title"], d[ "tags"], d ["author_email"], d["created_at"])

    #Gets every thread in the collection
    def list_threads( self) -> list[Threads]:
        return [ self._thread_from_doc(doc) for doc in self._threads.stream()]

    #Lists only the threads that carry a tag
    def list_by_tag ( self, tag : str) -> list[Thread]:
        #Asks firestore for a filtered set where the tags list contains this tag
        query = self._threads.where( filter = FieldFilter( "tags", "array_contains", tag.lower().strip()))
        return [self._thread_from_doc(doc) for doc in query.stream()] #Rebuilds each Thread

    #A user opts into a thread & starts following it
    def subscribe ( self, thread_id : str, email : str) -> None:
        email = email.lower().strip()
        #Stores the susbcribers in a subbucket on the thread
        self._threads.document(thread_id).collection("subscribers").document(email).set({"email" : email, "subscribed_at" : time.time()})

    #Unsubscribing from a thread
    def unsubscribe( self, thread_id : str, email : str) -> None:
        self._threads.document(thread_id).collection("subscribers").document(email.lower().strip().delete())

    #List of subscribers, every email that is following a a specific thread 
    def list_subscribers( self, thread_id : str) -> list[str]:
        docs = self._thread.document( thread_id).collection( "subscribers").stream()
        #Returning it just pulls all the emails out
        return [doc.to_dict()["email"] for doc in docs]

    #Add a reply, parents_id says which message your replying to 
    def post_message( self, thread_id : str, author_id : str, body : str, parent_id : Optional [str] = None ) -> Message:
        doc = self._threads.document( thread_id).get()
        #Reads the thread once to conifrm it exists
        if not doc.exists: 
            raise ValueError( " Thread does not exist")

        message = Message( id = uuid.uuid4().hex, thread_id = thread_id, parent_id = parent_id, author_email = author_email.lower().strip(), body = body.strip(), created_at = time.time())
        #Stores the parent so we can rebuild the tree again
        self._threads.document(thread_id).collection("messages").document(message.id).set({
            "id" : message.id, "thread_id" : message.thread_id, "parent_id" : message.parent_id, "author_email" : message.author_email, "body" : message.body, "created_at" : message.created_at
        })
        return message
    #Reads the new field so any old message without it defaults to none
    def _message_from_doc( self, doc) -> Optional[Message]:
        if not doc.exists:
            return None
        d = doc.to_dict()
        return Message( d["id"], d["thread_id"], d.get("parent_id"), d["author_email"], d["body"], d["created_at"])

    #Fetches all the messages and puts them into a reply tree
    def get_thread_tree ( self, thread_id : str) -> list[dict]:
        #querery, oldest first & then the rest
        messages = self.list_messages(thread_id)
        #Puts all the other messages under their parents
        children_of : dict = {}
        for m in messages:
            #Groups siblings together in order of time
            children_of.setdefault(m.parent_id, []).append(m)

    #Recursively nest, starting from the first reply to the rest 
    def build(parent_id):
        #Recurse, attach this messages its own replies
        return [ { "id" : m.id, "author_email" : m.author_email, "body" : m.body, "replies" : build(m.id)}
        for m in children_of.get(parent_id, [])
        ]
    #None is the messages replying to the thread itself
    return build(None)



    
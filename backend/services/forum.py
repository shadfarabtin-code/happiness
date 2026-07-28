import time
import uuid
from typing import Optional
from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter
from models.thread import Thread

#Creates the thread & reads it back from firestore
class ForumManager:
    def __init__(self) -> None:
        self._threads = firestore.client().collection( "threads")

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

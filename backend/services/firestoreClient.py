from google.cloud import firestore

database = firestore.Client(database="happiness-db")

from services.accountManager import AccountManager
from services.sessionManager import SessionManager
from services.forumManager import ForumManager

accounts = AccountManager()
sessions = SessionManager()
forums = ForumManager()
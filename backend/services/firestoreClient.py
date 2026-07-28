from google.cloud import firestore

database = firestore.Client(database="happiness-db")

from services.accountManager import AccountManager
from services.sessionManager import SessionManager

accounts = AccountManager()
sessions = SessionManager()
from google.cloud import firestore

database = firestore.Client(project="happiness-db")

from services.accountManager import AccountManager
from services.sessionManager import SessionManager

accounts = AccountManager()
sessions = SessionManager()
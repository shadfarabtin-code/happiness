from google.cloud import firestore
from services.accountManager import AccountManager
from services.sessionManager import SessionManager


database = firestore.Client(project="happiness-db")
accounts = AccountManager()
sessions = SessionManager()
import bcrypt
from free_email_domains import whitelist as Free_Email_Domains

#Ignores anything passed 72 bytes of password,
def hash_password(password : str)->str:
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt() #Salts the password
    hashed = bcrypt.hashpw(password_bytes, salt) #Does the one-way hash
    return hashed.decode('utf-8') #Returns the hashed password as a string

#To check if the password matches the hashedpassword
def password_matches( password : str , password_hash : str) ->bool:
    return bcrypt.checkpw( password.encode("utf-8"), password_hash.encode("utf-8"))

#Checks if the email is a work email (not a free email domain)
def is_work_email ( email : str) -> bool:
    domain = email.split("@")[-1].lower().strip()
    return domain not in Free_Email_Domains
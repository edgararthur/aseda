from fastapi import FastAPI
from routes import users, transactions, tax

app = FastAPI()

app.include_router(users.router)
app.include_router(transactions.router)
app.include_router(tax.router)
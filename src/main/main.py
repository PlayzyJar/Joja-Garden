from fastapi import FastAPI

app = FastAPI()

from .api.endpoints import admin_router, auth_router

app.include_router(admin_router.router, prefix="/admin", tags=["Admins"])

app.include_router(auth_router.router, prefix="/auth", tags=["Autenticação"])
# Para executar o código no terminal, utilizar unicorn main:app --reload

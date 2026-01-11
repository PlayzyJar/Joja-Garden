from pydantic import BaseModel, EmailStr, Field


class UsuarioCreate(BaseModel):
    nome: str
    cpf: str
    email: EmailStr
    senha: str
    endereco: str


class UsuarioResponse(BaseModel):
    id: int
    nome: str
    email: EmailStr | None = None
    tipo_usuario: str = "usuario"

    class Config:
        from_attributes = True

class CPFBuscador(BaseModel):
    cpf: str = Field(..., max_length=11, min_length=11, description="CPF do usuário para busca de email.")

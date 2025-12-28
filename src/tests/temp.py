import pytest
from fastapi import status
from fastapi.testclient import TestClient
from fastapi import status

@pytest.mark.parametrize("acao", ["poda", "rega", "adubo"])
def test_registrar_acao_valida(client: TestClient, get_usuario_header_com_id, planta_usuario, acao):
    response = client.post(f"/acao/{planta_usuario["id"]}/registrar", headers={"Authorization": get_usuario_header_com_id["Authorization"]}, json={"tipo": acao, "descricao": "string", "data_hora": "2025-12-24"})
    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()['tipo'] == acao

@pytest.mark.parametrize("acao", ["rega"])
def test_regristo_horario_falha(client:TestClient, get_usuario_header_com_id, planta_usuario, acao):
    response = client.post(f"/acao/{planta_usuario["id"]}/registrar", headers={"Authorization": get_usuario_header_com_id['Authorization']}, json={"tipo": acao, "descricao": "string"})
    assert response.json()["detail"][0]["loc"][1] == "data_hora"
    assert response.json()["detail"][0]["type"] == "missing"
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT

@pytest.mark.parametrize("acao", ["poda"])
def test_regristo_horario_funciona(client:TestClient, get_usuario_header_com_id, planta_usuario, acao):
    response = client.post(f"/acao/{planta_usuario["id"]}/registrar", headers={"Authorization": get_usuario_header_com_id['Authorization']}, json={"tipo": acao, "descricao": "string", "data_hora": "2025-12-24"})
    assert "data_hora" in response.json()
    assert response.status_code == status.HTTP_201_CREATED

def test_listar_historico(client:TestClient, get_usuario_header_com_id, planta_usuario):
    response = client.get(f'acao/{planta_usuario['id']}/acoes', headers={"Authorization": get_usuario_header_com_id['Authorization']},)
    assert response.status_code == status.HTTP_200_OK

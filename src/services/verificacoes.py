def validar_cpf(cpf):
  retorno = False
  if len(cpf) != 11 or not cpf.isdigit():
        return retorno

  #Evita casos de números iguais
  if cpf == cpf[0] * 11:
        return retorno

  #Cálculo do primeiro dígito verificador
  soma = 0
  for i in range(9):
    soma += int(cpf[i]) * (10 - i)
    
    resto = (soma * 10) % 11
    if resto == 10:
        resto = 0
        
    if resto != int(cpf[9]):
        return retorno
    
    #Cálculo do segundo dígito verificador
    soma = 0
    for i in range(10):
        soma += int(cpf[i]) * (11 - i)
        
    resto = (soma * 10) % 11
    if resto == 10:
        resto = 0

    if resto != int(cpf[10]):
        return retorno

    return True

def valida_senha(senha):
    retorno = False
    if len(senha) < 8:
        return retorno

    if " " in senha:
        return retorno

    tem_numero = False
    tem_maiuscula = False

    for caract in senha:
        if caract.isdigit():
            tem_numero = True
        if caract.isupper():
            tem_maiuscula = True

    return tem_numero and tem_maiuscula

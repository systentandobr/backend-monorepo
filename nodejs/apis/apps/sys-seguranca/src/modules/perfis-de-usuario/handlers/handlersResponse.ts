import { HttpException, HttpStatus } from '@nestjs/common';

import { IHttpResponse } from 'libs/infra/IHttpResponse';
import { ErrorCode } from '@lib/utils/contantes/ErrorNumber';
import { Messages } from './Messages';

export const capturarRespostas = (
  error: Error | HttpException,
): IHttpResponse => {
  switch (error.message) {
    case Messages.PERFIL_INVALIDO:
      return documentoInvalidoResponse(error);
    case Messages.PERFIL_JA_CADASTRADO:
      return documentoJaCadastradoResponse(error);
    case Messages.PERFIL_NAO_ENCONTRADO:
      return documentoNaoEncontradoResponse(error);
    default:
      return erroDesconhecidoResponse(error);
  }
};

function documentoNaoEncontradoResponse(error: any): IHttpResponse {
  const httpResponse: IHttpResponse = {
    statusCode: HttpStatus.NOT_ACCEPTABLE,
    errorCode: ErrorCode.PERFIL_NAO_ENCONTRADO,
    errorMessage: Messages.PERFIL_NAO_ENCONTRADO,
    data: {
      ...(error.response ? error.response : error),
    },
  };
  return httpResponse;
}

function erroDesconhecidoResponse(error: any): IHttpResponse {
  const httpResponse: IHttpResponse = {
    statusCode: HttpStatus.BAD_REQUEST,
    errorCode: ErrorCode.GENERICO,
    errorMessage: Messages.ERRO_DESCONHECIDO,
    data: {
      ...(error.response ? error.response : error),
    },
  };
  return httpResponse;
}

function documentoJaCadastradoResponse(error: any): IHttpResponse {
  const httpResponse: IHttpResponse = {
    statusCode: HttpStatus.NOT_ACCEPTABLE,
    errorCode: ErrorCode.PERFIL_JA_CADASTRADO,
    errorMessage: new Error(Messages.PERFIL_JA_CADASTRADO),
    data: {
      ...(error.response ? error.response : error),
    },
  };
  return httpResponse;
}

function documentoInvalidoResponse(error: any): IHttpResponse {
  const httpResponse: IHttpResponse = {
    statusCode: HttpStatus.BAD_REQUEST,
    errorCode: ErrorCode.PERFIL_INVALIDO,
    errorMessage: new Error(Messages.PERFIL_INVALIDO),
    data: {
      ...(error.response ? error.response : error),
    },
  };
  return httpResponse;
}

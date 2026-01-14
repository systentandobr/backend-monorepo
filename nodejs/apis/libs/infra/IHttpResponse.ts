export interface IHttpResponse {
  statusCode: number;
  errorCode: number;
  errorMessage?: string | object;
  data?: object;
  headers?: object;
}

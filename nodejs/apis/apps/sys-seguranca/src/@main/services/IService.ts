export interface IService<T> {
  cadastrar(a: T): Promise<T>;
  listar(): Promise<Array<T>>;
  atualizar(b: T): Promise<T>;
  remover(c: T): Promise<void>;
}

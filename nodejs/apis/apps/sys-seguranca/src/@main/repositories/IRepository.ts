export interface IRepository<T> {
  cadastrar(a: T): Promise<T>;
  listar(): Promise<Array<T>>;
  atualizar(b: T): Promise<T>;
  remover(c: T): Promise<void>;
}

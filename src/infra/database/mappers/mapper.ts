export interface Mapper<M, D> {
  toDomain(model: M): D;
  toDatabase(domain: D): M;
}
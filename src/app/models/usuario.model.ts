export class Usuario {
  constructor(
    public email: string,
    public fullName: string,
    public password?: string,
    public google?: boolean,
    public roles?: string,
    public imagen?: string,
    public id?: string,
  ) {}
}

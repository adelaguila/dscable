export class Usuario {
  constructor(
    public id: string,
    public email: string,
    public fullName: string,
    public password?: string,
    public roles?: string,
    public imagen?: string,
  ) {}
}

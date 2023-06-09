import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {


  menu: any[] = [
    {
      titulo: 'Mantenimiento',
      icono: 'mdi mdi-folder-lock-open',
      submenu: [
        { titulo: 'Main', url: '/'},
        { titulo: 'Terceros', url: 'terceros'},
        { titulo: 'Vias', url: 'vias'},
        { titulo: 'Planes', url: 'planes'},
        { titulo: 'Usuarios', url: 'usuarios'},
      ]
    }

  ];

  constructor() { }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  merge,
  startWith,
  switchMap,
  of as observableOf,
} from 'rxjs';
import { ArchivoExcelInterface } from 'src/app/interfaces/excel.interface';
import { FilterModel } from 'src/app/models/filter-model';
import { Usuario } from 'src/app/models/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Util } from 'src/app/shared/util';
import { ExcelService } from '../../services/excel.service';
import {
  CampoTable,
  PdfTableInterface,
} from 'src/app/interfaces/pdf.interface';
import { PdfService } from 'src/app/services/pdf.service';
import Swal from 'sweetalert2';
import { ModalImagenService } from 'src/app/services/modal-imagen.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent implements OnInit {
  displayedColumns: string[] = ['image', 'id', 'fullName', 'email', 'roles','isActive'];
  data: Usuario[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  typeHeadFilter = new Subject<any[]>();
  typeHeadFilterFire = new Subject<string>();
  _filter: FilterModel = new FilterModel();
  _filterPage: any = '';
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 20, 30, 50, 100];
  flagBuscar: boolean = false;

  pageEvent!: PageEvent;

  flagEditar: boolean = false;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  constructor(
    private usuarioService: UsuarioService,
    private util: Util,
    private excelService: ExcelService,
    private pdfService: PdfService,
    private modalImagenService: ModalImagenService
  ) {}
  ngOnInit(): void {
    this.getPage();

    this.modalImagenService.nuevaImagen.subscribe(img => this.getPage());
  }

  getPage() {
    this.paginator._intl.itemsPerPageLabel = 'Reg Por Pag Emp';
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.sort.active = 'fullName';

    this.typeHeadFilter
      .pipe(distinctUntilChanged(), debounceTime(1000))
      .subscribe((res) => {
        let value = res[0].value;
        let field = res[1];
        let operator = res[2];

        this._filterPage = this.util.NestJsonFilter(
          this._filter,
          value,
          field,
          operator
        );
        this.typeHeadFilterFire.next('');
      });

    merge(this.sort.sortChange, this.paginator.page, this.typeHeadFilterFire)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          this.pageSize =
            this.paginator.pageSize == undefined
              ? this.pageSize
              : this.paginator.pageSize;

          return this.usuarioService.getPagination(
            this.paginator.pageIndex,
            this.pageSize,
            this.sort.direction,
            this.sort.active,
            this._filterPage
          );
        }),
        map((data) => {
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.resultsLength = data.meta.totalItems;
          return data.data;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          // Catch if the GitHub API has reached its rate limit. Return empty data.
          this.isRateLimitReached = true;
          return observableOf([]);
        })
      )
      .subscribe((data) => {
        this.data = <Usuario[]>data;
      });
  }

  showBuscar() {
    this._filterPage = '';
    this.flagBuscar = !this.flagBuscar;
  }

  activar(usuario: Usuario) {}

  cambiarEstado(usuario: Usuario) {
    if(usuario.id === this.usuarioService.usuario.id){
      return Swal.fire('Error','Operación denegada', 'error');
    }

    Swal.fire({
      title: '¿Cambiar estado?',
      text: `Esta a punto de cambiar el estado de ${usuario.fullName}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Si, cambiar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.cambiarEstado(usuario).subscribe((result) => {
          Swal.fire(
            'Cambiado!',
            `Estado del usuario ${usuario.fullName} fue cambiado correctamente`,
            'success'
          );
          this.getPage();
        });
      }
    });

    return false;
  }

  cambiarRole(usuario: Usuario){
    this.usuarioService.cambiarRole(usuario).subscribe((result) => {
      console.log(result);
    });
  }

  abrirModal(usuario: Usuario){
    console.log(usuario);
    this.modalImagenService.abrirModal('usuarios', usuario.id, usuario.image);
  }

  exportToExcel() {
    this.usuarioService
      .getPagination(
        this.paginator.pageIndex,
        1000,
        this.sort.direction,
        this.sort.active,
        this._filterPage
      )
      .subscribe((data) => {
        let dataToExcel: any[] = [];
        for (let row of data.data) {
          let dato = [row.id, row.fullName, row.email];
          dataToExcel.push(dato);
        }

        const archivoExcel: ArchivoExcelInterface = {
          nombre: 'usuarios',
          hojas: [
            {
              nombre: 'usuarios',
              cabeceraHoja: {
                logo: true,
                titulo: 'REPORTE DE USUARIOS',
                subtitulo: `Consultado a fecha: ${new Date().toISOString()}`,
              },
              cabecerasColumnas: ['ID', 'NOMBRE DE USUARIO', 'EMAIL'],
              anchoColumnas: [20, 50, 50],
              alineacionColumnas: [
                {
                  horizontal: 'left',
                },
                {
                  horizontal: 'left',
                },
                {
                  horizontal: 'left',
                },
              ],
              dataColumnas: dataToExcel,
            },
          ],
        };
        this.excelService.dowloadExcel(archivoExcel);
      });
  }

  exportToPdf() {
    this.usuarioService
      .getPagination(
        this.paginator.pageIndex,
        1000,
        this.sort.direction,
        this.sort.active,
        this._filterPage
      )
      .subscribe((data) => {
        let dataToTable: any[] = [];
        for (let row of data.data) {
          let dato: CampoTable[] = [
            {
              value: row.id,
              alignment: 'center',
            },
            {
              value: row.fullName,
              alignment: 'left',
            },
            {
              value: row.email,
              alignment: 'left',
            },
          ];
          dataToTable.push(dato);
        }
        const archivoPdf: PdfTableInterface = {
          layout: '', //'lightHorizontalLines',
          table: {
            headerRow: 1,
            widths: [50, '*', '*'],
            body: {
              headers: ['ID', 'NOMBRE DE USUARIO', 'CORREO ELECTRONICO'],
              rows: dataToTable,
            },
          },
        };
        this.pdfService.exportToPdf(
          archivoPdf,
          'reporte_usuarios',
          'REPORTE DE USUARIOS'
        );
      });
  }
}

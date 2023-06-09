import { Component, ViewChild } from '@angular/core';
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
import { FilterModel } from 'src/app/models/filter-model';
import { Via } from 'src/app/models/via.model';
import { ExcelService } from 'src/app/services/excel.service';
import { PdfService } from 'src/app/services/pdf.service';
import { Util } from 'src/app/shared/util';
import { ViaService } from '../../services/via.service';
import { ArchivoExcelInterface } from 'src/app/interfaces/excel.interface';
import {
  CampoTable,
  PdfTableInterface,
} from 'src/app/interfaces/pdf.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vias',
  templateUrl: './vias.component.html',
  styleUrls: ['./vias.component.css'],
})
export class ViasComponent {
  displayedColumns: string[] = ['id', 'nombrevia', 'accion'];
  data: Via[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  typeHeadFilter = new Subject<any[]>();
  typeHeadFilterFire = new Subject<string>();
  _filter: FilterModel = new FilterModel();
  _filterPage: any = '';
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 20, 30, 50, 100];
  flagBuscar: boolean = false;

  pageEvent!: PageEvent;

  flagEditar: boolean = false;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  constructor(
    private util: Util,
    private excelService: ExcelService,
    private pdfService: PdfService,
    private viaService: ViaService
  ) {}

  ngOnInit(): void {
    this.getPage();
  }

  getPage() {
    this.paginator._intl.itemsPerPageLabel = 'Reg Por Pag Emp';
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.sort.active = 'nombrevia';

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

          return this.viaService.getPagination(
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
        this.data = <Via[]>data;
      });
  }

  showBuscar() {
    this._filterPage = '';
    this.flagBuscar = !this.flagBuscar;
  }

  async crearVia(){
    const {value} = await Swal.fire<string>({
      title: 'Crear Vía',
      text: 'Ingrese el nombre de la vía',
      input: 'text',
      inputPlaceholder: 'Nombre de vía',
      confirmButtonText: 'Guardar',
      showCancelButton: true,
    });

    if(value !== undefined && value?.trim().length > 0){
      this.viaService.crearVia(value)
      .subscribe( (resp:any) => {
        Swal.fire('Creado', resp.nombrevia, 'success');
        this.getPage();
      }, (err) => {
        Swal.fire(err.error.error, err.error.message, 'error');
      })
    }
  }

  actualizar(via: Via) {
    this.viaService.actualizarVia(via.id, via.nombrevia).subscribe((resp) => {
      Swal.fire('Actualizado', via.nombrevia, 'success');
    });
  }

  eliminar(via: Via) {
    Swal.fire({
      title: '¿Eliminar vía?',
      text: `Esta a punto de eliminar la vía ${via.nombrevia}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.viaService.eliminarVia(via.id).subscribe((resp) => {
          Swal.fire('Eliminado', via.nombrevia, 'success');
          this.getPage();
        });
      }
    });
  }

  exportToExcel() {
    this.viaService
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
          let dato = [row.id, row.nombrevia];
          dataToExcel.push(dato);
        }

        const archivoExcel: ArchivoExcelInterface = {
          nombre: 'vias',
          hojas: [
            {
              nombre: 'vias',
              cabeceraHoja: {
                logo: true,
                titulo: 'REPORTE DE VIAS',
                subtitulo: `Consultado a fecha: ${new Date().toISOString()}`,
              },
              cabecerasColumnas: ['ID', 'NOMBRE DE USUARIO'],
              anchoColumnas: [20, 50],
              alineacionColumnas: [
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
    this.viaService
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
              value: row.nombrevia,
              alignment: 'left',
            },
          ];
          dataToTable.push(dato);
        }
        const archivoPdf: PdfTableInterface = {
          layout: '', //'lightHorizontalLines',
          table: {
            headerRow: 1,
            widths: [50, '*'],
            body: {
              headers: ['ID', 'NOMBRE DE VIA'],
              rows: dataToTable,
            },
          },
        };
        this.pdfService.exportToPdf(
          archivoPdf,
          'reporte_vias',
          'REPORTE DE VIAS'
        );
      });
  }
}

import { FilterModel } from "../models/filter-model";

export class Util {
  constructor() {}

  serialize(obj: any) {
    var p = [];
    for (var key in obj) {
      if (encodeURIComponent(obj[key]) == 'null') {
        //console.log("null");
      } else {
        p.push(key + '=' + encodeURIComponent(obj[key]));
      }
    }
    return p.join('&');
  }

  MaterialJsonFilter(
    filter: FilterModel,
    value: any,
    field: string,
    matchMode: string
  ) {
    if (value.length == 0) value = null;

    if (value) {
      filter.logic = 'and';
      let flagExiste: Boolean = false;

      for (let index = 0; index < filter.filters.length; index++) {
        const element = filter.filters[index];
        if (element.field == field) {
          filter.filters[index].field = field;
          filter.filters[index].operator = matchMode;
          filter.filters[index].value = value;
          flagExiste = true;
        }
      }

      if (!flagExiste)
        filter.filters.push({
          field: field,
          operator: matchMode,
          value: value,
        });
    } else {
      for (let index = 0; index < filter.filters.length; index++) {
        const element = filter.filters[index];
        if (element.field == field) {
          filter.filters.splice(index, 1);
        }
      }
    }

    return filter;
  }

  NestJsonFilter(
    filter: FilterModel,
    value: any,
    field: string,
    matchMode: string
  ) {
    if (value.length == 0) value = null;

    if (value) {
      filter.logic = '&';
      let flagExiste: Boolean = false;

      for (let index = 0; index < filter.filters.length; index++) {
        const element = filter.filters[index];
        if (element.field == field) {
          filter.filters[index].field = field;
          filter.filters[index].operator = matchMode;
          filter.filters[index].value = value;
          flagExiste = true;
        }
      }

      if (!flagExiste)
        filter.filters.push({
          field: field,
          operator: matchMode,
          value: value,
        });
    } else {
      for (let index = 0; index < filter.filters.length; index++) {
        const element = filter.filters[index];
        if (element.field == field) {
          filter.filters.splice(index, 1);
        }
      }
    }

    let filtros = filter.filters;
    let arrayFiltro: string[] = [];
    filtros.forEach(filtro => {
      arrayFiltro.push(`filter.${filtro.field}=${filtro.operator}:${filtro.value}`);
    })

    return arrayFiltro.join("&");
  }
}

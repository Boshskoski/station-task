import { Service } from '@angular/core';
import { CPConnectorTypeID } from '@core/enums/station/cp-connector-type-id.enum';
import { Station } from '@core/models/ui/station/station.ui';
import { FilterOption } from '@features/filters/models/ui/filter-option.ui';

@Service()
export class FilterOptionsService {
  connectorTypeOptions(stations: readonly Station[]): readonly FilterOption<CPConnectorTypeID>[] {
    const names = new Map<CPConnectorTypeID, string>();
    for (const station of stations) {
      for (const { cpConnectorTypeId, name } of station.connectors) {
        names.set(cpConnectorTypeId, name);
      }
    }
    return [...names].sort(([a], [b]) => a - b).map(([value, label]) => ({ value, label }));
  }
}

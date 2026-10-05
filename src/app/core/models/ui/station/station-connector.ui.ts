import { CPConnectorTypeID } from '@core/enums/station/cp-connector-type-id.enum';

export interface StationConnector {
  readonly amount: number;
  readonly available: number;
  readonly cpConnectorTypeId: CPConnectorTypeID;
  readonly name: string;
}

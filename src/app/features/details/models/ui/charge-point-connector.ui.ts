import { CPConnectorTypeID } from '@core/enums/station/cp-connector-type-id.enum';

export interface ChargePointConnector {
  readonly cpConnectorTypeId: CPConnectorTypeID;
  readonly name: string;
}

import { ConnectorIconName } from '@core/enums/station/connector-icon-name.enum';
import { ConnectorType } from '@core/enums/station/connector-type.enum';
import { CPConnectorTypeID } from '@core/enums/station/cp-connector-type-id.enum';

export interface ChargePointConnectorDto {
  readonly PK_CPConnectorTypeID: CPConnectorTypeID;
  readonly Name: string;
  readonly IconName: ConnectorIconName;
  readonly ConnectorType: ConnectorType;
}

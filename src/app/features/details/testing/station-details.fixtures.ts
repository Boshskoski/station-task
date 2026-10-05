import { ChargingStationType } from '@core/enums/station/charging-station-type.enum';
import { ConnectorIconName } from '@core/enums/station/connector-icon-name.enum';
import { ConnectorType } from '@core/enums/station/connector-type.enum';
import { CPConnectorTypeID } from '@core/enums/station/cp-connector-type-id.enum';
import { ChargePointStatus } from '@features/details/enums/charge-point-status.enum';
import { TypeCostCharging } from '@features/details/enums/type-cost-charging.enum';
import { ChargePointDto } from '@features/details/models/dto/charge-point.dto';
import { StationDetailsDto } from '@features/details/models/dto/station-details.dto';

export function chargePointDto(overrides: Partial<ChargePointDto> = {}): ChargePointDto {
  return {
    IsFavorite: false,
    PK_ChargePointID: 82387,
    Name: 'Zaptec Go',
    IsActive: true,
    IsOpen: true,
    CurrentStatus: ChargePointStatus.Preparing,
    MaxKWH: 22.17025033688163,
    MaxKW: 22.17025033688163,
    Volts: 400,
    ConnectorTypes: [
      {
        PK_CPConnectorTypeID: CPConnectorTypeID.Type2,
        Name: 'Type - 2',
        IconName: ConnectorIconName.Type2,
        ConnectorType: ConnectorType.Type2,
      },
    ],
    ChargerCode: 'V10D',
    ...overrides,
  };
}

export function stationDetailsDto(overrides: Partial<StationDetailsDto> = {}): StationDetailsDto {
  return {
    Summary: {
      PricingNow: {
        Type_Cost_Charging: TypeCostCharging.PerkWh,
        ChargingCostKWH: 0.5,
        CostPriceVATPercentage: 25,
        Currency: 'NOK',
        StartupCostPrice: 0.5,
      },
    },
    SupportInformation: {
      PhoneNumberString: '+47 000 00 000',
      SupportEmail: 'support@current.eco',
      SupportWebsite: 'https://current.eco',
      SupportCustomerServiceURL: 'https://support.current.eco',
    },
    OwnedByCompanyName: 'Current Eco AS',
    Currency: 'NOK',
    IsFavorite: false,
    Name: 'CURRENT ladegjerdet',
    Address: 'Frøyas gate 15',
    PostCode: '0273',
    Town: 'Oslo',
    StateOrProvince: 'Oslo',
    Country: 'Norway',
    Latitude: 59.916763,
    Longitude: 10.693517,
    kWhMin: 22.2,
    kWhMax: 22.2,
    IsOpen: true,
    ChargingPoints: [
      chargePointDto(),
      chargePointDto({
        PK_ChargePointID: 67272,
        Name: 'Aura 1',
        CurrentStatus: ChargePointStatus.Available,
        ChargerCode: 'YNYV',
      }),
    ],
    availableBoxes: 3,
    offlineBoxes: 5,
    totalBoxes: 9,
    Connectors: [
      {
        Amount: 9,
        Available: 3,
        PK_CPConnectorTypeID: CPConnectorTypeID.Type2,
        Name: 'Type - 2',
        IconName: ConnectorIconName.Type2,
        ConnectorType: ConnectorType.Type2,
      },
    ],
    OperatorName: 'CURRENT',
    OperatorLogoURL: 'https://apistoragesc.blob.core.windows.net/dashboardimagessc/current_c.png',
    IsActive: true,
    ChargingStationType: ChargingStationType.ApartmentBuilding,
    ...overrides,
  };
}

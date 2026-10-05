import { TestBed } from '@angular/core/testing';
import { CPConnectorTypeID } from '@core/enums/station/cp-connector-type-id.enum';
import { ChargePointStatus } from '@features/details/enums/charge-point-status.enum';
import { TypeCostCharging } from '@features/details/enums/type-cost-charging.enum';
import { chargePointDto, stationDetailsDto } from '@features/details/testing/station-details.fixtures';
import { StationDetailsMapper } from './station-details.mapper';

describe('StationDetailsMapper', () => {
  let mapper: StationDetailsMapper;

  beforeEach(() => {
    mapper = TestBed.inject(StationDetailsMapper);
  });

  it('maps the details fields the app uses, without the API wrapper objects', () => {
    const details = mapper.stationDetailsDtoToUi(
      stationDetailsDto({ ChargingPoints: [chargePointDto()] }),
    );

    expect(details).toEqual({
      pricing: {
        typeCostCharging: TypeCostCharging.PerkWh,
        chargingCostKWH: 0.5,
        costPriceVATPercentage: 25,
        currency: 'NOK',
        startupCostPrice: 0.5,
      },
      support: {
        phoneNumber: '+47 000 00 000',
        supportEmail: 'support@current.eco',
        supportWebsite: 'https://current.eco',
        supportCustomerServiceUrl: 'https://support.current.eco',
      },
      ownedByCompanyName: 'Current Eco AS',
      chargingPoints: [
        {
          chargePointId: 82387,
          name: 'Zaptec Go',
          isActive: true,
          isOpen: true,
          currentStatus: ChargePointStatus.Preparing,
          maxKW: 22.17025033688163,
          volts: 400,
          connectorTypes: [{ cpConnectorTypeId: CPConnectorTypeID.Type2, name: 'Type - 2' }],
          chargerCode: 'V10D',
        },
      ],
    });
  });

  it('keeps the charge points in API order with their statuses', () => {
    const details = mapper.stationDetailsDtoToUi(
      stationDetailsDto({
        ChargingPoints: [
          chargePointDto({ PK_ChargePointID: 2, CurrentStatus: ChargePointStatus.Available }),
          chargePointDto({ PK_ChargePointID: 1, CurrentStatus: ChargePointStatus.Preparing }),
        ],
      }),
    );

    expect(details.chargingPoints.map((p) => [p.chargePointId, p.currentStatus])).toEqual([
      [2, ChargePointStatus.Available],
      [1, ChargePointStatus.Preparing],
    ]);
  });

  it('maps a station without charge points', () => {
    const details = mapper.stationDetailsDtoToUi(stationDetailsDto({ ChargingPoints: [] }));

    expect(details.chargingPoints).toEqual([]);
  });
});

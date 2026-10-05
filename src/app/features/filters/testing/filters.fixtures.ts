import { CPConnectorTypeID } from '@core/enums/station/cp-connector-type-id.enum';
import { StationDto } from '@core/models/dto/station/station.dto';
import { stationConnectorDto, stationDto } from '@core/testing/station.fixtures';

export function filterStationDtos(): readonly StationDto[] {
  return [
    stationDto({ PK_ChargingStationID: 1, availableBoxes: 2 }),
    stationDto({ PK_ChargingStationID: 2, availableBoxes: 0 }),
    stationDto({
      PK_ChargingStationID: 3,
      availableBoxes: 0,
      Connectors: [
        stationConnectorDto({ PK_CPConnectorTypeID: CPConnectorTypeID.CCS2, Name: 'CCS2' }),
      ],
    }),
  ];
}

export function toggleCheckbox(root: ParentNode, label: string, checked: boolean): void {
  const checkbox = Array.from(root.querySelectorAll('ion-checkbox')).find(
    (element) => element.textContent?.trim() === label,
  );
  if (!checkbox) {
    throw new Error(`No checkbox labelled ${label}`);
  }
  checkbox.checked = checked;
  checkbox.dispatchEvent(new CustomEvent('ionChange', { detail: { checked } }));
}

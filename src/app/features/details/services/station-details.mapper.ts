import { Service } from '@angular/core';
import { ChargePointConnectorDto } from '@features/details/models/dto/charge-point-connector.dto';
import { ChargePointDto } from '@features/details/models/dto/charge-point.dto';
import { StationDetailsDto } from '@features/details/models/dto/station-details.dto';
import { StationPricingDto } from '@features/details/models/dto/station-pricing.dto';
import { StationSupportInformationDto } from '@features/details/models/dto/station-support-information.dto';
import { ChargePointConnector } from '@features/details/models/ui/charge-point-connector.ui';
import { ChargePoint } from '@features/details/models/ui/charge-point.ui';
import { StationDetails } from '@features/details/models/ui/station-details.ui';
import { StationPricing } from '@features/details/models/ui/station-pricing.ui';
import { StationSupportInformation } from '@features/details/models/ui/station-support-information.ui';

@Service()
export class StationDetailsMapper {
  stationDetailsDtoToUi(details: StationDetailsDto): StationDetails {
    return {
      pricing: this.pricingDtoToUi(details.Summary.PricingNow),
      support: this.supportInformationDtoToUi(details.SupportInformation),
      ownedByCompanyName: details.OwnedByCompanyName,
      chargingPoints: details.ChargingPoints.map((point) => this.chargePointDtoToUi(point)),
    };
  }

  private pricingDtoToUi(pricing: StationPricingDto): StationPricing {
    return {
      typeCostCharging: pricing.Type_Cost_Charging,
      chargingCostKWH: pricing.ChargingCostKWH,
      costPriceVATPercentage: pricing.CostPriceVATPercentage,
      currency: pricing.Currency,
      startupCostPrice: pricing.StartupCostPrice,
    };
  }

  private supportInformationDtoToUi(support: StationSupportInformationDto): StationSupportInformation {
    return {
      phoneNumber: support.PhoneNumberString,
      supportEmail: support.SupportEmail,
      supportWebsite: support.SupportWebsite,
      supportCustomerServiceUrl: support.SupportCustomerServiceURL,
    };
  }

  private chargePointDtoToUi(point: ChargePointDto): ChargePoint {
    return {
      chargePointId: point.PK_ChargePointID,
      name: point.Name,
      isActive: point.IsActive,
      isOpen: point.IsOpen,
      currentStatus: point.CurrentStatus,
      maxKW: point.MaxKW,
      volts: point.Volts,
      connectorTypes: point.ConnectorTypes.map((connector) =>
        this.chargePointConnectorDtoToUi(connector),
      ),
      chargerCode: point.ChargerCode,
    };
  }

  private chargePointConnectorDtoToUi(connector: ChargePointConnectorDto): ChargePointConnector {
    return {
      cpConnectorTypeId: connector.PK_CPConnectorTypeID,
      name: connector.Name,
    };
  }
}

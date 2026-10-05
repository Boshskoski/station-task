import { Service } from '@angular/core';
import { NominatimPlaceDto } from '@features/search/models/dto/nominatim-place.dto';
import { GeocodedPlace } from '@features/search/models/ui/geocoded-place.ui';

@Service()
export class GeocodingMapper {
  placesDtoToUi(places: readonly NominatimPlaceDto[]): readonly GeocodedPlace[] {
    return places.map((place) => this.placeDtoToUi(place));
  }

  private placeDtoToUi(place: NominatimPlaceDto): GeocodedPlace {
    const [south, north, west, east] = place.boundingbox;
    return {
      placeId: place.place_id,
      latitude: Number(place.lat),
      longitude: Number(place.lon),
      name: place.name,
      displayName: place.display_name,
      boundingBox: [Number(south), Number(north), Number(west), Number(east)],
    };
  }
}

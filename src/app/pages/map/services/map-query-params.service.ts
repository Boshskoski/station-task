import { inject, Service } from '@angular/core';
import { ParamMap, Params } from '@angular/router';
import { Favorites } from '@features/favorites/models/ui/favorites.ui';
import { FavoritesParserService } from '@features/favorites/services/favorites-parser.service';
import { StationFilters } from '@features/filters/models/ui/station-filters.ui';
import { StationFilterService } from '@features/filters/services/station-filter.service';
import { StationFiltersParserService } from '@features/filters/services/station-filters-parser.service';
import { MapUrlState } from '@pages/map/models/ui/map-url-state.ui';
import { ParsedMapUrlState } from '@pages/map/models/ui/parsed-map-url-state.ui';

@Service()
export class MapQueryParamsService {
  private static readonly STATION = 'station';
  private static readonly QUERY = 'q';
  private static readonly STATUS = 'status';
  private static readonly TYPE = 'type';
  private static readonly FAVORITES = 'favorites';
  private static readonly SEPARATOR = ',';
  private static readonly ID_PATTERN = /^[1-9]\d*$/;

  private readonly filtersParser = inject(StationFiltersParserService);
  private readonly stationFilter = inject(StationFilterService);
  private readonly favoritesParser = inject(FavoritesParserService);

  parse(params: ParamMap): ParsedMapUrlState {
    return {
      stationId: this.parseId(params.get(MapQueryParamsService.STATION)),
      query: params.get(MapQueryParamsService.QUERY)?.trim() || undefined,
      filters: this.parseFilters(params),
      favorites: this.parseFavorites(params.get(MapQueryParamsService.FAVORITES)),
    };
  }

  serialize({ stationId, query, filters, favorites }: MapUrlState): Params {
    const { availability, opening, connectorTypes } = filters;
    const status = [...availability, ...opening];
    return {
      ...(stationId !== undefined && { [MapQueryParamsService.STATION]: stationId }),
      ...(query !== undefined && { [MapQueryParamsService.QUERY]: query }),
      ...(status.length > 0 && {
        [MapQueryParamsService.STATUS]: status.join(MapQueryParamsService.SEPARATOR),
      }),
      ...(connectorTypes.length > 0 && {
        [MapQueryParamsService.TYPE]: connectorTypes.join(MapQueryParamsService.SEPARATOR),
      }),
      ...(favorites && { [MapQueryParamsService.FAVORITES]: JSON.stringify(favorites) }),
    };
  }

  private parseId(value: string | null): number | undefined {
    if (value === null || !MapQueryParamsService.ID_PATTERN.test(value)) {
      return undefined;
    }
    const id = Number(value);
    return Number.isSafeInteger(id) ? id : undefined;
  }

  private parseFilters(params: ParamMap): StationFilters | undefined {
    const status = this.parseList(params, MapQueryParamsService.STATUS);
    const filters = this.filtersParser.parse({
      availability: status,
      opening: status,
      connectorTypes: this.parseList(params, MapQueryParamsService.TYPE).map(Number),
    });
    return this.stationFilter.countActive(filters) > 0 ? filters : undefined;
  }

  private parseFavorites(value: string | null): Favorites | undefined {
    if (value === null) {
      return undefined;
    }
    try {
      const favorites = this.favoritesParser.parse(JSON.parse(value));
      return favorites.stations.length > 0 ? favorites : undefined;
    } catch {
      return undefined;
    }
  }

  private parseList(params: ParamMap, key: string): readonly string[] {
    return params.getAll(key).flatMap((value) => value.split(MapQueryParamsService.SEPARATOR));
  }
}

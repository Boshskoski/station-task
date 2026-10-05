# EV Charging Stations Map

An Ionic + Angular web app that shows EV charging stations on a map, with details, filters, address search, the user's location, clustering, favorites and URL-driven state. It works on desktop and mobile.

Data comes from two public mock endpoints (`dummyjson.com`): the station list and the station details.

## Setup

Requirements: Node 22+ and npm 11, Chrome for the tests.

```bash
npm install
npm start
```

Open `http://localhost:4200`. Other commands:

```bash
npm run build                                      # production build in dist/
npm test                                           # Karma + Jasmine in a visible Chrome, watch mode
npx ng test --no-watch --browsers=ChromeHeadless   # one headless run
npx ng test --no-watch --browsers=ChromeHeadless --coverage
```

## Using the app

| Feature | How |
|---|---|
| Station details | Click a marker. Desktop: a side panel. Mobile: a bottom sheet (`ion-modal` with breakpoints). Shows loading, error with Retry, and empty states. |
| Clusters | Click a cluster to zoom into it. Stations at identical coordinates fan out ("spiderfy") at the maximum zoom. |
| Filters | Availability (free chargers or not), opening (open or closed) and connector type. Saved in local storage. |
| Address search | Type 3+ characters (geocoded with Nominatim), pick a result or press Enter. |
| My location | The locate button in the top-right corner of the map. Permission denied, unsupported, insecure page and timeout each show their own message. |
| Favorites | Heart on a station or on a charge point ("connector") in the details. The Favorites button lists them; tapping a row opens that station and centres the map on it, and the heart in the list removes it. Saved in local storage and mirrored in the URL (see below). Favorites are local to the browser: the API's `IsFavorite` fields are mock values and are ignored. |
| Theme | Sun/moon button. Dark by default, the choice is saved. |
| Demo data | Add `?demo=10000` to the URL to load a synthetic dataset (up to 100,000 stations). |

### URL

State is in the query string, so a link restores the same view and Back/Forward step through it:

`/?station=34684&q=Oslo&status=available,open&type=4,7&favorites=%7B%22stations%22%3A%5B%7B%22stationId%22%3A34684%2C%22connectors%22%3A%5B%5D%7D%5D%7D`

- `station`: selected station id
- `q`: address search text
- `status`: `available`, `unavailable`, `open`, `closed`
- `type`: connector type ids (`4` Type 2, `6` CHAdeMO, `7` CCS2)
- `favorites`: the favorites list as URL-encoded JSON, for example `{"stations":[{"stationId":34684,"connectors":[{"id":5,"name":"Zaptec Go"}]}]}`. Connectors are grouped under their station and carry their name, so a link opened in another browser can show them without extra requests. The param is removed when there are no favorites.

Rules for links:

- **The URL never overwrites saved data on load.** A link's filters and favorites are shown in that tab only. They are saved only when the user changes something there (a filter, a heart). Back/Forward never saves.
- **A link without a param does not get one added.** A bare `/` keeps the saved filters and favorites on screen but not in the URL; they appear in the URL after the first user action.
- **A favorites link that differs from the saved list** is shown read-only, with the title "Favorites". Hearts then act on the list shown. The first heart click saves the link's list plus that change, so the last tab that changes favorites wins.
- Invalid values are dropped and the URL is corrected.
- Selecting a station pushes a history entry; filter, search and favorites changes replace the current one.

## Structure

```
src/app/
  core/       station API contract: station DTOs and UI models, enums, StationMapper,
              StationsApiService, StationsStore (the station list), StorageService
  shared/     page header, toolbar button, favorite label and plural pipes, viewport and
              theme services, non-modal popover directive, OverlayInsets type
  features/
    map/        MapLibre component, layers, clustering, spiderfy, camera
    details/    station details (panel, side panel, sheet), details store with the selection
    filters/    filter model, matching, persistence, popover (desktop) / sheet (mobile)
    search/     Nominatim geocoding, address search store and results popover
    location/   geolocation service, error handling, locate button
    favorites/  favorites store, persistence, list popover / sheet
    demo/       ?demo=N synthetic data (HTTP interceptor)
  pages/
    map/        map page: composes the features, pane state, URL sync
src/environments/environment.ts   API, geocoder and tile URLs
```

Layers and their rules:

- **Imports only go down:** `pages` → `features`, `shared`, `core`; a feature → `shared`, `core`, never another feature; `shared` → `core`; `core` imports nothing else. Anything used by one feature lives in that feature (services, stores, models, constants, test fixtures).
- **Stores are independent.** Each store owns one concern and injects only its own feature's services (API, storage, mapper), never another store.
- **Components** use their own feature's store, the core `StationsStore` and shared services. What belongs to another feature comes in through inputs and goes out through outputs. For example, the details panel gets the favorite ids and emits a toggle; it does not know `FavoritesStore`. The map declares its own input types (`MapPlace`, `MapPosition`), which the search and location models fit.
- **The page is where features meet.** `MapPage` combines the stores (the filtered list for the map, the station shown in the details) and handles actions that cross features: selecting a station closes the open pane and the address results, and opening a pane closes the details. `MapPageStore` holds only page state: which pane is open (filters or favorites, one at a time) and the camera focus.
- **`MapUrlSyncService` reads and writes every store on purpose.** Mirroring the state to the URL is cross-cutting by nature, so it lives in the page layer next to `MapPage`.

## Technical decisions

- **Standalone components, signals, OnPush, zoneless.** One signal store per concern (`StationsStore`, `FiltersStore`, `FavoritesStore`, `AddressSearchStore`, `StationDetailsStore`, `UserLocationStore`, `MapPageStore`). Requests use Angular `resource`/`rxResource`, so the status is Angular's own `ResourceStatus`.
- **The selection lives in `StationDetailsStore`.** A selected station is the station whose details are open, so the store that loads the details owns its id. `StationsStore` only holds the list. A station from a link is selected at once, and its details load while the list is still loading.
- **Overlay insets.** The details feature reports how much of the screen its side panel or sheet covers (`StationDetailsLayoutService.insets`). The page passes this to the map as `overlayInsets`, so the map keeps a focused or tapped station out of that area without knowing about the details.
- **MapLibre GL JS** (through `@maplibre/ngx-maplibre-gl`) instead of Leaflet. Clustering is the GeoJSON source's built-in supercluster running in a Web Worker, and stations are drawn on the GPU as layers, not as DOM markers. With Leaflet and supercluster, clustering and marker updates ran on the main thread; with MapLibre they run in a worker and on the GPU, so large datasets load faster and panning and zooming stay smooth. The trade-off is a bigger map chunk (lazy loaded, about 250 kB transferred) and markers that are canvas pixels, not focusable elements.
- **10k+ stations.** Filtering is a single pass over the stations. Filter changes are sent to the map as a diff (`GeoJSONSource.updateData`) instead of replacing all the data, because MapLibre serializes everything it sends to its worker on the main thread, so most filter changes no longer block the page at 50k stations. Layers are added with `map.addLayer` rather than `<mgl-layer>`, whose wrapper registers 13 listeners per layer, so every mouse move ran a hit test for each. Only the id, available count and open flag go into the GeoJSON; details come from the store by id.
- **Details cache.** The resource reports the latest request; the store reports what the user sees. A station that was already opened shows its last details at once and refreshes in the background, and a failed refresh keeps them.
- **Page header.** Each Ionic page keeps its own `ion-header` (Ionic's page model: `ion-content` sizes against its page's header and transitions animate whole pages), rendered through the shared `PageHeader` (logo, title, theme toggle). A page adds its own parts through named slots: `headerContent` next to the title, `headerActions` before the theme button, and extra toolbar rows. The map page uses them for the search and the Favorites/Filters buttons. A single global header with a portal service was rejected (global state, templates to register and clear on every navigation).
- **Overlays.** From 768 px: details side panel and filters/favorites popovers. Below: `ion-modal` sheets. Ionic is used for controls and overlays; plain elements for layout and app-specific UI. Touch targets grow to 44 px on coarse pointers.
- **Favorites model.** One shape everywhere (store, local storage, URL): `{ stations: [{ stationId, connectors: [{ id, name }] }] }`. A favorite connector always belongs to a favorite station: hearting a connector also hearts its station, removing a station removes its connectors, and removing the last connector keeps the station. "Connector" means a charge point, the unit that has a status and an id in the details endpoint. Stations are stored by id (the list is always loaded); connectors keep a name snapshot so the list can show them without fetching details. `FavoritesStore.shown` is the single definition of what the tab shows (its own saved list, or the list from a link); the list, the badge and every heart read it.
- **Persistence.** `StorageService` wraps `localStorage` with versioned keys (`stations.filters.v1`, `stations.favorites.v2`, `stations.theme.v1`). Stored data is treated as untrusted and validated on load; it never throws.
- **Geocoding.** Nominatim (free, no key), debounced, with in-flight requests cancelled. It is not a type-ahead service, so partial last words can return nothing; Photon would suit type-ahead better.
- **Location.** One-shot `getCurrentPosition` on a button press, no continuous tracking.
- **Directions.** The details card links to a Google Maps directions URL using the station coordinates.

## API notes

- The list has no status field, only `isOpen`, `isActive` and the counters `availableBoxes`, `occupiedBoxes`, `offlineBoxes`, `totalBoxes`, which do not always add up. The filters therefore use only `availableBoxes > 0` and `isOpen`; nothing is derived from the counters.
- The details endpoint is a mock that ignores the station id and returns the same details for every station. The app still requests details per station, because a real API would need the id. Because of that, a favorite connector is keyed by station id + charge point id, and the list station (not the details response) provides name, address and counters.
- The API's `kWhMin`/`kWhMax` are charger power, so the card shows them as kW.
- DTOs mirror the API response; UI models hold only the fields the app reads, and the mappers (`*.mapper.ts`) rename and flatten.
- The stations endpoint is served from a CDN cache that bakes in the first CORS origin (`http://localhost:4200`). Another origin or port may fail with a CORS error until the cache expires.

## Tests

About 420 unit and component specs (Jasmine + Karma, Angular `TestBed`, `HttpTestingController`). Coverage is about 90% of statements. They cover details fetching (API, mapper, store with loading/error/cache, panel states), filtering (matching rules, store, storage validation, components), address search (API, mapper, store, results states), favorites (store, storage, components), user location, URL parsing and sync with a real router, and the map component with a fake MapLibre instance.

Not covered by specs: real MapLibre rendering (needs WebGL); it was checked in a real browser.

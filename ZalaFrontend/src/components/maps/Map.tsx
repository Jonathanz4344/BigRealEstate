import GoogleMapReact from "google-map-react";
import { COLORS, CONFIG } from "../../config";
import { NightMapStyle } from "./MapStyles";
import { Icon, Icons } from "../icons";
import { MapElement } from "./MapElement";
import { forwardRef } from "react";
import {
  useMapComponent,
  type MapCoords,
  type MapRefHandle,
} from "../../hooks";

type MapPinProps = {
  iconName?: Icons;
  scale?: number;
  activeScale?: number;
  color?: string;
  activeColor?: string;
  active?: boolean;
  center: MapCoords;
  onClick?: () => void;
};

type MapProps = {
  center?: MapCoords;
  initialZoom?: number;
  pins?: MapPinProps[];
};

const DefaultProps: MapProps = {
  center: {
    lat: 43.08476,
    lng: -77.67509,
  },
  initialZoom: 13,
  pins: [
    // {
    //   center: {
    //     lat: 43.08476,
    //     lng: -77.67509,
    //   },
    // },
    // {
    //   center: {
    //     lat: 43.1391794,
    //     lng: -77.599973,
    //   },
    // },
    // {
    //   center: {
    //     lat: 43.0093451,
    //     lng: -78.8141774,
    //   },
    // },
  ],
};

export const Map = forwardRef<MapRefHandle, MapProps>(
  (
    {
      center: propsCenter = DefaultProps.center,
      initialZoom: propsZoom = DefaultProps.initialZoom,
      pins = DefaultProps.pins,
    }: MapProps,
    ref
  ) => {
    const initialCenter = propsCenter ?? (DefaultProps.center as MapCoords);
    const initialZoom = propsZoom ?? (DefaultProps.initialZoom as number);

    const { center, zoom, onMapChange, onMarkerClick } = useMapComponent({
      ref,
      initialCenter,
      initialZoom,
    });

    return (
      <div className="w-full h-full">
        <GoogleMapReact
          // ref={mapRef}
          bootstrapURLKeys={{ key: CONFIG.keys.google.maps }}
          yesIWantToUseGoogleMapApiInternals
          defaultCenter={initialCenter}
          center={center}
          defaultZoom={initialZoom}
          zoom={zoom}
          options={{ styles: NightMapStyle }}
          onChange={onMapChange}
          onChildClick={onMarkerClick}
        >
          {(pins ?? []).map((pin, index) => (
            <MapElement
              key={index}
              lat={pin.center.lat}
              lng={pin.center.lng}
              active={pin.active}
              onClick={pin.onClick}
            >
              <Icon
                name={pin.iconName ?? Icons.UserPin}
                scale={pin.active ? pin.activeScale ?? 2 : pin.scale ?? 1.75}
                hoverScale={pin.activeScale ?? 2}
                color={
                  pin.active
                    ? pin.activeColor ?? COLORS.accent
                    : pin.color ?? COLORS.white
                }
                hoverColor={pin.activeColor ?? COLORS.accent}
              />
            </MapElement>
          ))}
        </GoogleMapReact>
      </div>
    );
  }
);

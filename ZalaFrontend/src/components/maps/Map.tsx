import GoogleMapReact from "google-map-react";
import { COLORS, CONFIG } from "../../config";
import { NightMapStyle } from "./MapStyles";
import { Icon, Icons } from "../icons";
import { MapElement } from "./MapElement";
import { forwardRef, useState } from "react";
import {
  useMapComponent,
  type MapCoords,
  type MapRefHandle,
} from "../../hooks";
import { MapInfoBox, type MapPinInfo } from "./MapInfoBox";

type MapPinProps = {
  iconName?: Icons;
  scale?: number;
  activeScale?: number;
  color?: string;
  activeColor?: string;
  active?: boolean;
  center: MapCoords;
  onClick?: () => void;
  info?: MapPinInfo;
};

type MapProps = {
  center?: MapCoords;
  initialZoom?: number;
  pins?: MapPinProps[];
  dimsRef?: React.RefObject<HTMLDivElement | null>;
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
      dimsRef,
    }: MapProps,
    ref,
  ) => {
    const initialCenter = propsCenter ?? (DefaultProps.center as MapCoords);
    const initialZoom = propsZoom ?? (DefaultProps.initialZoom as number);

    const [selectedPin, setSelectedPin] = useState<number | null>(null);

    const { center, zoom, onMapChange, onMarkerClick } = useMapComponent({
      ref,
      initialCenter,
      initialZoom,
    });

    const handleChildClick = (
      hoverKey: string | number,
      childProps: MapCoords & unknown,
    ) => {
      const key = Number(hoverKey);
      onMarkerClick(key, childProps);
      setSelectedPin((prev) => (prev === key ? null : key));
    };

    return (
      <div ref={dimsRef} className="w-full h-full">
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
          onChildClick={handleChildClick}
          onClick={() => setSelectedPin(null)}
        >
          {(pins ?? []).map(
            (pin, index) =>
              pin && (
                <MapElement
                  key={index}
                  lat={pin.center.lat}
                  lng={pin.center.lng}
                  active={pin.active || selectedPin === index}
                  onClick={pin.onClick}
                >
                  {selectedPin === index && pin.info && (
                    <MapInfoBox
                      info={pin.info}
                      onClose={() => setSelectedPin(null)}
                    />
                  )}
                  <Icon
                    name={pin.iconName ?? Icons.UserPin}
                    scale={
                      pin.active ? (pin.activeScale ?? 2) : (pin.scale ?? 1.75)
                    }
                    hoverScale={pin.activeScale ?? 2}
                    color={
                      pin.active
                        ? (pin.activeColor ?? COLORS.accent)
                        : (pin.color ?? COLORS.white)
                    }
                    hoverColor={pin.activeColor ?? COLORS.accent}
                  />
                </MapElement>
              ),
          )}
        </GoogleMapReact>
      </div>
    );
  },
);

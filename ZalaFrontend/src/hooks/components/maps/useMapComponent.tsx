import React, { useImperativeHandle, useState } from "react";
import GoogleMapReact from "google-map-react";

export type MapCoords = {
  lat: number;
  lng: number;
};

export type MapRefHandle = {
  centerMap: (coords: MapCoords, zoom?: number) => void;
  initialMap: () => void;
};

type UseMapComponentProps = {
  ref: React.ForwardedRef<MapRefHandle>;
  initialCenter: MapCoords;
  initialZoom: number;
};

export const useMapComponent = ({
  ref,
  initialCenter,
  initialZoom,
}: UseMapComponentProps) => {
  const [center, setCenter] = useState<MapCoords>(initialCenter);
  const [zoom, setZoom] = useState(initialZoom);

  const centerMap = (coords: MapCoords, zoom: number = initialZoom) => {
    setCenter(coords);
    setZoom(zoom);
  };

  useImperativeHandle(ref, () => ({
    centerMap,
    initialMap: () => centerMap(initialCenter),
  }));

  const onMapChange = (val: GoogleMapReact.ChangeEventValue) => {
    centerMap(val.center, val.zoom);
  };

  const onMarkerClick = (
    _hoverKey: number,
    childProps: MapCoords & unknown
  ) => {
    centerMap({ lat: childProps.lat, lng: childProps.lng });
  };

  return {
    center,
    zoom,

    onMapChange,
    onMarkerClick,
  };
};

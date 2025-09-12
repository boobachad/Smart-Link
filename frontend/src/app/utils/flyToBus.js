
const FlyToBus = ({ busCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (busCoords) {
      map.flyTo([busCoords.lat, busCoords.lng], 15, { duration: 1.5 });
    }
  }, [busCoords, map]);

  return null;
};

const buildQueries = (address) => {
  const normalized = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode,
    address.country || 'India'
  ].filter(Boolean).join(', ')
    .replace(/\bTamilnadu\b/gi, 'Tamil Nadu')
    .replace(/\bTuticorin\b/gi, 'Thoothukudi');
  const postalCode = normalized.match(/\b\d{6}\b/)?.[0];
  const city = normalized.match(/Thoothukudi/i)?.[0] || address.city || '';
  return [normalized, city ? `${city}, Tamil Nadu, India` : '', postalCode && city ? `${postalCode}, ${city}, Tamil Nadu, India` : '', postalCode ? `${postalCode}, Tamil Nadu, India` : '']
    .filter((query, index, all) => query && all.indexOf(query) === index);
};

export async function geocodeAddress(address) {
  for (const query of buildQueries(address)) {
    const params = new URLSearchParams({
      format: 'jsonv2',
      limit: '1',
      countrycodes: 'in',
      addressdetails: '1',
      q: query
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`Address lookup failed with status ${response.status}`);
    const result = (await response.json())[0];
    if (result && Number.isFinite(Number(result.lat)) && Number.isFinite(Number(result.lon))) {
      return { latitude: Number(result.lat), longitude: Number(result.lon), displayName: result.display_name };
    }
  }
  throw new Error('Address not found');
}

export function getCurrentCoordinates() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Location is not supported by this browser'));
      return;
    }
    let bestCoords = null;
    let settled = false;
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        if (!bestCoords || coords.accuracy < bestCoords.accuracy) bestCoords = coords;
        if (coords.accuracy <= 100) {
          settled = true;
          navigator.geolocation.clearWatch(watchId);
          resolve(coords);
        }
      },
      (error) => {
        if (!settled) {
          settled = true;
          navigator.geolocation.clearWatch(watchId);
          reject(error);
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
    window.setTimeout(() => {
      if (!settled) {
        settled = true;
        navigator.geolocation.clearWatch(watchId);
        if (bestCoords && bestCoords.accuracy <= 10000) resolve(bestCoords);
        else if (bestCoords) reject(new Error(`Location accuracy is too low: ${Math.round(bestCoords.accuracy)} meters`));
        else reject(new Error('No location reading was received'));
      }
    }, 20000);
  });
}

export async function reverseGeocodeCoordinates(latitude, longitude) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    zoom: '18',
    lat: String(latitude),
    lon: String(longitude)
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
    headers: { Accept: 'application/json' }
  });
  if (!response.ok) throw new Error(`Location lookup failed with status ${response.status}`);
  const result = await response.json();
  const address = result.address || {};
  return {
    addressLine1: [address.house_number, address.road].filter(Boolean).join(' ') || address.road || '',
    addressLine2: address.suburb || address.neighbourhood || address.quarter || '',
    city: address.city || address.town || address.village || address.county || '',
    state: address.state || '',
    postalCode: address.postcode || '',
    country: address.country || 'India',
    latitude,
    longitude,
    displayName: result.display_name || ''
  };
}

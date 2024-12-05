export interface Store {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number]; // [latitude, longitude]
  phone: string;
  opening_hours: string;
}

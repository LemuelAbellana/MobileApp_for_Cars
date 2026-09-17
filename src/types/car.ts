export type Car = {
  id: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  price: number;
  fuel_type: string;
  transmission: string;
  picture: string;
};

export type CarInput = Omit<Car, 'id'>;

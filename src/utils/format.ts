const pesos = new Intl.NumberFormat('en-PH', {
  style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 2,
});

export const formatPrice = (price: number) => pesos.format(price);

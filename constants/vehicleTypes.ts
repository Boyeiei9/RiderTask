export const VEHICLE_TYPES = [
    { id: 'motorcycle', title: 'รถมอเตอร์ไซค์', basePrice: 40, pricePerKm: 10, maxWeight: 20 },
    { id: 'car', title: 'รถยนต์', basePrice: 80, pricePerKm: 15, maxWeight: 80 },
    { id: 'pickup', title: 'รถกระบะ', basePrice: 150, pricePerKm: 20, maxWeight: 1000 },
    { id: 'truck', title: 'รถ 6 ล้อ', basePrice: 500, pricePerKm: 50, maxWeight: 5000 },
];

export const calculatePrice = (vehicleId: string, distanceKm: number) => {
    const vehicle = VEHICLE_TYPES.find(v => v.id === vehicleId);
    if (!vehicle) return 0;
    return vehicle.basePrice + (vehicle.pricePerKm * distanceKm);
};

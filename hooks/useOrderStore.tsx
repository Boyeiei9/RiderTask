import React, { createContext, useContext, useState } from 'react';

export interface LocationData {
    address: string;
    latitude: number;
    longitude: number;
}

interface OrderContextProps {
    origin: LocationData | null;
    setOrigin: (data: LocationData | null) => void;
    destination: LocationData | null;
    setDestination: (data: LocationData | null) => void;
    clearOrderState: () => void;
}

const OrderContext = createContext<OrderContextProps>({
    origin: null,
    setOrigin: () => { },
    destination: null,
    setDestination: () => { },
    clearOrderState: () => { },
});

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
    const [origin, setOrigin] = useState<LocationData | null>(null);
    const [destination, setDestination] = useState<LocationData | null>(null);

    const clearOrderState = () => {
        setOrigin(null);
        setDestination(null);
    };

    return (
        <OrderContext.Provider value={{ origin, setOrigin, destination, setDestination, clearOrderState }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrderStore = () => useContext(OrderContext);

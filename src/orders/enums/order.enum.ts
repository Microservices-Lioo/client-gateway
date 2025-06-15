export enum OrderStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
    CANCELLED = 'CANCELLED',

}

export const OrderStatusList = [
    OrderStatus.PENDING,
    OrderStatus.PAID,
    OrderStatus.FAILED,
    OrderStatus.REFUNDED,
    OrderStatus.CANCELLED,
];

export enum Currency {
    USD = 'USD'
}

export const CurrencyList = [
    Currency.USD
];

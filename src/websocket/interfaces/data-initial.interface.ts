export interface IStatusCount { endTime: number, duration: number }
export interface ITableWinners {
    socketId: string;
    userId: string;
    cardId: string;
    fullnames: string;
    status: string;
}
export enum HostActivity {
    MEZCLANDO = 'mezclando',
    ESPERANDO = 'esperando',
    CANTANDO = 'cantando',
}
export interface IDataInitial {
    statusCount: IStatusCount,
    countUser: number,
    tableWinners: ITableWinners[],
    hostActivity: HostActivity
}
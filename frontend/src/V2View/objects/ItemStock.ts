export interface ItemStock {
    id: number;
    name: string;
    categoryId: number;
    categoryName: string;
    quantityOnHand: number;
}

export interface AdjustItemStockDTO {
    categoryName   : string;
    itemName       : string;
    itemStockId: number;
    refNo: string;
    stockType: number;
    userId: number;
    quantity: number;
}


export interface ItemStockHistoryDTO {
    id: number;
    itemStockId: number;
    userId: number;
    itemName: string;
    categoryName: string;
    userName: string;
    refNo: string;
    quantity: number;
    previousQuantity: number;
    currentQuantity: number;
    stockType: number;
    date: Date;
}

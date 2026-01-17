export interface Receipt {
  id: string;
  userId: string;
  storeName: string;
  scannedAt: Date;
  totalAmount: string; // stored as numeric in DB, returned as string
  imageUrl?: string | null;
  ocrRawData?: any;
  itemsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReceiptInput {
  storeName: string;
  totalAmount: number;
  imageUrl?: string;
  ocrRawData?: any;
  itemsCount: number;
}

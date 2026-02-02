
export interface ShoppingItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  checked: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  createdAt: number;
  items: ShoppingItem[];
  archived?: boolean;
}

export interface GlobalStats {
  totalListsEver: number;
}

export type View = 'HOME' | 'DETAIL';

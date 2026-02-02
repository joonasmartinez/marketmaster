
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingList, ShoppingItem } from '../types';
import { Modal } from './Modal';

interface ShoppingListDetailProps {
  list: ShoppingList;
  onBack: () => void;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void;
  onUpdateItem: (itemId: string, updates: Partial<ShoppingItem>) => void;
  onDeleteItem: (itemId: string) => void;
}

type TotalViewMode = 'BOUGHT' | 'ESTIMATED';

export const ShoppingListDetail: React.FC<ShoppingListDetailProps> = ({ 
  list, 
  onBack, 
  onAddItem, 
  onUpdateItem, 
  onDeleteItem 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ShoppingItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState<string>('1');
  const [totalMode, setTotalMode] = useState<TotalViewMode>('BOUGHT');

  useEffect(() => {
    if (editingItem) {
      setItemName(editingItem.name);
      setItemPrice(editingItem.price.toString());
      setItemQuantity(editingItem.quantity.toString());
      setIsModalOpen(true);
    }
  }, [editingItem]);

  const subtotalOfInput = (parseFloat(itemPrice) || 0) * (parseFloat(itemQuantity) || 0);
  const estimatedTotal = list.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const boughtTotal = list.items
    .filter(item => item.checked)
    .reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const sortedItems = [...list.items].sort((a, b) => 
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  );

  const handleConfirmAction = () => {
    if (itemName.trim()) {
      const data = {
        name: itemName.trim(),
        price: parseFloat(itemPrice) || 0,
        quantity: parseFloat(itemQuantity) || 1
      };
      if (editingItem) onUpdateItem(editingItem.id, data);
      else onAddItem(data);
      handleCloseModal();
    }
  };

  const handleOpenNewItem = () => {
    setEditingItem(null);
    setItemName('');
    setItemPrice('');
    setItemQuantity('1');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onDeleteItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors">
      <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg px-6 pt-4 pb-4 flex items-center z-30 border-b border-gray-100 dark:border-gray-800">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 dark:text-gray-500 hover:text-emerald-500 active:scale-90 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate flex-1 ml-2">{list.name}</h1>
        
        <div className="flex items-center gap-2">
          <div 
            onClick={() => setTotalMode(prev => prev === 'BOUGHT' ? 'ESTIMATED' : 'BOUGHT')}
            className="bg-emerald-500 px-4 py-2 rounded-2xl text-white shadow-md active:scale-95 transition-all cursor-pointer select-none"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest leading-none opacity-80 mb-0.5 text-center">
              {totalMode === 'BOUGHT' ? 'Já Peguei' : 'Previsão'}
            </p>
            <p className="text-base font-black leading-none text-center">
              {(totalMode === 'BOUGHT' ? boughtTotal : estimatedTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 pb-32">
        {list.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-400 dark:text-gray-600 opacity-60">
            <p className="text-lg font-bold">Lista vazia</p>
            <p className="text-sm">Toque no botão abaixo para somar itens.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedItems.map((item) => (
              <div 
                key={item.id} 
                className={`bg-white dark:bg-gray-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 transition-all ${item.checked ? 'bg-gray-50 dark:bg-gray-800/40 border-transparent opacity-70' : ''}`}
              >
                <div 
                  className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                    item.checked ? 'bg-emerald-500 border-emerald-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => onUpdateItem(item.id, { checked: !item.checked })}
                >
                  {item.checked && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0" onClick={() => onUpdateItem(item.id, { checked: !item.checked })}>
                  <h4 className={`font-bold text-gray-800 dark:text-gray-100 truncate ${item.checked ? 'line-through text-gray-400 dark:text-gray-500 font-medium' : ''}`}>
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {item.quantity}x {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <p className={`font-black text-emerald-600 dark:text-emerald-400 ${item.checked ? 'text-emerald-400 dark:text-emerald-600' : ''}`}>
                    {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingItem(item)} className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-xl hover:text-emerald-500 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => setItemToDelete(item)} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-300 dark:text-red-500 rounded-xl hover:text-red-500 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-50 via-gray-50 dark:from-gray-950 dark:via-gray-950 to-transparent pt-10">
        <button 
          onClick={handleOpenNewItem}
          className="w-full max-w-md mx-auto flex items-center justify-center gap-3 bg-emerald-500 text-white font-bold py-5 rounded-[24px] shadow-xl active:scale-95 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Item
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? "Editar Item" : "Novo Item"}
      >
        <div className="flex flex-col gap-6">
          <input 
            type="text" 
            autoFocus
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Nome do produto"
            className="w-full px-5 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-semibold"
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Preço Un.</label>
              <input 
                type="number" 
                step="0.01"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-5 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Qtd.</label>
              <input 
                type="number" 
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
                placeholder="1"
                className="w-full px-5 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 dark:text-white border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold"
              />
            </div>
          </div>
          
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-[24px] flex justify-between items-center border border-emerald-100/50 dark:border-emerald-800/50">
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Total deste item</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {subtotalOfInput.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          <button 
            onClick={handleConfirmAction}
            disabled={!itemName.trim()}
            className={`w-full font-black py-5 rounded-[24px] shadow-lg transition-all ${
              itemName.trim() 
                ? 'bg-emerald-500 text-white active:scale-95' 
                : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            {editingItem ? 'Salvar Alterações' : 'Adicionar na Lista'}
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={!!itemToDelete} 
        onClose={() => setItemToDelete(null)} 
        title="Confirmar Exclusão"
      >
        <div className="flex flex-col gap-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">
            Deseja excluir o item <span className="font-bold text-gray-800 dark:text-white">"{itemToDelete?.name}"</span>?
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setItemToDelete(null)}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold py-4 rounded-2xl active:scale-95 transition-all"
            >
              Não
            </button>
            <button 
              onClick={confirmDelete}
              className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
            >
              Sim
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

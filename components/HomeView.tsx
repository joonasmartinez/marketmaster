
import React, { useState, useRef } from 'react';
import { ShoppingList, ShoppingItem, GlobalStats } from '../types';
import { Modal } from './Modal';
import { Drawer } from './Drawer';

interface HomeViewProps {
  lists: ShoppingList[];
  onAddList: (name: string) => void;
  onDeleteList: (id: string) => void;
  onArchiveList: (id: string, archive?: boolean) => void;
  onRenameList: (id: string, newName: string) => void;
  onSelectList: (id: string) => void;
  onImportCSV: (name: string, items: ShoppingItem[]) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  stats: GlobalStats;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
  lists, 
  onAddList, 
  onDeleteList, 
  onArchiveList,
  onRenameList, 
  onSelectList, 
  onImportCSV,
  isDarkMode, 
  toggleTheme,
  stats
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isArchivedModalOpen, setIsArchivedModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [copied, setCopied] = useState(false);

  // States for Long Press Actions
  const [selectedListForActions, setSelectedListForActions] = useState<ShoppingList | null>(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  const longPressTimer = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeLists = lists.filter(l => !l.archived);
  const archivedLists = lists.filter(l => l.archived);

  const handleConfirm = () => {
    if (newListName.trim()) {
      onAddList(newListName.trim());
      setNewListName('');
      setIsModalOpen(false);
    }
  };

  const handleRenameConfirm = () => {
    if (selectedListForActions && renameValue.trim()) {
      onRenameList(selectedListForActions.id, renameValue.trim());
      setIsRenameModalOpen(false);
      setSelectedListForActions(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedListForActions) {
      onDeleteList(selectedListForActions.id);
      setIsDeleteConfirmOpen(false);
      setSelectedListForActions(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      const items: ShoppingItem[] = [];
      const startIdx = lines[0].toLowerCase().includes('item') ? 1 : 0;

      for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (parts.length >= 2) {
          items.push({
            id: (Date.now() + i).toString(),
            name: parts[0].replace(/"/g, '').trim(),
            price: parseFloat(parts[1]) || 0,
            quantity: parseFloat(parts[2]) || 1,
            checked: parts[4]?.toLowerCase().includes('sim') || false
          });
        }
      }

      if (items.length > 0) {
        onImportCSV(`Importada: ${file.name.replace('.csv', '')}`, items);
        setIsDrawerOpen(false);
      }
    };
    reader.readAsText(file);
  };

  const exportCSV = () => {
    if (!selectedListForActions) return;
    const header = "Item,Preco,Quantidade,Total,Comprado\n";
    const rows = selectedListForActions.items.map(item => {
      return `"${item.name}",${item.price},${item.quantity},${(item.price * item.quantity).toFixed(2)},${item.checked ? 'Sim' : 'Nao'}`;
    }).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + header + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedListForActions.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSelectedListForActions(null);
  };

  const copyPix = () => {
    navigator.clipboard.writeText('04509822030');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startLongPress = (list: ShoppingList) => {
    longPressTimer.current = window.setTimeout(() => {
      setSelectedListForActions(list);
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }, 600);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const totalSpentOnAllLists = lists.reduce((acc, list) => {
    return acc + list.items.filter(i => i.checked).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, 0);

  const fullListsCompleted = lists.filter(list => list.items.length > 0 && list.items.every(i => i.checked)).length;
  const totalItemsChecked = lists.reduce((acc, list) => acc + list.items.filter(i => i.checked).length, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-gray-900 px-6 pt-8 pb-6 flex justify-between items-end border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div>
          <p className="text-emerald-500 font-bold text-xs uppercase tracking-widest mb-1">MarketMaster</p>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Listas</h1>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl active:scale-90 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </header>

      <main className="flex-1 p-6 space-y-4">
        {activeLists.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-lg font-bold text-gray-600 dark:text-gray-400">Nenhuma lista ativa</p>
            <p className="text-sm text-center">Crie uma nova lista ou verifique o arquivo.</p>
          </div>
        ) : (
          activeLists.map((list) => (
            <div 
              key={list.id} 
              onMouseDown={() => startLongPress(list)}
              onMouseUp={cancelLongPress}
              onMouseLeave={cancelLongPress}
              onTouchStart={() => startLongPress(list)}
              onTouchEnd={cancelLongPress}
              onClick={() => onSelectList(list.id)}
              className="bg-white dark:bg-gray-900 p-5 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.98] active:bg-gray-50 dark:active:bg-gray-800 transition-all flex justify-between items-center group cursor-pointer select-none"
            >
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{list.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                    {list.items.length} {list.items.length === 1 ? 'item' : 'itens'}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(list.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-full text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))
        )}
      </main>

      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-emerald-500 text-white rounded-full shadow-[0_8px_30px_rgb(16,185,129,0.3)] flex items-center justify-center active:scale-90 transition-all z-20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Lista">
        <div className="space-y-6">
          <input 
            type="text" autoFocus value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Nome (ex: Mercado de Sábado)"
            className="w-full px-5 py-4 rounded-[20px] bg-gray-100 dark:bg-gray-800 dark:text-white border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-lg"
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          />
          <button onClick={handleConfirm} className="w-full bg-emerald-500 text-white font-bold py-5 rounded-[20px] shadow-lg active:scale-95 transition-all">
            Criar Agora
          </button>
        </div>
      </Modal>

      {/* Menu de Ações (Toque Longo) */}
      <Modal isOpen={!!selectedListForActions && !isRenameModalOpen && !isDeleteConfirmOpen} onClose={() => setSelectedListForActions(null)} title={selectedListForActions?.name || "Ações"}>
        <div className="space-y-3">
          <button onClick={() => { setRenameValue(selectedListForActions?.name || ''); setIsRenameModalOpen(true); }} className="w-full flex items-center gap-4 p-5 rounded-3xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 active:scale-95 transition-all">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></div>
            <span className="font-bold text-lg">Renomear</span>
          </button>

          <button 
            onClick={() => {
              if (selectedListForActions) {
                onArchiveList(selectedListForActions.id, !selectedListForActions.archived);
                setSelectedListForActions(null);
              }
            }} 
            className="w-full flex items-center gap-4 p-5 rounded-3xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 active:scale-95 transition-all"
          >
            <div className="p-2 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <span className="font-bold text-lg">{selectedListForActions?.archived ? 'Desarquivar' : 'Arquivar'}</span>
          </button>

          <button onClick={exportCSV} className="w-full flex items-center gap-4 p-5 rounded-3xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 active:scale-95 transition-all">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg></div>
            <span className="font-bold text-lg">Compartilhar CSV</span>
          </button>
          
          <button onClick={() => setIsDeleteConfirmOpen(true)} className="w-full flex items-center gap-4 p-5 rounded-3xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 active:scale-95 transition-all">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></div>
            <span className="font-bold text-lg">Excluir</span>
          </button>
        </div>
      </Modal>

      <Modal isOpen={isRenameModalOpen} onClose={() => { setIsRenameModalOpen(false); setSelectedListForActions(null); }} title="Renomear Lista">
        <div className="space-y-6">
          <input type="text" autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} className="w-full px-5 py-4 rounded-[20px] bg-gray-100 dark:bg-gray-800 dark:text-white border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-lg" onKeyDown={(e) => e.key === 'Enter' && handleRenameConfirm()} />
          <button onClick={handleRenameConfirm} className="w-full bg-emerald-500 text-white font-bold py-5 rounded-[20px] shadow-lg active:scale-95 transition-all">Salvar Alteração</button>
        </div>
      </Modal>

      <Modal isOpen={isDeleteConfirmOpen} onClose={() => { setIsDeleteConfirmOpen(false); setSelectedListForActions(null); }} title="Confirmar Exclusão">
        <div className="text-center space-y-6">
          <p className="text-lg text-gray-600 dark:text-gray-300">Tem certeza que deseja excluir a lista <span className="font-bold text-gray-800 dark:text-white">"{selectedListForActions?.name}"</span>?</p>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => { setIsDeleteConfirmOpen(false); setSelectedListForActions(null); }} className="w-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold py-4 rounded-2xl active:scale-95 transition-all">Não</button>
            <button onClick={handleDeleteConfirm} className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all">Sim, Excluir</button>
          </div>
        </div>
      </Modal>

      {/* Modal Estatísticas */}
      <Modal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} title="Seu Impacto">
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-3xl border border-emerald-100 dark:border-emerald-800/50">
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">Total Gasto</p>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                {totalSpentOnAllLists.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-3xl border border-blue-100 dark:border-blue-800/50">
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Itens Comprados</p>
              <p className="text-xl font-black text-blue-700 dark:text-blue-300">{totalItemsChecked}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-3xl border border-purple-100 dark:border-purple-800/50">
              <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase mb-1">Listas Criadas</p>
              <p className="text-xl font-black text-purple-700 dark:text-purple-300">{stats.totalListsEver}</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-3xl border border-orange-100 dark:border-orange-800/50">
              <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase mb-1">Concluídas</p>
              <p className="text-xl font-black text-orange-700 dark:text-orange-300">{fullListsCompleted}</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4">Eficiência Geral</p>
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3" className="dark:stroke-gray-800" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={`${lists.length > 0 ? (fullListsCompleted / lists.length) * 100 : 0} 100`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-gray-800 dark:text-white">{lists.length > 0 ? Math.round((fullListsCompleted / lists.length) * 100) : 0}%</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Sucesso</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Arquivadas */}
      <Modal isOpen={isArchivedModalOpen} onClose={() => setIsArchivedModalOpen(false)} title="Arquivadas">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {archivedLists.length === 0 ? (
            <p className="text-center text-gray-500 py-10">Nenhuma lista arquivada.</p>
          ) : (
            archivedLists.map(list => (
              <div key={list.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-3xl flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 dark:text-white truncate">{list.name}</h4>
                  <p className="text-xs text-gray-500">{list.items.length} itens</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onArchiveList(list.id, false)} className="p-2 bg-emerald-100 text-emerald-600 rounded-xl active:scale-90 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </button>
                  <button onClick={() => onDeleteList(list.id)} className="p-2 bg-red-100 text-red-600 rounded-xl active:scale-90 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      <Modal isOpen={isDonationModalOpen} onClose={() => setIsDonationModalOpen(false)} title="Apoiar o App">
        <div className="text-center space-y-6">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 leading-relaxed">Fiz esse aplicativo querendo te ajudar! Espero que você esteja feliz usando ele. ❤️</p>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Sua contribuição ajuda muito</p>
            <p className="text-emerald-700 dark:text-emerald-300 font-bold">Chave PIX: 04509822030</p>
          </div>
          <button onClick={copyPix} className={`w-full font-bold py-5 rounded-[20px] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${copied ? 'bg-gray-800 text-white' : 'bg-emerald-500 text-white'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            {copied ? 'Copiado!' : 'Copiar Chave PIX - CPF'}
          </button>
        </div>
      </Modal>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <div className="p-4 flex flex-col h-full">
          <div className="space-y-2 flex-1">
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-700 dark:text-gray-200 transition-colors" onClick={() => { setIsDrawerOpen(false); setIsModalOpen(true); }}>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl text-emerald-600 dark:text-emerald-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></div>
              <span className="font-bold text-lg">Nova Lista</span>
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-700 dark:text-gray-200 transition-colors" onClick={() => fileInputRef.current?.click()}>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></div>
              <span className="font-bold text-lg">Importar CSV</span>
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-700 dark:text-gray-200 transition-colors" onClick={() => { setIsDrawerOpen(false); setIsArchivedModalOpen(true); }}>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-xl text-orange-600 dark:text-orange-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg></div>
              <span className="font-bold text-lg">Arquivadas</span>
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-200 transition-colors" onClick={toggleTheme}>
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400">{isDarkMode ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}</div>
              <span className="font-bold text-lg">{isDarkMode ? 'Modo Dia' : 'Modo Noite'}</span>
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-700 dark:text-gray-200 transition-colors" onClick={() => { setIsDrawerOpen(false); setIsStatsModalOpen(true); }}>
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></div>
              <span className="font-bold text-lg">Estatísticas</span>
            </button>
          </div>
          <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
            <button onClick={() => { setIsDrawerOpen(false); setIsDonationModalOpen(true); }} className="w-full flex items-center justify-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600 dark:text-emerald-400 font-bold active:scale-95 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              Apoiar Desenvolvedor
            </button>
            <p className="text-[10px] text-gray-400 dark:text-gray-600 font-bold text-center mt-4 uppercase tracking-widest">MarketMaster v1.0.0</p>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

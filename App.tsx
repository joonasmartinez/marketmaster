
import React, { useState, useEffect } from 'react';
import { ShoppingList, View, ShoppingItem, GlobalStats } from './types';
import { HomeView } from './components/HomeView';
import { ShoppingListDetail } from './components/ShoppingListDetail';

const STORAGE_KEY = 'marketmaster_lists_v1';
const THEME_KEY = 'marketmaster_theme';
const STATS_KEY = 'marketmaster_stats';

const App: React.FC = () => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [currentView, setCurrentView] = useState<View>('HOME');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [stats, setStats] = useState<GlobalStats>({ totalListsEver: 0 });

  // Load from local storage
  useEffect(() => {
    const savedLists = localStorage.getItem(STORAGE_KEY);
    if (savedLists) {
      try {
        setLists(JSON.parse(savedLists));
      } catch (e) {
        console.error("Failed to parse saved lists", e);
      }
    }

    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }

    const savedStats = localStorage.getItem(STATS_KEY);
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  // Persist Data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  }, [lists]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const handleAddList = (name: string, items: ShoppingItem[] = []) => {
    const newList: ShoppingList = {
      id: Date.now().toString(),
      name,
      createdAt: Date.now(),
      items,
      archived: false
    };
    setLists(prev => [newList, ...prev]);
    setStats(prev => ({ ...prev, totalListsEver: prev.totalListsEver + 1 }));
    setSelectedListId(newList.id);
    setCurrentView('DETAIL');
  };

  const handleDeleteList = (id: string) => {
    setLists(prev => prev.filter(l => l.id !== id));
  };

  const handleArchiveList = (id: string, archive: boolean = true) => {
    setLists(prev => prev.map(l => l.id === id ? { ...l, archived: archive } : l));
  };

  const handleRenameList = (id: string, newName: string) => {
    setLists(prev => prev.map(l => l.id === id ? { ...l, name: newName } : l));
  };

  const handleSelectList = (id: string) => {
    setSelectedListId(id);
    setCurrentView('DETAIL');
  };

  const handleAddItemToList = (itemData: Omit<ShoppingItem, 'id' | 'checked'>) => {
    if (!selectedListId) return;
    
    setLists(prev => prev.map(list => {
      if (list.id === selectedListId) {
        return {
          ...list,
          items: [...list.items, { ...itemData, id: Date.now().toString(), checked: false }]
        };
      }
      return list;
    }));
  };

  const handleUpdateItem = (itemId: string, updates: Partial<ShoppingItem>) => {
    setLists(prev => prev.map(list => {
      if (list.id === selectedListId) {
        return {
          ...list,
          items: list.items.map(item => item.id === itemId ? { ...item, ...updates } : item)
        };
      }
      return list;
    }));
  };

  const handleDeleteItem = (itemId: string) => {
    setLists(prev => prev.map(list => {
      if (list.id === selectedListId) {
        return {
          ...list,
          items: list.items.filter(item => item.id !== itemId)
        };
      }
      return list;
    }));
  };

  const handleImportCSV = (name: string, items: ShoppingItem[]) => {
    handleAddList(name, items);
  };

  const selectedList = lists.find(l => l.id === selectedListId);

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-950 min-h-screen shadow-lg transition-colors duration-300">
        {currentView === 'HOME' && (
          <HomeView 
            lists={lists} 
            onAddList={handleAddList} 
            onDeleteList={handleDeleteList}
            onArchiveList={handleArchiveList}
            onRenameList={handleRenameList}
            onSelectList={handleSelectList}
            onImportCSV={handleImportCSV}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            stats={stats}
          />
        )}
        
        {currentView === 'DETAIL' && selectedList && (
          <ShoppingListDetail 
            list={selectedList} 
            onBack={() => {
              setCurrentView('HOME');
              setSelectedListId(null);
            }}
            onAddItem={handleAddItemToList}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {currentView === 'DETAIL' && !selectedList && (
          <div className="p-10 text-center dark:text-gray-300">
            <p>Erro: Lista não encontrada.</p>
            <button onClick={() => setCurrentView('HOME')} className="mt-4 text-emerald-500">Voltar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, 
  Plus, 
  LayoutGrid, 
  List, 
  Paintbrush, 
  Trash2, 
  ChevronRight, 
  Image as ImageIcon,
  X,
  Minus,
  PlusCircle,
  Box,
  Tag,
  Layers,
  Settings,
  RotateCw,
  Save,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Asset, Inventory, ViewMode, SubItem, ThemeType, Theme } from './types';

const INITIAL_INVENTORIES: Inventory[] = [
  { id: '1', name: 'Main Stock', icon: 'Box' },
  { id: '2', name: 'Event Merch', icon: 'Tag' },
];

const THEMES: Theme[] = [
  { 
    id: 'default', name: 'Original', bg: 'bg-[#F5F5F5]', sidebar: 'bg-white', card: 'bg-white', 
    text: 'text-slate-900', muted: 'text-slate-400', border: 'border-slate-200/50', accent: 'bg-emerald-500' 
  },
  { 
    id: 'night', name: 'Night Time', bg: 'bg-[#0F172A]', sidebar: 'bg-[#1E293B]', card: 'bg-[#1E293B]', 
    text: 'text-slate-100', muted: 'text-slate-500', border: 'border-slate-700/50', accent: 'bg-indigo-500' 
  },
  { 
    id: 'kawaii', name: 'Kawaii Wave', bg: 'bg-[#FFF1F2]', sidebar: 'bg-white', card: 'bg-white', 
    text: 'text-rose-900', muted: 'text-rose-300', border: 'border-rose-100', accent: 'bg-pink-400' 
  },
  { 
    id: 'donkey', name: 'Donkey Kong', bg: 'bg-[#451A03]', sidebar: 'bg-[#78350F]', card: 'bg-[#78350F]', 
    text: 'text-yellow-400', muted: 'text-yellow-700', border: 'border-yellow-900/50', accent: 'bg-yellow-500' 
  },
  { 
    id: 'strawberry', name: 'Strawberry Banana', bg: 'bg-[#FEFCE8]', sidebar: 'bg-[#FFF1F2]', card: 'bg-white', 
    text: 'text-rose-600', muted: 'text-yellow-600/50', border: 'border-yellow-200', accent: 'bg-pink-500' 
  },
  { 
    id: 'blackwhite', name: 'Black on White', bg: 'bg-black', sidebar: 'bg-[#111]', card: 'bg-[#111]', 
    text: 'text-white', muted: 'text-white/40', border: 'border-white/10', accent: 'bg-white' 
  },
];

const ASSET_COLORS = [
  { id: 'emerald', class: 'bg-emerald-500', border: 'border-emerald-500', shadow: 'shadow-emerald-200', text: 'text-emerald-500' },
  { id: 'rose', class: 'bg-rose-500', border: 'border-rose-500', shadow: 'shadow-rose-200', text: 'text-rose-500' },
  { id: 'indigo', class: 'bg-indigo-500', border: 'border-indigo-500', shadow: 'shadow-indigo-200', text: 'text-indigo-500' },
  { id: 'amber', class: 'bg-amber-500', border: 'border-amber-500', shadow: 'shadow-amber-200', text: 'text-amber-500' },
  { id: 'violet', class: 'bg-violet-500', border: 'border-violet-500', shadow: 'shadow-violet-200', text: 'text-violet-500' },
  { id: 'slate', class: 'bg-slate-500', border: 'border-slate-500', shadow: 'shadow-slate-200', text: 'text-slate-500' },
];

export default function App() {
  const [inventories, setInventories] = useState<Inventory[]>(INITIAL_INVENTORIES);
  const [activeInventoryId, setActiveInventoryId] = useState(inventories[0].id);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNewInventoryModalOpen, setIsNewInventoryModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [currentThemeId, setCurrentThemeId] = useState<ThemeType>('default');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const currentTheme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];

  // Form states
  const [newName, setNewName] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newImage, setNewImage] = useState<string | undefined>();
  const [newColor, setNewColor] = useState('emerald');
  const [newInvName, setNewInvName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage
  React.useEffect(() => {
    const savedAssets = localStorage.getItem('assetflow_assets');
    const savedInventories = localStorage.getItem('assetflow_inventories');
    const savedTheme = localStorage.getItem('assetflow_theme');
    if (savedAssets) setAssets(JSON.parse(savedAssets));
    if (savedInventories) setInventories(JSON.parse(savedInventories));
    if (savedTheme) setCurrentThemeId(savedTheme as ThemeType);
  }, []);

  const saveData = () => {
    setIsSaving(true);
    localStorage.setItem('assetflow_assets', JSON.stringify(assets));
    localStorage.setItem('assetflow_inventories', JSON.stringify(inventories));
    localStorage.setItem('assetflow_theme', currentThemeId);
    setTimeout(() => setIsSaving(false), 1500);
  };

  const filteredAssets = useMemo(() => {
    return assets
      .filter(a => a.category === activeInventoryId)
      .filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [assets, activeInventoryId, searchQuery]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addAsset = () => {
    if (!newName.trim()) return;
    const newAsset: Asset = {
      id: crypto.randomUUID(),
      name: newName,
      quantity: newQuantity,
      image: newImage,
      color: newColor,
      category: activeInventoryId,
      createdAt: Date.now(),
      subItems: [],
    };
    setAssets([...assets, newAsset]);
    setNewName('');
    setNewQuantity(1);
    setNewImage(undefined);
    setNewColor('emerald');
    setIsAddModalOpen(false);
  };

  const deleteAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setAssets(assets.map(a => 
      a.id === id ? { ...a, quantity: Math.max(0, a.quantity + delta) } : a
    ));
  };

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const addInventory = () => {
    if (!newInvName.trim()) return;
    const newInv: Inventory = {
      id: crypto.randomUUID(),
      name: newInvName,
      icon: 'Layers',
    };
    setInventories([...inventories, newInv]);
    setActiveInventoryId(newInv.id);
    setNewInvName('');
    setIsNewInventoryModalOpen(false);
  };

  const handleSaveSubItems = (assetId: string, subItems: SubItem[]) => {
    setAssets(assets.map(a => 
      a.id === assetId ? { ...a, subItems } : a
    ));
    setEditingAsset(null);
  };

  return (
    <div className={cn("min-h-screen font-sans selection:bg-emerald-100 transition-colors duration-500", currentTheme.bg, currentTheme.text)}>
      {/* Sidebar / Navigation */}
      <div className={cn("fixed left-0 top-0 bottom-0 w-20 md:w-64 border-r flex flex-col z-20 transition-colors duration-500", currentTheme.sidebar, currentTheme.border)}>
        <div className="p-6 flex items-center gap-3 relative">
          <button 
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0 transition-all active:scale-90", currentTheme.accent)}
          >
            <Paintbrush size={24} />
          </button>
          <span className="font-display font-bold text-xl tracking-tight hidden md:block">AssetFlow</span>

          {/* Theme Menu */}
          <AnimatePresence>
            {isThemeMenuOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsThemeMenuOpen(false)}
                  className="fixed inset-0 z-30"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -20 }}
                  className={cn("absolute left-20 top-6 w-48 rounded-2xl shadow-2xl border p-2 z-40", currentTheme.card, currentTheme.border)}
                >
                  <div className={cn("text-[10px] font-bold uppercase tracking-widest px-3 py-2 mb-1", currentTheme.muted)}>Select Theme</div>
                  {THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setCurrentThemeId(theme.id);
                        setIsThemeMenuOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-xl transition-all text-left text-xs font-bold",
                        currentThemeId === theme.id 
                          ? "bg-emerald-500 text-white" 
                          : "hover:bg-black/5"
                      )}
                    >
                      <div className={cn("w-4 h-4 rounded-full border border-white/20", theme.accent)} />
                      {theme.name}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <div className={cn("text-[10px] font-bold uppercase tracking-widest px-2 mb-2 hidden md:block", currentTheme.muted)}>
            Inventories
          </div>
          {inventories.map((inv) => (
            <button
              key={inv.id}
              onClick={() => setActiveInventoryId(inv.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group",
                activeInventoryId === inv.id 
                  ? "bg-emerald-500/10 text-emerald-500 shadow-sm" 
                  : cn("hover:bg-black/5", currentTheme.muted)
              )}
            >
              <Box size={20} className={cn(activeInventoryId === inv.id ? "text-emerald-500" : "group-hover:text-slate-700")} />
              <span className="font-medium hidden md:block truncate">{inv.name}</span>
            </button>
          ))}
          <button 
            onClick={() => setIsNewInventoryModalOpen(true)}
            className={cn("w-full flex items-center gap-3 p-3 rounded-xl transition-all border-2 border-dashed mt-4", currentTheme.muted, currentTheme.border)}
          >
            <Plus size={20} />
            <span className="font-medium hidden md:block">New Set</span>
          </button>
        </nav>

        <div className={cn("p-4 border-t", currentTheme.border)}>
          <button 
            onClick={saveData}
            className={cn(
              "w-full flex items-center justify-center gap-3 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-lg",
              isSaving 
                ? "bg-emerald-500 text-white" 
                : "bg-slate-900 text-white hover:bg-slate-800"
            )}
          >
            {isSaving ? (
              <>
                <CheckCircle2 size={18} />
                <span className="hidden md:block">Saved!</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span className="hidden md:block">Save Assets</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="pl-20 md:pl-64 min-h-screen">
        <header className={cn("sticky top-0 backdrop-blur-md border-b z-10 px-8 py-6 transition-colors duration-500", currentTheme.bg + "/80", currentTheme.border)}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative flex-1 max-w-xl">
              <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2", currentTheme.muted)} size={18} />
              <input 
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("w-full pl-12 pr-4 py-3 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-sm font-medium", currentTheme.card === 'bg-white' ? 'bg-slate-100' : 'bg-white/5')}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className={cn("p-1 rounded-xl flex gap-1", currentTheme.card === 'bg-white' ? 'bg-slate-100' : 'bg-white/5')}>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    viewMode === 'grid' ? cn(currentTheme.card, "shadow-sm text-emerald-500") : currentTheme.muted
                  )}
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    viewMode === 'list' ? cn(currentTheme.card, "shadow-sm text-emerald-500") : currentTheme.muted
                  )}
                >
                  <List size={18} />
                </button>
              </div>
              
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className={cn("text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95", currentTheme.accent)}
              >
                <Plus size={18} />
                <span>Add Asset</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {inventories.find(i => i.id === activeInventoryId)?.name}
            </h1>
            <p className={cn("text-sm font-medium", currentTheme.muted)}>
              {filteredAssets.length} items found in this collection
            </p>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredAssets.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex flex-col items-center justify-center py-20", currentTheme.muted)}
              >
                <Box size={64} strokeWidth={1} className="mb-4" />
                <p className="text-lg font-medium">No assets found</p>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 text-emerald-500 font-bold text-sm hover:underline"
                >
                  Add your first item
                </button>
              </motion.div>
            ) : viewMode === 'grid' ? (
              <motion.div 
                layout
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
              >
                {filteredAssets.map((asset) => (
                  <div key={asset.id} className="perspective-1000 h-64">
                    <motion.div
                      animate={{ rotateY: flippedCards[asset.id] ? 180 : 0 }}
                      transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                      className="relative w-full h-full preserve-3d"
                    >
                      {/* Front Side */}
                      <div className={cn("absolute inset-0 backface-hidden group rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all border flex flex-col items-center text-center", currentTheme.card, currentTheme.border)}>
                        <div className={cn(
                          "absolute top-4 left-4 w-2 h-2 rounded-full",
                          ASSET_COLORS.find(c => c.id === asset.color)?.class || 'bg-emerald-500'
                        )} />
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteAsset(asset.id); }}
                          className={cn("absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-all hover:text-rose-500", currentTheme.muted)}
                        >
                          <Trash2 size={16} />
                        </button>
                        
                        <div 
                          onClick={() => toggleFlip(asset.id)}
                          className="cursor-pointer flex flex-col items-center w-full h-full"
                        >
                          <div className={cn("w-24 h-24 rounded-2xl mb-4 flex items-center justify-center overflow-hidden border shrink-0", currentTheme.card === 'bg-white' ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5')}>
                            {asset.image ? (
                              <img src={asset.image} alt={asset.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={24} className={currentTheme.muted} />
                            )}
                          </div>
                          
                          <h3 className="font-bold text-sm mb-1 truncate w-full px-2">{asset.name}</h3>
                          <div className="flex items-center gap-3 mt-auto pt-4 w-full">
                            <button 
                              onClick={(e) => { e.stopPropagation(); updateQuantity(asset.id, -1); }}
                              className={cn("p-2 rounded-xl transition-all", currentTheme.card === 'bg-white' ? 'bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600' : 'bg-white/5 hover:bg-white/10')}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="flex-1 font-mono font-bold text-lg">{asset.quantity}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); updateQuantity(asset.id, 1); }}
                              className={cn("p-2 rounded-xl transition-all", currentTheme.card === 'bg-white' ? 'bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600' : 'bg-white/5 hover:bg-white/10')}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Back Side */}
                      <div 
                        className={cn(
                          "absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-4 shadow-xl flex flex-col text-white transition-colors duration-300",
                          ASSET_COLORS.find(c => c.id === asset.color)?.class || 'bg-emerald-600',
                          ASSET_COLORS.find(c => c.id === asset.color)?.border || 'border-emerald-500'
                        )}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <button 
                            onClick={() => toggleFlip(asset.id)}
                            className="p-2 hover:bg-white/10 rounded-xl transition-all"
                          >
                            <RotateCw size={16} />
                          </button>
                          <button 
                            onClick={() => setEditingAsset(asset)}
                            className="p-2 hover:bg-white/10 rounded-xl transition-all"
                          >
                            <Settings size={16} />
                          </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                          <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Breakdown</h4>
                          {(!asset.subItems || asset.subItems.length === 0) ? (
                            <div className="h-full flex flex-col items-center justify-center text-white/30">
                              <Layers size={24} strokeWidth={1} className="mb-2" />
                              <p className="text-[10px] font-medium">No sub-items</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {asset.subItems.map(sub => (
                                <div key={sub.id} className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2">
                                  <span className="text-xs font-medium truncate pr-2">{sub.name}</span>
                                  <span className="font-mono font-bold text-xs">{sub.quantity}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-white/10 text-center">
                          <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Total</p>
                          <p className="text-xl font-mono font-bold">{asset.quantity}</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className={cn("grid grid-cols-[80px_1fr_120px_100px] gap-4 px-8 py-4 text-[10px] font-bold uppercase tracking-widest", currentTheme.muted)}>
                  <div className="pl-4">Image</div>
                  <div>Name</div>
                  <div className="text-center">Quantity</div>
                  <div className="text-right pr-4">Actions</div>
                </div>
                
                <AnimatePresence mode="popLayout">
                  {filteredAssets.map((asset) => (
                    <div key={asset.id} className="perspective-1000 min-h-[80px]">
                      <motion.div
                        layout
                        animate={{ rotateY: flippedCards[asset.id] ? 180 : 0 }}
                        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                        className="relative w-full h-full preserve-3d"
                      >
                        {/* Front Side */}
                        <div 
                          onClick={() => toggleFlip(asset.id)}
                          className={cn("backface-hidden cursor-pointer grid grid-cols-[80px_1fr_120px_100px] gap-4 p-4 items-center rounded-2xl shadow-sm border transition-all", currentTheme.card, currentTheme.border, currentTheme.card === 'bg-white' ? 'hover:bg-slate-50' : 'hover:bg-white/5')}
                        >
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden border ml-4", currentTheme.card === 'bg-white' ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5')}>
                            {asset.image ? (
                              <img src={asset.image} alt={asset.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={16} className={currentTheme.muted} />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm">{asset.name}</h3>
                            <p className={cn("text-[10px] font-mono", currentTheme.muted)}>ID: {asset.id.slice(0, 8)}</p>
                          </div>
                          <div className="flex items-center justify-center gap-3">
                            <button 
                              onClick={(e) => { e.stopPropagation(); updateQuantity(asset.id, -1); }}
                              className={cn("p-1.5 rounded-lg transition-all", currentTheme.card === 'bg-white' ? 'bg-slate-50 hover:bg-emerald-100' : 'bg-white/5 hover:bg-white/10')}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-mono font-bold w-8 text-center">{asset.quantity}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); updateQuantity(asset.id, 1); }}
                              className={cn("p-1.5 rounded-lg transition-all", currentTheme.card === 'bg-white' ? 'bg-slate-50 hover:bg-emerald-100' : 'bg-white/5 hover:bg-white/10')}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <div className="flex justify-end pr-4 gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setEditingAsset(asset); }}
                              className={cn("p-2 transition-all hover:text-emerald-500", currentTheme.muted)}
                            >
                              <Settings size={16} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteAsset(asset.id); }}
                              className={cn("p-2 transition-all hover:text-rose-500", currentTheme.muted)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Back Side */}
                        <div 
                          onClick={() => toggleFlip(asset.id)}
                          className={cn(
                            "absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-4 shadow-xl flex items-center justify-between text-white cursor-pointer transition-colors duration-300",
                            ASSET_COLORS.find(c => c.id === asset.color)?.class || 'bg-emerald-600'
                          )}
                        >
                          <div className="flex items-center gap-4 pl-4">
                            <RotateCw size={16} className="text-white/50" />
                            <h4 className="text-sm font-bold truncate max-w-[150px]">{asset.name} Breakdown</h4>
                          </div>

                          <div className="flex-1 flex items-center justify-center gap-4 px-4 overflow-x-auto no-scrollbar">
                            {(!asset.subItems || asset.subItems.length === 0) ? (
                              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">No breakdown items</p>
                            ) : (
                              asset.subItems.map(sub => (
                                <div key={sub.id} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1 shrink-0">
                                  <span className="text-[10px] font-bold">{sub.name}</span>
                                  <span className="font-mono font-bold text-xs">{sub.quantity}</span>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="flex items-center gap-4 pr-4">
                            <div className="text-right">
                              <p className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Total</p>
                              <p className="text-lg font-mono font-bold leading-none">{asset.quantity}</p>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setEditingAsset(asset); }}
                              className="p-2 hover:bg-white/10 rounded-xl transition-all"
                            >
                              <Settings size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Sub-Items Editor Modal */}
      <AnimatePresence>
        {editingAsset && (
          <SubItemEditor 
            asset={editingAsset} 
            onClose={() => setEditingAsset(null)} 
            onSave={(subItems) => handleSaveSubItems(editingAsset.id, subItems)}
          />
        )}
      </AnimatePresence>

      {/* Add Asset Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold tracking-tight">New Asset</h2>
                  <button 
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-2 hover:bg-black/5 rounded-full transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-center">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-32 h-32 bg-[#F5F5F5] rounded-3xl border-2 border-dashed border-black/10 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-50 transition-all group overflow-hidden"
                    >
                      {newImage ? (
                        <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <ImageIcon size={24} className="text-black/20 group-hover:text-emerald-500" />
                          <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Upload</span>
                        </>
                      )}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Asset Color</label>
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                      {ASSET_COLORS.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => setNewColor(color.id)}
                          className={cn(
                            "w-8 h-8 rounded-full transition-all flex items-center justify-center",
                            color.class,
                            newColor === color.id ? "ring-4 ring-white shadow-md scale-110" : "opacity-60 hover:opacity-100"
                          )}
                        >
                          {newColor === color.id && <CheckCircle2 size={16} className="text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Asset Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Classic T-Shirt"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-black/30 uppercase tracking-widest px-1">Initial Quantity</label>
                    <div className="flex items-center gap-4 bg-[#F5F5F5] p-2 rounded-2xl">
                      <button 
                        onClick={() => setNewQuantity(Math.max(0, newQuantity - 1))}
                        className="p-2 rounded-xl bg-white shadow-sm hover:text-emerald-600 transition-all"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="flex-1 text-center font-mono font-bold text-xl">{newQuantity}</span>
                      <button 
                        onClick={() => setNewQuantity(newQuantity + 1)}
                        className="p-2 rounded-xl bg-white shadow-sm hover:text-emerald-600 transition-all"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={addAsset}
                    disabled={!newName.trim()}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-black/10 disabled:text-black/30 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 mt-4"
                  >
                    Create Asset
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Inventory Modal */}
      <AnimatePresence>
        {isNewInventoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewInventoryModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold tracking-tight">New Collection</h2>
                  <button 
                    onClick={() => setIsNewInventoryModalOpen(false)}
                    className="p-2 hover:bg-black/5 rounded-full transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-black/30 uppercase tracking-widest px-1">Collection Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Summer Drop"
                      value={newInvName}
                      onChange={(e) => setNewInvName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F5F5F5] border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-sm font-medium"
                    />
                  </div>

                  <button 
                    onClick={addInventory}
                    disabled={!newInvName.trim()}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-black/10 disabled:text-black/30 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95"
                  >
                    Create Collection
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SubItemEditor({ asset, onClose, onSave }: { asset: Asset, onClose: () => void, onSave: (items: SubItem[]) => void }) {
  const [items, setItems] = useState<SubItem[]>(asset.subItems || []);
  const [newItemName, setNewItemName] = useState('');

  const addItem = () => {
    if (!newItemName.trim()) return;
    setItems([...items, { id: crypto.randomUUID(), name: newItemName, quantity: 0 }]);
    setNewItemName('');
  };

  const updateSubQuantity = (id: string, delta: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Manage Breakdown</h2>
              <p className="text-xs text-black/40 font-medium">{asset.name}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-black/5 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Add item (e.g. Buttons)"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                className="flex-1 px-4 py-3 bg-[#F5F5F5] border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-sm font-medium"
              />
              <button 
                onClick={addItem}
                className="p-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all active:scale-95"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {items.length === 0 ? (
                <div className="py-8 text-center text-black/20">
                  <Layers size={32} strokeWidth={1} className="mx-auto mb-2" />
                  <p className="text-xs font-medium">No breakdown items yet</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-[#F9F9F9] p-3 rounded-2xl border border-black/5">
                    <span className="flex-1 text-sm font-bold truncate">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateSubQuantity(item.id, -1)}
                        className="p-1 rounded-lg bg-white shadow-sm hover:text-emerald-600 transition-all"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-mono font-bold w-6 text-center text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateSubQuantity(item.id, 1)}
                        className="p-1 rounded-lg bg-white shadow-sm hover:text-emerald-600 transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-black/10 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-4 bg-[#F5F5F5] hover:bg-black/5 text-black/60 rounded-2xl font-bold transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => onSave(items)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { Store } from '../types/store';
import { Search } from 'lucide-react';

interface StoreSidebarProps {
  stores: Store[];
  selectedStore: Store | null;
  onStoreSelect: (store: Store) => void;
}

export default function StoreSidebar({
  stores,
  selectedStore,
  onStoreSelect,
}: StoreSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='w-full lg:w-80 bg-white shadow-lg rounded-lg overflow-hidden'>
      {/* Search Bar */}
      <div className='p-4 border-b'>
        <div className='relative'>
          <input
            type='text'
            placeholder='Search stores...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none'
          />
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400' />
        </div>
      </div>

      {/* Store List */}
      <div className='h-[600px] overflow-y-auto'>
        {filteredStores.map((store) => (
          <button
            key={store.id}
            onClick={() => onStoreSelect(store)}
            className={`w-full p-4 text-left hover:bg-slate-50 transition-colors border-b ${
              selectedStore?.id === store.id ? 'bg-blue-50' : ''
            }`}
          >
            <h3 className='font-semibold text-slate-800'>{store.name}</h3>
            <p className='text-sm text-slate-600 mt-1'>{store.address}</p>
            <div className='flex items-center gap-2 mt-2 text-sm text-slate-500'>
              <span>{store.phone}</span>
              <span>•</span>
              <span>{store.opening_hours}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

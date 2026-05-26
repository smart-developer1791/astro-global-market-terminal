<template>
  <aside class="w-full md:w-64 bg-market-panel border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-row md:flex-col gap-6 shrink-0 overflow-x-auto md:overflow-y-auto items-center md:items-stretch scrollbar-hide">
    <div class="min-w-fit md:min-w-0 flex-shrink-0">
      <h2 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 hidden md:block">Market Filters</h2>
      <div class="space-y-2 hidden md:block">
        <label v-for="filter in filters" :key="filter.id" class="flex items-center gap-3 cursor-pointer group">
          <div class="relative flex items-center justify-center w-5 h-5 rounded border border-slate-600 group-hover:border-market-accent transition-colors">
            <input type="checkbox" :checked="filter.active" @change="handleToggleFilter(filter.id)" class="opacity-0 absolute inset-0 cursor-pointer" />
            <Check v-if="filter.active" class="text-market-accent w-4 h-4" />
          </div>
          <span class="text-sm text-slate-300 group-hover:text-white transition-colors">{{ filter.name }}</span>
        </label>
      </div>
      <div class="flex md:hidden gap-2 items-center h-full">
         <button 
            v-for="filter in filters" 
            :key="filter.id" 
            @click="handleToggleFilter(filter.id)"
            :class="[
              'px-3 py-1.5 rounded border text-xs whitespace-nowrap transition-colors',
              filter.active 
                ? 'bg-market-accent/20 border-market-accent text-white' 
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            ]"
          >
            {{filter.name}}
          </button>
      </div>
    </div>

    <div class="w-[1px] h-8 bg-slate-700 md:hidden shrink-0"></div>

    <div class="min-w-fit md:min-w-0 flex-shrink-0">
      <h2 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 hidden md:block">Timeframe</h2>
      <div class="flex md:grid md:grid-cols-3 gap-2">
        <button 
          v-for="tf in timeframes" 
          :key="tf"
          @click="selectTimeframe(tf)"
          :class="[
            'py-1.5 px-3 md:px-0 text-xs font-medium rounded transition-colors whitespace-nowrap',
            $activeTimeframe === tf 
              ? 'bg-market-accent text-white' 
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          ]"
        >
          {{ tf }}
        </button>
      </div>
    </div>

    <div class="mt-auto hidden md:block">
      <div class="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
        <div class="flex items-center gap-2 mb-2">
          <Activity class="w-4 h-4 text-market-up" />
          <span class="text-xs font-semibold text-slate-300">System Status</span>
        </div>
        <p class="text-[10px] text-slate-500">All feeds operational. Latency: 12ms</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Check, Activity } from 'lucide-vue-next';
import { useStore } from '@nanostores/vue';
import { activeTimeframe, setTimeframe, activeFilters, toggleFilter } from '../store/marketStore';

const $activeTimeframe = useStore(activeTimeframe);
const $activeFilters = useStore(activeFilters);

const allFilters = [
  { id: 'crypto', name: 'Cryptocurrency' },
  { id: 'stocks', name: 'US Equities' },
  { id: 'forex', name: 'Forex' },
  { id: 'commodities', name: 'Commodities' }
];

const filters = computed(() => {
  return allFilters.map(f => ({
    ...f,
    active: $activeFilters.value.includes(f.id)
  }));
});

const timeframes = ['1M', '5M', '15M', '1H', '4H', '1D'];

const selectTimeframe = (tf: string) => {
  setTimeframe(tf);
};

const handleToggleFilter = (filterId: string) => {
  toggleFilter(filterId);
};
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>

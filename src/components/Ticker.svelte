<script lang="ts">
  import { onMount } from 'svelte';
  import { TrendingUp, TrendingDown } from 'lucide-svelte';
  import { activeSymbol, setSymbol, activeFilters } from '../store/marketStore';

  // Mock data for ticker
  const initialSymbols = [
    { symbol: 'BTC/USD', price: 64230.50, change: 2.4, up: true, type: 'crypto' },
    { symbol: 'ETH/USD', price: 3450.20, change: -1.2, up: false, type: 'crypto' },
    { symbol: 'AAPL', price: 173.50, change: 0.8, up: true, type: 'stocks' },
    { symbol: 'TSLA', price: 185.20, change: -3.5, up: false, type: 'stocks' },
    { symbol: 'NVDA', price: 890.10, change: 4.1, up: true, type: 'stocks' },
    { symbol: 'SPY', price: 512.30, change: 0.2, up: true, type: 'stocks' },
    { symbol: 'GOLD', price: 2150.80, change: -0.5, up: false, type: 'commodities' },
    { symbol: 'EUR/USD', price: 1.0825, change: 0.15, up: true, type: 'forex' },
    { symbol: 'USD/JPY', price: 151.20, change: -0.3, up: false, type: 'forex' },
    { symbol: 'OIL', price: 82.40, change: 1.1, up: true, type: 'commodities' }
  ];

  let symbols = $state(initialSymbols);
  let displaySymbols = $derived(symbols.filter(s => $activeFilters.includes(s.type)));
  
  // Create enough duplicates to ensure the ticker spans the whole screen
  let baseSymbols = $derived(
    displaySymbols.length > 0 
      ? Array(Math.ceil(15 / displaySymbols.length)).fill(displaySymbols).flat() 
      : []
  );
  // Duplicate it once more to create a seamless looping track (0 to 50%)
  let marqueeSymbols = $derived([...baseSymbols, ...baseSymbols]);

  // Simulate high-frequency updates
  onMount(() => {
    const interval = setInterval(() => {
      symbols = symbols.map(s => {
        const volatility = s.price * 0.001;
        const changeAmt = (Math.random() - 0.5) * volatility;
        const newPrice = s.price + changeAmt;
        const newChange = s.change + (changeAmt / s.price) * 100;
        return {
          ...s,
          price: newPrice,
          change: newChange,
          up: changeAmt >= 0 ? true : s.up
        };
      });
    }, 1000); // 1 update per second

    return () => clearInterval(interval);
  });
</script>

<div class="w-full bg-market-panel border-b border-slate-800 flex items-center overflow-hidden h-10 select-none shrink-0 relative">
  {#if displaySymbols.length > 0}
    <div 
      class="flex animate-marquee whitespace-nowrap w-max hover:[animation-play-state:paused]"
      style="animation-duration: {baseSymbols.length * 2.5}s"
    >
      {#each marqueeSymbols as item, i (i + '-' + item.symbol)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
          class="flex items-center gap-3 px-6 border-r border-slate-800 font-mono text-sm cursor-pointer transition-colors { $activeSymbol === item.symbol ? 'bg-slate-800' : 'hover:bg-slate-800/50' }"
          onclick={() => setSymbol(item.symbol)}
        >
          <span class="font-bold { $activeSymbol === item.symbol ? 'text-white' : 'text-slate-300' }">{item.symbol}</span>
          <span class="text-slate-100">${item.price.toFixed(2)}</span>
          <span class={item.up ? 'text-market-up flex items-center' : 'text-market-down flex items-center'}>
            {#if item.up}
              <TrendingUp size={14} class="mr-1" />
            {:else}
              <TrendingDown size={14} class="mr-1" />
            {/if}
            {Math.abs(item.change).toFixed(2)}%
          </span>
        </div>
      {/each}
    </div>
  {:else}
    <div class="flex items-center justify-center w-full h-full text-sm text-slate-500 font-mono absolute inset-0">
      <span class="px-4 py-1 bg-slate-800/50 rounded-full border border-slate-700 shadow-sm">No market filters selected</span>
    </div>
  {/if}
</div>

<style>
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee {
    animation-name: marquee;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
</style>

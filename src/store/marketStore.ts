import { atom } from 'nanostores';

export const activeSymbol = atom('BTC/USD');
export const activeTimeframe = atom('15M');
export const chartDataVersion = atom(0); // Used to trigger chart updates
export const activeFilters = atom<string[]>(['crypto', 'stocks']);

export function setSymbol(symbol: string) {
  activeSymbol.set(symbol);
  chartDataVersion.set(chartDataVersion.get() + 1);
}

export function setTimeframe(timeframe: string) {
  activeTimeframe.set(timeframe);
  chartDataVersion.set(chartDataVersion.get() + 1);
}

export function toggleFilter(filterId: string) {
  const current = activeFilters.get();
  if (current.includes(filterId)) {
    activeFilters.set(current.filter(id => id !== filterId));
  } else {
    activeFilters.set([...current, filterId]);
  }
}

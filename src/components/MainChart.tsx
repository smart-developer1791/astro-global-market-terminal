import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { Maximize2, Settings2 } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { activeSymbol, activeTimeframe, chartDataVersion } from '../store/marketStore';

export default function MainChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartRef, setChartRef] = useState<IChartApi | null>(null);
  const [seriesRef, setSeriesRef] = useState<ISeriesApi<"Candlestick"> | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const currentSymbol = useStore(activeSymbol);
  const currentTimeframe = useStore(activeTimeframe);
  const dataVersion = useStore(chartDataVersion);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#334155', style: 1 },
        horzLine: { color: '#334155', style: 1 },
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: '#1e293b',
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    setChartRef(chart);
    setSeriesRef(candlestickSeries as any);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight
        });
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    resizeObserver.observe(chartContainerRef.current);
    
    // Initial resize to fit flex container
    setTimeout(handleResize, 0);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  // Update data when store changes
  useEffect(() => {
    if (!seriesRef || !chartRef) return;

    // Generate some mock candlestick data
    const generateData = () => {
      const data = [];
      let basePrice = currentSymbol.includes('BTC') ? 64000 : currentSymbol.includes('ETH') ? 3400 : currentSymbol.includes('NVDA') ? 890 : 150;
      // modify base price a bit with dataVersion to make it look different on every change
      basePrice += dataVersion * (basePrice * 0.001);

      let intervalStr = currentTimeframe || '15M';
      let intervalSeconds = 900;
      if (intervalStr === '1M') intervalSeconds = 60;
      else if (intervalStr === '5M') intervalSeconds = 300;
      else if (intervalStr === '15M') intervalSeconds = 900;
      else if (intervalStr === '1H') intervalSeconds = 3600;
      else if (intervalStr === '4H') intervalSeconds = 14400;
      else if (intervalStr === '1D') intervalSeconds = 86400;

      let time = Math.floor(Date.now() / 1000) - 100 * intervalSeconds;
      
      for (let i = 0; i < 100; i++) {
        const open = basePrice + (Math.random() - 0.5) * (basePrice * 0.01);
        const close = open + (Math.random() - 0.5) * (basePrice * 0.01);
        const high = Math.max(open, close) + Math.random() * (basePrice * 0.005);
        const low = Math.min(open, close) - Math.random() * (basePrice * 0.005);
        
        data.push({ time: (time + i * intervalSeconds) as any, open, high, low, close });
        basePrice = close;
      }
      return data;
    };

    seriesRef.setData(generateData() as any);
    
    // Changing data requires resetting the time scale and fitting it. 
    // Need a slight delay to ensure the data is parsed by the library first.
    setTimeout(() => {
       if (chartRef) chartRef.timeScale().fitContent();
    }, 0);

  }, [currentSymbol, currentTimeframe, dataVersion, seriesRef, chartRef]);

  return (
    <div ref={containerRef} className="flex-1 flex flex-col h-full bg-market-bg w-full min-w-0 relative">
      <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide shrink-0">
          <h1 className="text-lg md:text-xl font-bold text-white tracking-tight whitespace-nowrap">{currentSymbol}</h1>
          <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded">
            {currentTimeframe}
          </span>
          <span className="px-2 py-1 bg-market-up/10 text-market-up text-xs font-bold rounded">
            +2.45%
          </span>
        </div>
        <div className="flex items-center gap-3 ml-4 shrink-0">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded transition-colors hidden md:block ${showSettings ? 'bg-market-accent text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Settings2 size={18} />
          </button>
          <button 
            onClick={toggleFullscreen}
            className={`p-2 rounded transition-colors ${isFullscreen ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
      <div className="flex-1 relative min-h-0">
        <div ref={chartContainerRef} className="absolute inset-4" />
        
        {showSettings && (
          <div className="absolute top-4 right-4 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4 z-10">
            <h3 className="text-sm font-bold text-white mb-3">Chart Settings</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">Theme</span>
                <select className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1">
                  <option>Dark</option>
                  <option>Light</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">Indicators</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" checked readOnly />
                  <div className="w-7 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-market-accent"></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

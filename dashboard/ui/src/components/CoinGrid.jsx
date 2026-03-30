const fmt = (price) => {
  if (price === null || price === undefined) return '—'
  if (price < 0.001) return price.toExponential(2)
  if (price < 1)     return price.toFixed(4)
  if (price < 100)   return price.toFixed(2)
  return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

const pct = (v) => v === null || v === undefined ? null : v

function Changebadge({ value }) {
  if (value === null || value === undefined) return <span className="text-slate-500 text-xs">—</span>
  const pos = value >= 0
  return (
    <span className={`text-xs font-semibold ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
      {pos ? '+' : ''}{value.toFixed(2)}%
    </span>
  )
}

function CoinCard({ coin, selected, onClick }) {
  const change = coin.change_5min
  const borderColor = selected
    ? 'border-indigo-500'
    : change === null ? 'border-slate-700'
    : change >= 0 ? 'border-emerald-800' : 'border-red-900'

  return (
    <button
      onClick={onClick}
      className={`bg-slate-800 rounded-xl p-4 border ${borderColor} text-left hover:bg-slate-700 transition-all w-full`}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">{coin.symbol}</p>
          <p className="text-sm font-semibold text-white capitalize truncate max-w-[80px]">{coin.id}</p>
        </div>
        {change !== null && (
          <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {change >= 0 ? '▲' : '▼'}
          </span>
        )}
      </div>
      <p className="text-lg font-bold text-white">${fmt(coin.price)}</p>
      <div className="flex gap-3 mt-1">
        <div>
          <p className="text-[10px] text-slate-500">1m</p>
          <Changebage value={coin.change_1min} />
        </div>
        <div>
          <p className="text-[10px] text-slate-500">5m</p>
          <Changebage value={coin.change_5min} />
        </div>
      </div>
    </button>
  )
}

function Changebage({ value }) {
  if (value === null || value === undefined) return <span className="text-slate-500 text-xs">—</span>
  const pos = value >= 0
  return (
    <span className={`text-xs font-semibold ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
      {pos ? '+' : ''}{value.toFixed(2)}%
    </span>
  )
}

export default function CoinGrid({ coins, selectedCoin, onSelect }) {
  if (!coins) return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-3">
      {Array(20).fill(0).map((_, i) => (
        <div key={i} className="bg-slate-800 rounded-xl p-4 border border-slate-700 animate-pulse h-24" />
      ))}
    </div>
  )

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-3">
      {coins.map(coin => (
        <CoinCard
          key={coin.id}
          coin={coin}
          selected={selectedCoin === coin.id}
          onClick={() => onSelect(coin.id)}
        />
      ))}
    </div>
  )
}

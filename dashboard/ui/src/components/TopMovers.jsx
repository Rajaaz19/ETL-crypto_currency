function fmtPrice(v) {
  if (!v) return '—'
  if (v < 0.001) return '$' + v.toExponential(2)
  if (v < 1)     return '$' + v.toFixed(4)
  return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function MoverRow({ rank, id, symbol, price, change_5min, positive }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-700/50 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-slate-500 text-xs w-4">{rank}</span>
        <div>
          <p className="text-sm font-semibold text-white uppercase">{symbol}</p>
          <p className="text-xs text-slate-400 capitalize">{id}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-white">{fmtPrice(price)}</p>
        <p className={`text-xs font-bold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
          {positive ? '+' : ''}{change_5min?.toFixed(2)}%
        </p>
      </div>
    </div>
  )
}

function Section({ title, data, positive }) {
  const color = positive ? 'text-emerald-400' : 'text-red-400'
  const icon  = positive ? '▲' : '▼'
  return (
    <div>
      <h3 className={`text-sm font-semibold mb-3 ${color} flex items-center gap-1`}>
        {icon} {title}
      </h3>
      {!data ? (
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-10 bg-slate-700 rounded animate-pulse" />)}
        </div>
      ) : data.length === 0 ? (
        <p className="text-slate-500 text-xs">Waiting for data…</p>
      ) : (
        data.map(r => <MoverRow key={r.id} {...r} positive={positive} />)
      )}
    </div>
  )
}

export default function TopMovers({ gainers, losers }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 h-full">
      <h2 className="font-bold text-white mb-4">Top Movers <span className="text-slate-400 font-normal text-sm">(5 min)</span></h2>
      <div className="space-y-5">
        <Section title="Gainers" data={gainers} positive={true} />
        <div className="border-t border-slate-700" />
        <Section title="Losers"  data={losers}  positive={false} />
      </div>
    </div>
  )
}

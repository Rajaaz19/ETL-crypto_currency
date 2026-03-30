import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import CoinGrid from './components/CoinGrid'
import PriceChart from './components/PriceChart'
import TopMovers from './components/TopMovers'
import AlertsFeed from './components/AlertsFeed'
import PipelineStatus from './components/PipelineStatus'

const REFRESH_MS = 30_000

function useApi(url, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    try {
      const res = await axios.get(url)
      setData(res.data)
    } catch { /* keep previous data on error */ }
    finally { setLoading(false) }
  }, [url])

  useEffect(() => { fetch() }, [fetch, ...deps])
  useEffect(() => {
    const id = setInterval(fetch, REFRESH_MS)
    return () => clearInterval(id)
  }, [fetch])

  return { data, loading, refresh: fetch }
}

export default function App() {
  const [selectedCoin, setSelectedCoin] = useState('bitcoin')
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const { data: coins }    = useApi('/api/coins/latest')
  const { data: gainers }  = useApi('/api/gainers')
  const { data: losers }   = useApi('/api/losers')
  const { data: alerts }   = useApi('/api/alerts')
  const { data: pipeline } = useApi('/api/pipeline')
  const { data: stats }    = useApi('/api/stats')

  useEffect(() => {
    const id = setInterval(() => setLastRefresh(new Date()), REFRESH_MS)
    return () => clearInterval(id)
  }, [])

  const totalCoins    = coins?.length ?? 0
  const lastUpdated   = stats?.last_updated ? new Date(stats.last_updated).toLocaleTimeString() : '—'
  const pipelineOk    = pipeline?.every(t => t.status === 'success')

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* ── Header ── */}
      <header className="border-b border-slate-700 bg-slate-800/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📈</span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">MarketFlow</h1>
              <p className="text-xs text-slate-400">Crypto Analytics Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-slate-400 text-xs">Coins Tracked</p>
              <p className="font-bold text-white">{totalCoins}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-xs">Last Data</p>
              <p className="font-bold text-white">{lastUpdated}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-xs">Pipeline</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pipelineOk ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {pipelineOk ? '● Live' : '● Degraded'}
              </span>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-xs">Refreshes</p>
              <p className="font-bold text-white">{lastRefresh.toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">
        {/* ── Coin cards grid ── */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Live Prices</h2>
          <CoinGrid coins={coins} selectedCoin={selectedCoin} onSelect={setSelectedCoin} />
        </section>

        {/* ── Chart + Top Movers ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <PriceChart coinId={selectedCoin} />
          </div>
          <div>
            <TopMovers gainers={gainers} losers={losers} />
          </div>
        </div>

        {/* ── Alerts + Pipeline ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AlertsFeed alerts={alerts} />
          <PipelineStatus pipeline={pipeline} />
        </div>
      </main>
    </div>
  )
}

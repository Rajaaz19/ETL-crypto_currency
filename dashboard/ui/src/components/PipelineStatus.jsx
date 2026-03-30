function fmtTime(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function StatusDot({ status }) {
  const ok = status === 'success'
  return (
    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${ok ? 'bg-emerald-400' : 'bg-red-400'}`} />
  )
}

export default function PipelineStatus({ pipeline }) {
  const allOk = pipeline?.every(t => t.status === 'success')

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-white">Pipeline Health</h2>
        {pipeline && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            allOk ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {allOk ? '● All Systems Go' : '● Degraded'}
          </span>
        )}
      </div>

      {!pipeline ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-14 bg-slate-700 rounded animate-pulse" />)}
        </div>
      ) : pipeline.length === 0 ? (
        <p className="text-slate-500 text-sm">No pipeline data yet</p>
      ) : (
        <div className="space-y-3">
          {pipeline.map((task, i) => (
            <div key={i} className="bg-slate-700/50 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <StatusDot status={task.status} />
                  <span className="text-sm font-medium text-white">{task.task}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                  task.status === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {task.status}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-slate-400 mt-1 pl-4">
                <span>Records: <span className="text-slate-200">{task.records_pushed ?? '—'}</span></span>
                <span>Latency: <span className="text-slate-200">{task.latency_ms ? `${task.latency_ms}ms` : '—'}</span></span>
                <span>At: <span className="text-slate-200">{fmtTime(task.created_at)}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

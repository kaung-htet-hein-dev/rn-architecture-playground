import { GLOSSARY } from '../content/glossary'

export function Glossary() {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="h3">Glossary</h3>
      <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-x-10">
        {GLOSSARY.map(([t, d, c]) => (
          <div key={t} className="flex flex-col gap-1 border-b border-line-soft py-3.5">
            <dt className="font-mono text-sm leading-[1.3] font-semibold" style={{ color: c }}>
              {t}
            </dt>
            <dd className="m-0 text-[15px] leading-[1.55] text-text-muted">{d}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

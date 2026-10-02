/** Isotipo de ColectaApp: la rueda de colectas con tres cumpleañeros confeti. */
export function LogoRueda({ conNombre = true }: { conNombre?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden>
        <circle cx="18" cy="18" r="11" fill="none" className="stroke-tinta" strokeWidth="2.5" />
        <circle cx="18" cy="6" r="5" className="fill-confeti-mostaza" />
        <circle cx="29" cy="23" r="5" className="fill-confeti-turquesa" />
        <circle cx="7" cy="23" r="5" className="fill-confeti-coral" />
      </svg>
      {conNombre && <span className="text-h3 font-extrabold">ColectaApp</span>}
    </span>
  )
}

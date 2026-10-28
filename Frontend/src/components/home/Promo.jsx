function Promo() {
  return (
    <section className="bg-[#f4f6f8] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0f8a45] to-[#14924c] px-6 py-10 text-white shadow-lg sm:px-10">
          <div className="pointer-events-none absolute top-1/2 right-6 hidden h-56 w-56 -translate-y-1/2 items-center justify-center opacity-20 lg:flex">
            <svg viewBox="0 0 120 140" className="h-full w-full" fill="none" stroke="white" strokeWidth="6">
              <path d="M60 8 108 28v40c0 32-20 54-48 64C32 122 12 100 12 68V28L60 8Z" />
              <path d="M60 42v48M40 66h40" strokeLinecap="round" />
            </svg>
          </div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-wide">
            <span aria-hidden="true">⚡</span> VENTES FLASH DE LA SEMAINE
          </p>
          <h2 className="mt-4 max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Prenez soin de vous au quotidien
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/90">
            Profitez de nos offres exclusives jusqu'à <span className="font-bold">-35%</span> sur les gammes solaires, dermo-soins et cures de saison.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <span className="inline-flex h-11 items-center rounded-full bg-white px-4 text-sm font-semibold text-[#1c2430]">
              Code : ATLAS10 (-10% supplémentaire)
            </span>
            <a
              href="#produits"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#c46a1a] px-5 text-sm font-bold text-white hover:bg-[#a85a14]"
            >
              Découvrir les offres →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Promo;

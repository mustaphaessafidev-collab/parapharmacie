import { useState } from "react";

const POINTS = [
  "Partenariat officiel avec plus de 80 grands laboratoires internationaux",
  "Conseils personnalisés par des docteurs en pharmacie marocains",
  "Respect strict des normes d'hygiène et de conservation des produits",
];

function Story() {
  return (
    <section id="apropos" className="bg-[#f4f6f8] py-8">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2">
        <div className="relative">
          <img
            src="/home/story-pharmacy.jpg"
            alt="Conseil en pharmacie AtlasPara"
            className="h-[420px] w-full rounded-[28px] object-cover shadow-[0_16px_40px_rgba(16,24,40,0.08)]"
          />
          <div className="absolute right-4 bottom-4 left-4 flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-lg">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f8ee] text-[#159447]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M8 21h8M12 17v4M7 3h10v8a5 5 0 0 1-10 0V3Z" strokeLinejoin="round" />
              </svg>
            </span>
            <span>
              <span className="block text-sm font-bold text-[#1c2430]">Dr. Sofia Benjelloun</span>
              <span className="block text-xs text-slate-500">Pharmacienne Responsable AtlasPara</span>
            </span>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-[0.16em] text-[#7d8da3]">NOTRE HISTOIRE &amp; ENGAGEMENT</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1c2430] sm:text-4xl">
            Votre partenaire santé, beauté et bien-être au Maroc
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-500">
            Fondée par une équipe de professionnels de santé passionnés, AtlasPara s'est donné pour mission de rendre accessible le meilleur de la dermo-cosmétique mondiale et des soins de santé à chaque foyer marocain. Nous sélectionnons rigoureusement des formules hypoallergéniques, sûres et scientifiquement éprouvées.
          </p>
          <ul className="mt-5 space-y-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm text-[#1c2430]">
                <span className="mt-0.5 text-[#159447]">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <a href="#contact" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#159447]">
            En savoir plus sur AtlasPara →
          </a>
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="bg-[#f4f6f8] pt-6 pb-4">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-[28px] bg-white px-6 py-10 text-center shadow-[0_16px_40px_rgba(16,24,40,0.06)] sm:px-12">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f8ee] text-[#159447]">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
              <path d="m4 7 8 6 8-6" />
            </svg>
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#1c2430]">
            Restez informé de nos offres &amp; conseils santé
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            Recevez nos nouveautés, conseils rédigés par nos pharmaciens et offres promotionnelles exclusives directement dans votre boîte mail.
          </p>
          {done ? (
            <p className="mt-6 text-sm font-semibold text-[#159447]">Merci, votre adresse est bien notée.</p>
          ) : (
            <form
              className="mx-auto mt-6 flex max-w-lg flex-col gap-3 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                if (!email.trim()) return;
                setDone(true);
              }}
            >
              <label className="sr-only" htmlFor="newsletter-email">
                Adresse e-mail
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Votre adresse e-mail"
                className="h-12 flex-1 rounded-full border border-slate-200 px-4 text-sm outline-none focus:border-[#159447]"
              />
              <button
                type="submit"
                className="h-12 rounded-full bg-[#159447] px-6 text-sm font-semibold text-white hover:bg-[#12843f]"
              >
                S'inscrire
              </button>
            </form>
          )}
          <p className="mt-4 text-[11px] text-slate-400">
            Données confidentielles protégées. Désinscription facile en 1 clic.
          </p>
        </div>
      </div>
    </section>
  );
}

export { Story, Newsletter };

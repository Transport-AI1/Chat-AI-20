"use client";

import Link from "next/link";

const plans = [
  {
    name: "Gratis",
    price: "0 €",
    description: "Para probar el chat y usar la IA en el día a día.",
    features: ["Chat con IA", "Historial en este dispositivo", "Acceso limitado a generaciones de imágenes"],
    cta: "Empezar gratis",
    href: "/",
    featured: false,
  },
  {
    name: "Starter",
    price: "2,99 €",
    description: "Para quienes quieren utilizar la IA con más frecuencia.",
    features: ["Más uso que el plan gratuito", "Chat y ayuda con tareas", "Generación de imágenes con límites de uso"],
    cta: "Elegir Starter",
    href: "mailto:alvarochaveinte1@gmail.com?subject=Plan%20Starter%20-%20Chat%20IA",
    featured: true,
  },
  {
    name: "Plus",
    price: "5,99 €",
    description: "Para usuarios que necesitan más capacidad en sus tareas.",
    features: ["Límites de uso superiores", "Chat, código y análisis", "Más generaciones de imágenes"],
    cta: "Consultar Plus",
    href: "mailto:alvarochaveinte1@gmail.com?subject=Plan%20Plus%20-%20Chat%20IA",
    featured: false,
  },
];

export default function PlansPage() {
  return (
    <main className="min-h-dvh bg-[#08080a] px-5 py-10 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">Chat IA</Link>
          <Link href="/" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">
            Volver al chat
          </Link>
        </nav>

        <section className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-emerald-400">Planes flexibles</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            La IA para tu día a día y para tu empresa
          </h1>
          <p className="mt-5 text-base leading-7 text-zinc-400">
            Empieza gratis y elige la opción que encaje con tu forma de trabajar.
            Los planes de pago se activarán cuando estén configurados los límites y el sistema de suscripción.
          </p>
        </section>

        <section className="mt-12 grid gap-4 lg:grid-cols-4">
          {plans.map((plan) => (
            <article key={plan.name} className={`flex flex-col rounded-2xl border p-6 ${plan.featured ? "border-emerald-500/60 bg-emerald-500/[0.06]" : "border-white/10 bg-[#101014]"}`}>
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="mt-3 text-3xl font-semibold">{plan.price}<span className="ml-1 text-sm font-normal text-zinc-500">/ mes</span></p>
              <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-400">{plan.description}</p>
              <ul className="my-6 flex-1 space-y-3 text-sm text-zinc-300">
                {plan.features.map((feature) => <li key={feature} className="flex gap-2"><span className="text-emerald-400">✓</span><span>{feature}</span></li>)}
              </ul>
              <Link href={plan.href} className={`rounded-xl px-4 py-3 text-center text-sm font-medium transition ${plan.featured ? "bg-emerald-500 text-black hover:bg-emerald-400" : "border border-white/10 hover:bg-white/5"}`}>
                {plan.cta}
              </Link>
            </article>
          ))}

          <article className="flex flex-col rounded-2xl border border-violet-400/40 bg-violet-400/[0.06] p-6">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-violet-300">Para empresas</p>
            <h2 className="mt-2 text-lg font-semibold">Business / Enterprise</h2>
            <p className="mt-3 text-3xl font-semibold">A medida</p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Una solución adaptada a equipos, negocios y organizaciones con necesidades específicas.
            </p>
            <ul className="my-6 flex-1 space-y-3 text-sm text-zinc-300">
              {["Opciones para distintos sectores", "Evaluación de necesidades y volumen de uso", "Propuesta personalizada y soporte", "Consulta de integraciones y privacidad"].map((feature) => <li key={feature} className="flex gap-2"><span className="text-violet-300">✓</span><span>{feature}</span></li>)}
            </ul>
            <a href="mailto:alvarochaveinte1@gmail.com?subject=Consulta%20para%20empresas%20-%20Chat%20IA&body=Hola%2C%20me%20gustar%C3%ADa%20informaci%C3%B3n%20para%20mi%20empresa.%0A%0AEmpresa%3A%0ASector%3A%0AN%C3%BAmero%20de%20usuarios%3A%0ANecesidades%3A" className="rounded-xl bg-violet-300 px-4 py-3 text-center text-sm font-semibold text-zinc-950 transition hover:bg-violet-200">
              Contactarme
            </a>
          </article>
        </section>

        <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-5 text-zinc-600">
          Los precios mostrados son una propuesta inicial, no una suscripción activa. El acceso multiusuario, los pagos y los límites de consumo deben configurarse antes de ofrecer los planes públicamente.
        </p>
      </div>
    </main>
  );
}

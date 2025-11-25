'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { CreateSpaceModal } from './CreateSpaceModal'
import { NocturneButton } from './NocturneButton'

export const NocturneHero = () => {
  const t = useTranslations('Hero')

  return (
    <section className="relative overflow-hidden sm:px-10 sm:py-16">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute inset-x-12 inset-y-10 rounded-4xl bg-[radial-gradient(circle_at_top,#1a1a1a,transparent_60%)] blur-3xl" />
        <div className="absolute top-6 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-linear-to-br from-white/10 via-white/5 to-transparent blur-[90px]" />
      </div>
      <div className="relative flex flex-col gap-12">
        <nav className="flex items-center justify-between text-[0.65rem] tracking-[0.5em] text-white/50 uppercase">
          <span>{t('nav.brand')}</span>
          <span>{t('nav.tagline')}</span>
        </nav>
        <div className="space-y-8 text-center">
          <p className="text-sm tracking-[0.4em] text-white/50 uppercase">
            {t('subheading')}
          </p>
          <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-[4.25rem]">
            {t('titleLine1')}
            <br />
            {t('titleLine2')}
          </h1>
          <div className="flex justify-center pt-4">
            <NocturneButton
              onClick={() => {
                document
                  .querySelector('#create-space')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
            >
              {t('button')}
            </NocturneButton>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.35fr,1fr]">
          <div className="mt-4 aspect-4/3 w-full overflow-hidden rounded-2xl border border-white/10">
            <img
              src="https://cdn.jsdelivr.net/gh/Afilmory/assets/afilmory-readme.webp"
              alt={t('preview.imageAlt')}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-between rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div>
              <p className="text-xs tracking-[0.4em] text-white/40 uppercase">
                {t('artistNoteLabel')}
              </p>
              <p className="mt-4 text-lg text-white">{t('artistNote')}</p>
            </div>
            <div className="mt-6 text-right text-sm text-white/60">
              {t('artistSignature')}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export const CreateSpaceCTA = () => {
  const t = useTranslations('CreateSpaceCTA')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const descriptionLines = t.raw('descriptionLines') as string[]
  const features = t.raw('features') as Array<{
    icon: string
    title: string
    description: string
  }>

  return (
    <>
      <section
        id="create-space"
        className="relative overflow-hidden rounded-[40px] border border-white/5 bg-linear-to-b from-[#0a0a0a] via-[#050505] to-black px-6 py-16 shadow-[0_30px_120px_rgba(0,0,0,0.6)] sm:px-10 sm:py-20"
      >
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute inset-x-12 inset-y-10 rounded-4xl bg-[radial-gradient(circle_at_center,#2a2a2a,transparent_70%)] blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-xs tracking-[0.6em] text-white/40 uppercase">
            {t('eyebrow')}
          </p>
          <h2 className="mt-6 font-serif text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
            {t('title')}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-white/70 sm:text-lg">
            {descriptionLines.map((line, index) => (
              <span key={line}>
                {line}
                {index === 0 && <br className="hidden sm:inline" />}
              </span>
            ))}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <NocturneButton onClick={() => setIsModalOpen(true)}>
              {t('button')}
            </NocturneButton>
          </div>
          <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="mb-3 text-2xl">{feature.icon}</div>
                <h3 className="mb-2 text-sm font-medium tracking-wider text-white">
                  {feature.title}
                </h3>
                <p className="text-xs leading-relaxed text-white/60">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CreateSpaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

export const PillarsSection = () => {
  const t = useTranslations('Pillars')
  const items = t.raw('items') as Array<{
    label: string
    title: string
    description: string
  }>

  return (
    <section id="chapters" className="space-y-10">
      <div className="text-center">
        <p className="text-xs tracking-[0.6em] text-white/40 uppercase">
          {t('eyebrow')}
        </p>
        <h2 className="mt-4 font-serif text-3xl text-white">{t('title')}</h2>
        <p className="mt-3 text-base text-white/70">{t('description')}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((pillar) => (
          <div
            key={pillar.label}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/8 to-transparent p-6 transition hover:border-white/30"
          >
            <div className="text-[0.65rem] tracking-[0.4em] text-white/40 uppercase">
              {pillar.label}
            </div>
            <h3 className="mt-4 font-serif text-2xl text-white">
              {pillar.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              {pillar.description}
            </p>
            <div className="mt-8 h-px w-full bg-linear-to-r from-transparent via-white/30 to-transparent opacity-50" />
          </div>
        ))}
      </div>
    </section>
  )
}

export const JourneySection = () => {
  const t = useTranslations('Journey')
  const steps = t.raw('steps') as Array<{ title: string; description: string }>

  return (
    <section
      id="journey"
      className="rounded-[36px] border border-white/10 bg-black/40 p-8 backdrop-blur-md"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs tracking-[0.5em] text-white/40 uppercase">
            {t('eyebrow')}
          </p>
          <h2 className="mt-4 font-serif text-3xl text-white">{t('title')}</h2>
        </div>
        <p className="max-w-xl text-sm text-white/70">{t('description')}</p>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex items-center gap-3 text-white/40">
              <span className="text-sm tracking-[0.4em]">STEP</span>
              <span className="text-lg text-white/80">{`0${index + 1}`}</span>
            </div>
            <h3 className="mt-4 font-serif text-2xl text-white">
              {step.title}
            </h3>
            <p className="mt-3 text-sm text-white/70">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export const GalleryPreview = () => {
  const t = useTranslations('GalleryPreview')
  const items = t.raw('items') as Array<{ title: string; caption: string }>
  const placeholder = t.raw('placeholder') as { title: string; label: string }

  return (
    <section id="preview" className="space-y-6">
      <div className="flex flex-col gap-3 text-left">
        <p className="text-xs tracking-[0.5em] text-white/40 uppercase">
          {t('eyebrow')}
        </p>
        <h2 className="font-serif text-3xl text-white">{t('title')}</h2>
        <p className="max-w-2xl text-sm text-white/60">{t('description')}</p>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((item) => (
          <div
            key={item.title}
            className="min-w-[260px] flex-1 rounded-[30px] border border-white/10 bg-linear-to-br from-white/10 via-transparent to-black/30 p-5"
          >
            <div className="aspect-3/4 w-full rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),rgba(0,0,0,0.85))]">
              <div className="flex h-full flex-col items-center justify-center text-center text-white/50">
                <span className="text-sm">{placeholder.title}</span>
                <span className="text-[0.65rem] tracking-[0.4em] uppercase">
                  {placeholder.label}
                </span>
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <p className="font-serif text-xl text-white">{item.title}</p>
              <p className="text-sm text-white/60">{item.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export const ArtistNote = () => {
  const t = useTranslations('ArtistNote')

  return (
    <section className="grid gap-8 rounded-[36px] border border-white/10 bg-linear-to-br from-white/5 via-transparent to-black/50 p-8 lg:grid-cols-[1.1fr,0.9fr]">
      <div className="space-y-6">
        <p className="text-xs tracking-[0.4em] text-white/40 uppercase">
          {t('eyebrow')}
        </p>
        <h2 className="font-serif text-3xl text-white">{t('title')}</h2>
        <p className="text-base leading-relaxed text-white/75">
          {t('description')}
        </p>
        <div className="pt-4 text-sm tracking-[0.4em] text-white/40 uppercase">
          {t('divider')}
        </div>
        <div>
          <p className="text-lg text-white">{t('signatureTitle')}</p>
          <p className="text-sm text-white/60">{t('signatureDescription')}</p>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/40 p-6">
        <div className="text-xs tracking-[0.4em] text-white/40 uppercase">
          {t('hintsLabel')}
        </div>
        <p className="mt-4 text-base leading-loose text-white/70">
          {t('hintsBody')}
        </p>
        <div className="mt-6 rounded-2xl border border-white/15 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),rgba(0,0,0,0.9))] p-6 text-sm text-white/70">
          {t('memoryNote')}
        </div>
      </div>
    </section>
  )
}

export const ClosingCTA = () => {
  const t = useTranslations('ClosingCTA')

  return (
    <section className="relative overflow-hidden rounded-[44px] border border-white/15 bg-linear-to-r from-black via-[#050505] to-black p-10 text-center">
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-y-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-linear-to-r from-white/10 via-transparent to-transparent blur-[100px]" />
        <div className="absolute right-0 bottom-0 left-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />
      </div>
      <div className="relative space-y-6">
        <p className="text-xs tracking-[0.5em] text-white/50 uppercase">
          {t('eyebrow')}
        </p>
        <h2 className="font-serif text-4xl text-white">{t('title')}</h2>
        <p className="mx-auto max-w-2xl text-base text-white/70">
          {t('description')}
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <NocturneButton className="text-base tracking-[0.3em]">
            {t('primaryButton')}
          </NocturneButton>
          <NocturneButton
            variant="secondary"
            className="text-base tracking-[0.3em]"
          >
            {t('secondaryButton')}
          </NocturneButton>
        </div>
      </div>
    </section>
  )
}

'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  Backpack,
  Box,
  Check,
  Clock3,
  Heart,
  MapPin,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Truck,
  X,
} from 'lucide-react'
import type { SchoolBoxProduct } from '@/lib/shopify'
import { formatXof } from '@/lib/shopify'

const WHATSAPP_NUMBER = '221781680145'
const CART_STORAGE_KEY = 'schoolbox-cart-v1'

const fallbackImages: Record<string, string> = {
  'kit-maternelle': '/kit-maternelle.png',
  'kit-primaire-ci-cp': '/kit-ci-cp.png',
  'kit-primaire-ce1-cm2': '/kit-ce1-cm2.png',
  'kit-college': '/kit-college.png',
  'kit-lycee': '/kit-lycee.png',
  'kit-universitaire': '/kit-universite.png',
}

const kitContents: Record<string, string[]> = {
  'kit-maternelle': ['Petit sac à dos', 'Cahier de coloriage et d’éveil', 'Cahier de graphisme', 'Crayons de couleur ×12', 'Ardoise et pâte à modeler'],
  'kit-primaire-ci-cp': ['Sac à dos adapté au primaire', 'Cahier de lecture CI-CP', 'Activités de mathématiques CI-CP', 'Cahier d’écriture et de graphisme', 'Crayons HB, couleurs et ardoise'],
  'kit-primaire-ce1-cm2': ['Sac à dos résistant', 'Cahier de lecture CE1-CM2', 'Cahier de mathématiques CM1-CM2', 'Cahiers des matières essentielles', 'Stylos, géométrie et trousse'],
  'kit-college': ['Sac à dos résistant', 'Cahiers 200p ×6', 'Cahier de français et grammaire', 'Cahier de mathématiques collège', 'Cahier d’anglais', 'Géométrie, stylos et trousse'],
  'kit-lycee': ['Sac à dos de lycée', 'Cahiers grand format', 'Cahier de mathématiques lycée', 'Cahier de français et philosophie', 'Stylos, géométrie et rangement'],
  'kit-universitaire': ['Sac ou pochette pour les cours', 'Cahiers et bloc-notes', 'Stylos, surligneurs et classeur', 'Chemises et trousse', 'Indispensables du campus'],
}

type BuilderProduct = { id: string; group: string; name: string; price: number; image: string; grade?: string; grades?: string[] }

const gradeOptions = ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', 'Seconde', 'Première', 'Terminale']
const primaryGrades = gradeOptions.slice(0, 6)
const secondaryGrades = gradeOptions.slice(6, 10)
const highSchoolGrades = gradeOptions.slice(10)
const middleAndHighSchoolGrades = [...secondaryGrades, ...highSchoolGrades]
const upperPrimaryGrades = gradeOptions.slice(2, 6)
const postPrimaryGrades = gradeOptions.slice(1)

const bagOptions: BuilderProduct[] = [
  { id: 'bag-primary-cat', group: 'Sac primaire · 4 000 F', name: 'Sac enfant rose avec chat', price: 4000, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-fHizuHKWuzyZmWAN1FYcGAfiCiC2Fr.png' },
  { id: 'bag-primary-pastel', group: 'Sac primaire · 4 000 F', name: 'Sac pastel multi-poches · rose ou lavande', price: 4000, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yn5g4bfd8Bpwb7ZsOJsRbUJtu0Zbkj.png' },
  { id: 'bag-primary-heroes', group: 'Sac primaire · 4 000 F', name: 'Sac imprimé héros · plusieurs modèles', price: 4000, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-7LEJgP6zboBQ1wlhS4VHgdOP86uZGi.png' },
  { id: 'bag-primary-rainbow', group: 'Sac primaire · 4 000 F', name: 'Sac rose et bleu arc-en-ciel', price: 4000, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-iYgNOahBJ2MxBH9y5N6fWaJcaMbywa.png' },
  { id: 'bag-primary-pink-navy', group: 'Sac primaire · 4 000 F', name: 'Sac à rabat rose et bleu marine', price: 4000, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3dSvZupaYD4zqfqGRw4GG9oW56Wbo9.png' },
  { id: 'bag-primary-pink-set', group: 'Sac primaire · 4 000 F', name: 'Sac rose imprimé · ensemble assorti', price: 4000, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2N9A7kOS8QwlldQVb2ZhOpu7nSH0U2.png' },
  { id: 'bag-college-multipocket', group: 'Sac collège · 5 500 F', name: 'Sac multi-poches · coloris au choix', price: 5500, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-gG5epXHjig4VcxfzHwgxK3jrUXYu1g.png' },
  { id: 'bag-college-pink', group: 'Sac collège · 5 500 F', name: 'Sac rose renforcé multi-compartiments', price: 5500, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-zptaosjoaD22HLZshbDi4Bdo9UQUmj.png' },
  { id: 'bag-college-pink-simple', group: 'Sac collège · 5 500 F', name: 'Sac rose classique', price: 5500, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2ULyLvjD8kHHWq8gP55PnmqZJs9xki.png' },
  { id: 'bag-college-dark-set', group: 'Sac collège · 5 500 F', name: 'Sac noir grand format multi-compartiments', price: 5500, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-lE19ywvCerLFJrioyVOD2Nhanr9Nuc.png' },
  { id: 'bag-college-colors', group: 'Sac collège · 5 500 F', name: 'Sac classique · plusieurs coloris', price: 5500, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-YVMtOrB1Pc1pLLTi85iMod55g4wGCc.png' },
  { id: 'bag-college-burgundy', group: 'Sac collège · 5 500 F', name: 'Sac bordeaux à poche frontale', price: 5500, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-GUsRpNE0mL1lgGuNUci2jL8PmIYhvQ.png' },
  { id: 'bag-lycee-black', group: 'Sac lycée · 8 000 F', name: 'Sac à dos noir classique', price: 8000, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-LHl9vFGAcCS1C6R59dMQgyFRhw1ZZx.png' },
  { id: 'bag-lycee-navy', group: 'Sac lycée · 8 000 F', name: 'Sac bleu marine avec détails camel', price: 8000, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0lPTNOf0wVmjfEhmpCqDzbBvHKuNkN.png' },
  { id: 'bag-lycee-tech', group: 'Sac lycée · 8 000 F', name: 'Sac noir grand format', price: 8000, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0c3CRs0tly87zRWTBH1Hf2wLVj3IBk.png' },
  { id: 'bag-lycee-flap', group: 'Sac lycée · 8 000 F', name: 'Sac noir à rabat style urbain', price: 8000, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-YXwDcU8WeT5owKCKv3cuITz9Avphom.png' },
  { id: 'bag-lycee-rose', group: 'Sac lycée · 8 000 F', name: 'Sac rose poudré à poches', price: 8000, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-O2PttVqaqV7782q9U52uFoi9f3eZC9.png' },
  { id: 'bag-lycee-leather', group: 'Sac lycée · 8 000 F', name: 'Sac noir finition brillante', price: 8000, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2K8zOjOaJAUokK4iqsQJztfwhVkE8J.png' },
]

const bookOptions: BuilderProduct[] = [
  { id: 'book-ci-lecture', grade: 'CI', group: 'Livres et cahiers · CI', name: 'Lecture, langage et découverte', price: 2500, image: '/product-livres.png' },
  { id: 'book-ci-maths', grade: 'CI', group: 'Livres et cahiers · CI', name: 'Activités de mathématiques · CI', price: 2500, image: '/product-livres.png' },
  { id: 'book-ci-ecriture', grade: 'CI', group: 'Livres et cahiers · CI', name: 'Graphisme et pré-écriture', price: 2000, image: '/product-livres.png' },
  { id: 'book-cp-lecture', grade: 'CP', group: 'Livres et cahiers · CP', name: 'Lecture et syllabes · CP', price: 2800, image: '/product-livres.png' },
  { id: 'book-cp-maths', grade: 'CP', group: 'Livres et cahiers · CP', name: 'Activités de mathématiques · CP', price: 2800, image: '/product-livres.png' },
  { id: 'book-cp-ecriture', grade: 'CP', group: 'Livres et cahiers · CP', name: 'Écriture et expression française', price: 2200, image: '/product-livres.png' },
  ...(['CE1', 'CE2', 'CM1', 'CM2'] as const).flatMap((grade) => {
    const upperPrimary = grade === 'CM1' || grade === 'CM2'
    return [
      { id: `book-${grade.toLowerCase()}-french`, grade, group: `Livres et cahiers · ${grade}`, name: `Français, lecture et grammaire · ${grade}`, price: upperPrimary ? 3500 : 3000, image: '/product-livres.png' },
      { id: `book-${grade.toLowerCase()}-maths`, grade, group: `Livres et cahiers · ${grade}`, name: `Activités de mathématiques · ${grade}`, price: upperPrimary ? 4000 : 3200, image: '/product-livres.png' },
      { id: `book-${grade.toLowerCase()}-discovery`, grade, group: `Livres et cahiers · ${grade}`, name: `Sciences et découverte du monde · ${grade}`, price: upperPrimary ? 3200 : 2800, image: '/product-livres.png' },
    ]
  }),
  ...(['6e', '5e', '4e', '3e'] as const).flatMap((grade) => [
    { id: `book-${grade}-french`, grade, group: `Livres et cahiers · ${grade}`, name: `Français et grammaire · ${grade}`, price: 4500, image: '/product-livres.png' },
    { id: `book-${grade}-maths`, grade, group: `Livres et cahiers · ${grade}`, name: `Mathématiques · ${grade}`, price: 5000, image: '/product-livres.png' },
    { id: `book-${grade}-english`, grade, group: `Livres et cahiers · ${grade}`, name: `Anglais · ${grade}`, price: 3500, image: '/product-livres.png' },
    { id: `book-${grade}-history`, grade, group: `Livres et cahiers · ${grade}`, name: `Histoire-géographie · ${grade}`, price: 4000, image: '/product-livres.png' },
    { id: `book-${grade}-science`, grade, group: `Livres et cahiers · ${grade}`, name: `Sciences · ${grade}`, price: 4500, image: '/product-livres.png' },
  ]),
  ...(['Seconde', 'Première', 'Terminale'] as const).flatMap((grade) => [
    { id: `book-${grade.toLowerCase()}-french`, grade, group: `Livres et cahiers · ${grade}`, name: `Français et littérature · ${grade}`, price: 5000, image: '/product-livres.png' },
    { id: `book-${grade.toLowerCase()}-maths`, grade, group: `Livres et cahiers · ${grade}`, name: `Mathématiques · ${grade}`, price: 5500, image: '/product-livres.png' },
    { id: `book-${grade.toLowerCase()}-english`, grade, group: `Livres et cahiers · ${grade}`, name: `Anglais · ${grade}`, price: 4000, image: '/product-livres.png' },
    { id: `book-${grade.toLowerCase()}-sciences`, grade, group: `Livres et cahiers · ${grade}`, name: `Sciences selon la série · ${grade}`, price: 5000, image: '/product-livres.png' },
  ]),
]

const supplyOptions: BuilderProduct[] = [
  { id: 'cahier-100', group: 'Cahiers', name: 'Lot de 5 cahiers 100 pages', price: 2500, image: '/product-cahiers.png', grades: primaryGrades },
  { id: 'cahier-200', group: 'Cahiers', name: 'Lot de 5 cahiers 200 pages', price: 4000, image: '/product-cahiers.png', grades: [...upperPrimaryGrades, ...middleAndHighSchoolGrades] },
  { id: 'cahier-300', group: 'Cahiers', name: 'Lot de 5 cahiers 300 pages', price: 5500, image: '/product-cahiers.png', grades: middleAndHighSchoolGrades },
  { id: 'cahier-dessin', group: 'Cahiers', name: 'Cahier de dessin et coloriage', price: 1800, image: '/product-cahiers.png', grades: primaryGrades },
  { id: 'bloc', group: 'Cahiers', name: 'Bloc-notes pour les cours', price: 1500, image: '/product-cahiers.png', grades: middleAndHighSchoolGrades },
  { id: 'stylos', group: 'Écriture', name: 'Lot de 6 stylos assortis', price: 1800, image: '/product-stylos.png', grades: postPrimaryGrades },
  { id: 'crayons', group: 'Écriture', name: 'Crayons HB ×5 + gomme', price: 1200, image: '/product-stylos.png', grades: primaryGrades },
  { id: 'couleurs', group: 'Écriture', name: 'Crayons de couleur ×12', price: 2000, image: '/product-stylos.png', grades: primaryGrades },
  { id: 'surligneurs', group: 'Écriture', name: 'Lot de 4 surligneurs', price: 2200, image: '/product-stylos.png', grades: [...upperPrimaryGrades, ...middleAndHighSchoolGrades] },
  { id: 'geometrie', group: 'Géométrie', name: 'Kit de géométrie complet', price: 2500, image: '/product-geometrie.png', grades: postPrimaryGrades },
  { id: 'regle', group: 'Géométrie', name: 'Règle et équerres', price: 1200, image: '/product-geometrie.png', grades: postPrimaryGrades },
  { id: 'calculatrice', group: 'Géométrie', name: 'Calculatrice scolaire', price: 4500, image: '/product-geometrie.png', grades: middleAndHighSchoolGrades },
  { id: 'ardoise', group: 'Géométrie', name: 'Ardoise + feutres', price: 1500, image: '/product-geometrie.png', grades: ['CI', 'CP'] },
  { id: 'trousse', group: 'Trousses et rangement', name: 'Trousse scolaire', price: 2000, image: '/product-trousse.png', grades: postPrimaryGrades },
  { id: 'pochettes', group: 'Trousses et rangement', name: 'Lot de pochettes', price: 1000, image: '/product-trousse.png', grades: postPrimaryGrades },
  { id: 'classeur', group: 'Trousses et rangement', name: 'Classeur avec intercalaires', price: 3500, image: '/product-trousse.png', grades: middleAndHighSchoolGrades },
  { id: 'protege-cahiers', group: 'Trousses et rangement', name: 'Lot de protège-cahiers', price: 1500, image: '/product-trousse.png', grades: primaryGrades },
]

const builderProducts: BuilderProduct[] = [...supplyOptions, ...bookOptions]

const bookCatalogNote = 'Livres et cahiers classés par niveau, de CI à Terminale. Les éditions exactes et la disponibilité sont confirmées avec vous avant préparation.'

const steps = [
  { icon: ShoppingBag, title: 'Vous choisissez', text: 'Sélectionnez un kit complet ou composez le vôtre en quelques clics.' },
  { icon: PackageCheck, title: 'On prépare votre pack', text: 'Nous coordonnons avec nos fournisseurs locaux pour réunir l’essentiel.' },
  { icon: Truck, title: 'Livré chez vous', text: 'Votre commande arrive à domicile à Dakar et en banlieue.' },
]

type CustomKit = { title: string; selections: string[]; unitPrice: number; image?: string }
type CartEntry = { key: string; productId?: string; quantity: number; customKit?: CustomKit }
type CheckoutDetails = { parent: string; phone: string; address: string; grade: string; school: string; payment: string }

function imageFor(product: SchoolBoxProduct) {
  return product.featuredImage?.url || fallbackImages[product.handle] || '/schoolbox-hero.png'
}

function whatsappHref(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

function BrandMark() {
  return (
    <a href="#accueil" className="flex shrink-0 items-center gap-2.5" aria-label="SCHOOL BOX SENEGAL, accueil">
      <span className="relative flex size-11 items-center justify-center rounded-2xl bg-[#1e3a8a] text-[#fbbf24] shadow-sm">
        <Backpack aria-hidden="true" className="size-6" />
        <Box aria-hidden="true" className="absolute bottom-1 right-1 size-3.5 rounded-sm bg-[#1e3a8a]" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-black tracking-[-0.055em] text-[#1e3a8a]">SCHOOL BOX</span>
        <span className="mt-1 text-[9px] font-bold tracking-[0.22em] text-slate-500">SENEGAL</span>
      </span>
    </a>
  )
}

function Header({ count, onCart, onMenu, menuOpen }: { count: number; onCart: () => void; onMenu: () => void; menuOpen: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        <BrandMark />
        <nav aria-label="Navigation principale" className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
          <a className="transition hover:text-[#1e3a8a]" href="#kits">Kits</a>
          <a className="transition hover:text-[#1e3a8a]" href="#sur-mesure">Créer mon kit</a>
          <a className="transition hover:text-[#1e3a8a]" href="#livraison">Livraison</a>
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={onMenu} className="flex size-10 items-center justify-center rounded-full text-[#1e3a8a] hover:bg-[#f5f8ff] md:hidden" aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menuOpen}>
            {menuOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
          </button>
          <button onClick={onCart} className="relative inline-flex items-center gap-2 rounded-full bg-[#1e3a8a] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#172f72]" aria-label={`Ouvrir le panier, ${count} article${count > 1 ? 's' : ''}`}>
            <ShoppingCart aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">Panier</span>
            <span className="flex min-w-5 items-center justify-center rounded-full bg-[#fbbf24] px-1.5 text-xs font-black text-[#1e3a8a]">{count}</span>
          </button>
        </div>
      </div>
    </header>
  )
}

function ProductCard({ product, onAdd }: { product: SchoolBoxProduct; onAdd: (product: SchoolBoxProduct) => void }) {
  const contents = kitContents[product.handle] ?? ['Fournitures essentielles pour la rentrée', 'Composition à découvrir en boutique']
  const soldOut = !product.variant?.availableForSale || product.variant.quantityAvailable < 1

  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-[26px] border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl ${product.isBestSeller ? 'border-[#fbbf24] shadow-[0_12px_40px_rgba(30,58,138,0.08)]' : 'border-slate-200 shadow-[0_8px_30px_rgba(15,23,42,0.04)]'}`}>
      <div className="relative aspect-[1.12/1] overflow-hidden bg-[#f4f7fd]">
        <Image src={imageFor(product)} alt={product.featuredImage?.altText || `Photo du ${product.title}`} fill sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw" className="object-cover transition duration-500 group-hover:scale-[1.04]" unoptimized />
        <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
          <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#1e3a8a] shadow-sm">Livraison gratuite Dakar</span>
          {product.isBestSeller && <span className="rounded-full bg-[#fbbf24] px-3 py-1.5 text-[11px] font-extrabold text-[#1e3a8a]">Le plus commandé</span>}
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
          <span className={`size-2 rounded-full ${soldOut ? 'bg-rose-500' : 'bg-emerald-500'}`} />
          {soldOut ? 'Épuisé' : `Stock limité · ${product.variant?.quantityAvailable ?? 0}`}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-lg font-extrabold tracking-tight text-[#1e3a8a]">{product.title}</h3>
          <span className="shrink-0 text-right text-base font-black text-[#1e3a8a]">{formatXof(product.priceXof)} <span className="text-[11px] font-bold">F</span></span>
        </div>
        <ul className="mb-6 flex flex-1 flex-col gap-2.5 text-[13px] leading-snug text-slate-600">
          {contents.map((item) => <li key={item} className="flex items-start gap-2"><Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-[#1e3a8a]" /><span>{item}</span></li>)}
        </ul>
        <button disabled={soldOut} onClick={() => onAdd(product)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#172f72] disabled:cursor-not-allowed disabled:bg-slate-300">
          <Plus aria-hidden="true" className="size-4" />
          {soldOut ? 'Indisponible' : 'Ajouter au panier'}
        </button>
      </div>
    </article>
  )
}

function BagShelf({ onAdd }: { onAdd: (bag: CustomKit) => void }) {
  return (
    <section aria-labelledby="bags-title" className="mb-12 rounded-[28px] border border-amber-100 bg-[#fffaf0] p-5 sm:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9a6b16]">Choisissez votre modèle</span>
          <h3 id="bags-title" className="mt-1 text-xl font-black tracking-tight text-[#1e3a8a] sm:text-2xl">Nos sacs, vendus à l’unité</h3>
          <p className="mt-1 text-sm text-slate-600">Faites défiler les modèles pour choisir un sac à ajouter seul au panier.</p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#1e3a8a]">Primaire · 4 000 F · Collège · 5 500 F · Lycée · 8 000 F</span>
      </div>
      <div className="relative mt-5 pt-5">
        <div aria-hidden="true" className="absolute left-0 right-0 top-2 border-t-2 border-dashed border-amber-800/45" />
        <div className="flex snap-x gap-4 overflow-x-auto pb-3">
          {bagOptions.map((bag) => (
            <article key={bag.id} className="relative flex w-[220px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm">
              <span aria-hidden="true" className="absolute left-1/2 top-0 z-10 h-5 w-1 -translate-x-1/2 rounded-b bg-amber-700/70" />
              <div className="relative aspect-[1.15/1] overflow-hidden bg-[#f8f8f5]">
                <Image src={bag.image} alt={bag.name} fill sizes="220px" unoptimized className="object-contain p-3" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{bag.group}</span>
                <h4 className="mt-1 flex-1 text-sm font-bold leading-snug text-[#1e3a8a]">{bag.name}</h4>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-sm font-black text-[#1e3a8a]">{formatXof(bag.price)} F</span>
                  <button onClick={() => onAdd({ title: bag.name, selections: ['Sac vendu individuellement'], unitPrice: bag.price, image: bag.image })} className="rounded-lg bg-[#1e3a8a] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#172f72]">Acheter</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function CustomKitBuilder({ onAdd }: { onAdd: (kit: CustomKit) => void }) {
  const [selected, setSelected] = useState<string[]>([])
  const [selectedGrade, setSelectedGrade] = useState('')
  const visibleProducts = selectedGrade ? builderProducts.filter((item) => item.grade === selectedGrade || item.grades?.includes(selectedGrade)) : []
  const groups = [...new Set(visibleProducts.map((item) => item.group))]
  const selectedProducts = builderProducts.filter((item) => selected.includes(item.id) && (item.grade === selectedGrade || item.grades?.includes(selectedGrade)))
  const total = selectedProducts.reduce((sum, item) => sum + item.price, 0)

  function changeGrade(grade: string) {
    setSelectedGrade(grade)
    setSelected((current) => current.filter((id) => {
      const product = builderProducts.find((item) => item.id === id)
      return product?.grade === grade || product?.grades?.includes(grade)
    }))
  }

  function toggle(item: BuilderProduct) {
    setSelected((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])
  }

  return (
    <section id="sur-mesure" className="scroll-mt-24 bg-[#f5f8ff] py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:px-8">
        <div className="lg:sticky lg:top-32">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#fff2c8] px-3.5 py-2 text-xs font-bold text-[#1e3a8a]"><Sparkles aria-hidden="true" className="size-3.5" /> À votre façon</span>
          <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.045em] text-[#1e3a8a] sm:text-4xl">Crée ton kit<br />sur mesure.</h2>
          <p className="mt-4 max-w-md text-[15px] leading-7 text-slate-600">Choisissez d’abord la classe de l’élève : seules les fournitures et les livres de ce niveau seront proposés.</p>
          <label htmlFor="kit-grade" className="mt-6 flex flex-col gap-2 text-sm font-bold text-[#1e3a8a]">Classe de l’élève
            <select id="kit-grade" value={selectedGrade} onChange={(event) => changeGrade(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100">
              <option value="">Choisir une classe</option>
              {gradeOptions.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
            </select>
          </label>
          <p className="mt-3 text-xs leading-5 text-slate-500">{bookCatalogNote}</p>
          <div className="mt-8 rounded-3xl bg-[#1e3a8a] p-6 text-white shadow-xl shadow-blue-950/10">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-semibold text-blue-100">Votre sélection</p><p className="mt-2 text-3xl font-black tracking-tight">{formatXof(total)} <span className="text-base">F</span></p></div>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10"><ShoppingBag aria-hidden="true" className="size-5 text-[#fbbf24]" /></span>
            </div>
            <p className="mt-3 text-xs text-blue-100">{selectedProducts.length} article{selectedProducts.length !== 1 ? 's' : ''} sélectionné{selectedProducts.length !== 1 ? 's' : ''} · livraison Dakar offerte</p>
            <button disabled={selectedProducts.length === 0} onClick={() => onAdd({ title: `Kit sur mesure · ${selectedGrade}`, selections: selectedProducts.map((item) => item.name), unitPrice: total })} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#fbbf24] px-4 py-3.5 text-sm font-extrabold text-[#1e3a8a] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50">
              Créer mon kit <ArrowRight aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {selectedGrade ? groups.map((group) => (
            <fieldset key={group} className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
              <legend className="px-1 text-sm font-extrabold text-[#1e3a8a]">{group}</legend>
              <div className="mt-2 flex flex-col gap-3">
                {visibleProducts.filter((item) => item.group === group).map((item) => {
                  const checked = selected.includes(item.id)
                  return <label key={item.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition ${checked ? 'border-[#1e3a8a] bg-[#f5f8ff]' : 'border-slate-100 hover:border-slate-300'}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggle(item)} className="size-4 shrink-0 accent-[#1e3a8a]" />
                    <Image src={item.image} alt={item.name} width={56} height={56} unoptimized className="size-14 shrink-0 rounded-xl bg-[#f5f8ff] object-contain p-1" />
                    <span className="flex min-w-0 flex-1 flex-col gap-1"><span className="text-[13px] font-semibold leading-snug text-slate-700">{item.name}</span><span className="text-xs font-bold text-[#1e3a8a]">{formatXof(item.price)} F</span></span>
                  </label>
                })}
              </div>
            </fieldset>
          )) : <p role="status" className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-semibold text-slate-600 sm:col-span-2">Choisissez la classe de l’élève pour afficher les fournitures adaptées.</p>}
        </div>
      </div>
    </section>
  )
}

function CartDrawer({
  entries,
  products,
  details,
  setDetails,
  onClose,
  onQuantity,
  onRemove,
  total,
}: {
  entries: CartEntry[]
  products: SchoolBoxProduct[]
  details: CheckoutDetails
  setDetails: (details: CheckoutDetails) => void
  onClose: () => void
  onQuantity: (key: string, next: number) => void
  onRemove: (key: string) => void
  total: number
}) {
  const byId = new Map(products.map((product) => [product.id, product]))
  const whatsappMessage = useMemo(() => {
    const lines = entries.map((entry) => {
      if (entry.customKit) return `• ${entry.customKit.title} ×${entry.quantity} (${formatXof(entry.customKit.unitPrice * entry.quantity)} F)\n  ${entry.customKit.selections.join(', ')}`
      const product = entry.productId ? byId.get(entry.productId) : undefined
      return product ? `• ${product.title} ×${entry.quantity} (${formatXof(product.priceXof * entry.quantity)} F)` : ''
    }).filter(Boolean)
    return [
      'Bonjour SCHOOL BOX SENEGAL, je souhaite commander :',
      ...lines,
      `Total : ${formatXof(total)} F CFA`,
      '',
      `Parent : ${details.parent || 'à renseigner'}`,
      `Téléphone : ${details.phone || 'à renseigner'}`,
      `Adresse : ${details.address || 'à renseigner'}`,
      `Classe : ${details.grade || 'à renseigner'}`,
      `École : ${details.school || 'à renseigner'}`,
      `Paiement : ${details.payment}`,
    ].filter(Boolean).join('\n')
  }, [entries, total, details, byId])

  function update(key: keyof CheckoutDetails, value: string) {
    setDetails({ ...details, [key]: value })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/45" onClick={onClose}>
      <aside role="dialog" aria-modal="true" aria-labelledby="cart-title" onClick={(event) => event.stopPropagation()} className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-7">
          <div><h2 id="cart-title" className="text-xl font-black text-[#1e3a8a]">Votre panier</h2><p className="mt-0.5 text-xs text-slate-500">{entries.reduce((sum, entry) => sum + entry.quantity, 0)} article(s) sélectionné(s)</p></div>
          <button onClick={onClose} aria-label="Fermer le panier" className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"><X aria-hidden="true" className="size-5" /></button>
        </div>
        <div className="flex flex-1 flex-col gap-5 px-5 py-5 sm:px-7">
          {entries.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center py-12 text-center"><span className="flex size-16 items-center justify-center rounded-3xl bg-[#f5f8ff] text-[#1e3a8a]"><ShoppingCart aria-hidden="true" className="size-7" /></span><h3 className="mt-4 text-lg font-bold text-[#1e3a8a]">Votre panier est vide</h3><p className="mt-2 text-sm text-slate-500">Ajoutez un kit pour préparer la rentrée.</p><button onClick={onClose} className="mt-5 rounded-xl bg-[#1e3a8a] px-5 py-3 text-sm font-bold text-white">Voir les kits</button></div> : <>
            <div className="flex flex-col gap-3">
              {entries.map((entry) => {
                const product = entry.productId ? byId.get(entry.productId) : undefined
                const title = entry.customKit?.title ?? product?.title ?? 'Kit scolaire'
                const price = entry.customKit?.unitPrice ?? product?.priceXof ?? 0
                const image = entry.customKit?.image ?? (entry.customKit ? '/schoolbox-hero.png' : product ? imageFor(product) : '/schoolbox-hero.png')
                const limit = product?.variant?.quantityAvailable ?? 100
                return <div key={entry.key} className="flex gap-4 rounded-2xl border border-slate-200 p-3.5">
                  <div className="relative size-[76px] shrink-0 overflow-hidden rounded-xl bg-[#f4f7fd]"><Image src={image} alt="" fill sizes="76px" className="object-cover" unoptimized /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2"><div><h3 className="text-sm font-bold text-[#1e3a8a]">{title}</h3><p className="mt-1 text-xs text-slate-500">{formatXof(price)} F l’unité</p></div><button onClick={() => onRemove(entry.key)} aria-label={`Retirer ${title}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><X aria-hidden="true" className="size-4" /></button></div>
                    {entry.customKit && <p className="mt-1 truncate text-[11px] text-slate-500">{entry.customKit.selections.join(', ')}</p>}
                    <div className="mt-2 flex items-center justify-between"><div className="inline-flex items-center rounded-lg border border-slate-200"><button onClick={() => onQuantity(entry.key, entry.quantity - 1)} aria-label={`Diminuer ${title}`} className="flex size-8 items-center justify-center text-slate-600"><Minus aria-hidden="true" className="size-3.5" /></button><span className="w-8 text-center text-xs font-bold">{entry.quantity}</span><button onClick={() => onQuantity(entry.key, Math.min(limit, entry.quantity + 1))} aria-label={`Augmenter ${title}`} disabled={entry.quantity >= limit} className="flex size-8 items-center justify-center text-slate-600 disabled:opacity-40"><Plus aria-hidden="true" className="size-3.5" /></button></div><span className="text-sm font-extrabold text-[#1e3a8a]">{formatXof(price * entry.quantity)} F</span></div>
                  </div>
                </div>
              })}
            </div>
            <div className="rounded-2xl bg-[#f5f8ff] px-4 py-3 text-sm"><div className="flex items-center justify-between text-slate-600"><span>Livraison Dakar</span><span className="font-bold text-emerald-700">Offerte</span></div><div className="mt-2 flex items-center justify-between border-t border-blue-100 pt-3 font-extrabold text-[#1e3a8a]"><span>Total estimé</span><span>{formatXof(total)} F CFA</span></div></div>
            <form onSubmit={(event) => { event.preventDefault(); window.open(whatsappHref(whatsappMessage), '_blank', 'noopener,noreferrer') }} className="flex flex-col gap-3.5">
              <h3 className="text-base font-extrabold text-[#1e3a8a]">Livraison & contact</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">Nom du parent<input required autoComplete="name" value={details.parent} onChange={(e) => update('parent', e.target.value)} placeholder="Votre nom" className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100" /></label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">Téléphone<input required autoComplete="tel" inputMode="tel" value={details.phone} onChange={(e) => update('phone', e.target.value)} placeholder="77 123 45 67" className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100" /></label>
              </div>
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">Adresse de livraison<input required autoComplete="street-address" value={details.address} onChange={(e) => update('address', e.target.value)} placeholder="Quartier, commune, repère" className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100" /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">Classe de l’enfant<input value={details.grade} onChange={(e) => update('grade', e.target.value)} placeholder="Ex. CM2" className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100" /></label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">École<input value={details.school} onChange={(e) => update('school', e.target.value)} placeholder="Nom de l’école" className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100" /></label>
              </div>
              <fieldset className="flex flex-col gap-2"><legend className="mb-1 text-xs font-semibold text-slate-700">Mode de paiement</legend>{[['wave', 'Wave'], ['orange', 'Orange Money'], ['livraison', 'Paiement à la livraison']].map(([value, label]) => <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-sm font-semibold ${details.payment === value ? 'border-[#1e3a8a] bg-[#f5f8ff] text-[#1e3a8a]' : 'border-slate-200 text-slate-700'}`}><input type="radio" name="payment" value={value} checked={details.payment === value} onChange={(e) => update('payment', e.target.value)} className="size-4 accent-[#1e3a8a]" /><span>{label}</span>{value !== 'livraison' && <span className="ml-auto text-xs font-medium text-slate-500">au 78 168 01 45</span>}</label>)}</fieldset>
              <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-4 text-sm font-extrabold text-white transition hover:bg-[#172f72]"><MessageMark /> Confirmer sur WhatsApp <ArrowRight aria-hidden="true" className="size-4" /></button>
              <p className="text-center text-[11px] leading-relaxed text-slate-500">Votre commande sera envoyée à notre équipe pour confirmation. Le paiement sera convenu directement sur WhatsApp.</p>
            </form>
          </>}
        </div>
      </aside>
    </div>
  )
}

function MessageMark() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M12 2a9.77 9.77 0 0 0-8.4 14.77L2.4 22l5.37-1.16A9.92 9.92 0 0 0 12 21.8 9.9 9.9 0 0 0 21.9 12 9.9 9.9 0 0 0 12 2Zm0 17.98a8.16 8.16 0 0 1-4.16-1.14l-.3-.18-3.19.69.7-3.1-.2-.31A8.02 8.02 0 1 1 12 19.98Zm4.4-6.02c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.02-.37.1-.49.11-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.36.51.57.18 1.09.16 1.5.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" /></svg>
}

export default function SchoolBoxStorefront({ products }: { products: SchoolBoxProduct[] }) {
  const [entries, setEntries] = useState<CartEntry[] | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [details, setDetails] = useState<CheckoutDetails>({ parent: '', phone: '', address: '', grade: '', school: '', payment: 'wave' })

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_STORAGE_KEY)
      const parsed = saved ? JSON.parse(saved) as CartEntry[] : []
      setEntries(Array.isArray(parsed) ? parsed : [])
    } catch {
      setEntries([])
    }
  }, [])

  useEffect(() => {
    if (entries !== null) window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const cartEntries = entries ?? []
  const cartCount = cartEntries.reduce((sum, entry) => sum + entry.quantity, 0)
  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products])
  const total = cartEntries.reduce((sum, entry) => {
    if (entry.customKit) return sum + entry.customKit.unitPrice * entry.quantity
    const product = entry.productId ? productMap.get(entry.productId) : undefined
    return sum + (product?.priceXof ?? 0) * entry.quantity
  }, 0)

  function addProduct(product: SchoolBoxProduct) {
    if (!product.variant) return
    const key = product.variant.id
    const limit = product.variant.quantityAvailable
    setEntries((current) => {
      const list = current ?? []
      const existing = list.find((entry) => entry.key === key)
      if (existing) return list.map((entry) => entry.key === key ? { ...entry, quantity: Math.min(limit, entry.quantity + 1) } : entry)
      return [...list, { key, productId: product.id, quantity: 1 }]
    })
    setCartOpen(true)
  }

  function addCustomKit(kit: CustomKit) {
    setEntries((current) => [...(current ?? []), { key: `custom-${Date.now()}`, quantity: 1, customKit: kit }])
    setCartOpen(true)
  }

  function setQuantity(key: string, quantity: number) {
    if (quantity < 1) return removeEntry(key)
    const item = entries?.find((entry) => entry.key === key)
    const product = item?.productId ? productMap.get(item.productId) : undefined
    const limit = product?.variant?.quantityAvailable ?? 100
    setEntries((current) => (current ?? []).map((entry) => entry.key === key ? { ...entry, quantity: Math.min(limit, quantity) } : entry))
  }

  function removeEntry(key: string) {
    setEntries((current) => (current ?? []).filter((entry) => entry.key !== key))
  }

  return (
    <main id="accueil" className="schoolbox min-h-screen bg-white text-slate-900">
      <Header count={cartCount} onCart={() => setCartOpen(true)} onMenu={() => setMobileMenuOpen((open) => !open)} menuOpen={mobileMenuOpen} />
      {mobileMenuOpen && <nav aria-label="Navigation mobile" className="fixed inset-x-0 top-[76px] z-40 flex flex-col gap-1 border-b border-slate-100 bg-white px-4 py-4 shadow-lg md:hidden"><a onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700" href="#kits">Kits</a><a onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700" href="#sur-mesure">Créer mon kit</a><a onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700" href="#livraison">Livraison</a></nav>}

      <section className="relative isolate overflow-hidden bg-[#f6f8fc]">
        <div className="mx-auto grid max-w-7xl items-center gap-2 px-4 pb-10 pt-10 sm:px-6 sm:pb-16 sm:pt-16 lg:min-h-[570px] lg:grid-cols-[0.94fr_1.06fr] lg:px-8 lg:py-12">
          <div className="relative z-10 max-w-xl py-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-2 text-[11px] font-bold text-[#1e3a8a] shadow-sm"><MapPin aria-hidden="true" className="size-3.5" /> Dakar & banlieue · Rentrée simplifiée</span>
            <h1 className="mt-6 text-[2.3rem] font-black leading-[1.08] tracking-[-0.065em] text-[#1e3a8a] sm:text-5xl lg:text-[3rem]">Tout pour la rentrée,<br /><span className="relative inline-block">sans vous déplacer.<span className="absolute -bottom-1 left-0 -z-10 h-3 w-full rounded-full bg-[#fbbf24]/70 sm:h-4" /></span></h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">Kits scolaires complets livrés à Dakar en 24h. Un seul pack, tout est prêt.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#kits" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] px-6 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-[#172f72]">Voir les kits <ArrowDown aria-hidden="true" className="size-4" /></a>
              <a href={whatsappHref('Bonjour SCHOOL BOX SENEGAL, je souhaite en savoir plus sur vos kits scolaires.')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1e3a8a]/15 bg-white px-6 py-4 text-sm font-bold text-[#1e3a8a] transition hover:border-[#1e3a8a] hover:bg-blue-50"><MessageMark /> Commander sur WhatsApp</a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-slate-600"><span className="flex items-center gap-2"><Truck aria-hidden="true" className="size-4 text-[#1e3a8a]" /> Livraison offerte à Dakar</span><span className="flex items-center gap-2"><ShieldCheck aria-hidden="true" className="size-4 text-[#1e3a8a]" /> Paiement flexible</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-[660px] lg:max-w-none">
            <div className="absolute inset-8 rounded-full bg-[#dce7ff] blur-3xl" />
            <div className="relative aspect-[1.2/1] overflow-hidden rounded-[30px] sm:rounded-[38px]">
              <Image src="/schoolbox-hero.png" alt="Sac à dos et fournitures scolaires pour une rentrée bien préparée" fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-contain" unoptimized />
            </div>
            <div className="absolute bottom-4 left-0 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-xl sm:bottom-8 sm:left-1"><span className="flex size-10 items-center justify-center rounded-xl bg-[#fff2c8] text-[#1e3a8a]"><PackageCheck aria-hidden="true" className="size-5" /></span><span><span className="block text-xs font-extrabold text-[#1e3a8a]">La rentrée en toute sérénité</span><span className="mt-0.5 block text-[10px] text-slate-500">Des packs pensés pour chaque niveau</span></span></div>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 -z-10 size-48 rounded-full bg-[#fbbf24]/20 blur-2xl" />
      </section>

      <section id="kits" className="scroll-mt-24 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-11 max-w-2xl text-center sm:mb-14"><span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#1e3a8a]">Nos packs scolaires</span><h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#1e3a8a] sm:text-4xl">Un kit adapté à chaque classe</h2><p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">Les fournitures essentielles réunies dans un pack pratique. Choisissez le niveau, on s’occupe du reste.</p></div>
          <BagShelf onAdd={addCustomKit} />
          {products.length > 0 ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">{products.map((product) => <ProductCard key={product.id} product={product} onAdd={addProduct} />)}</div> : <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center"><p className="font-bold text-[#1e3a8a]">Les kits seront bientôt disponibles.</p><p className="mt-2 text-sm text-slate-500">Écrivez-nous sur WhatsApp pour connaître les disponibilités.</p></div>}
        </div>
      </section>

      <CustomKitBuilder onAdd={addCustomKit} />

      <section id="livraison" className="scroll-mt-24 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-11 text-center"><span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#1e3a8a]">Simple comme bonjour</span><h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#1e3a8a] sm:text-4xl">Comment ça marche ?</h2><p className="mt-3 text-sm text-slate-600 sm:text-base">De votre sélection à la livraison, on vous accompagne à chaque étape.</p></div>
          <div className="grid gap-5 md:grid-cols-3">{steps.map(({ icon: Icon, title, text }, index) => <article key={title} className="relative rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-8"><span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#f5f8ff] text-[#1e3a8a]"><Icon aria-hidden="true" className="size-6" /></span><span className="mt-4 inline-block rounded-full bg-[#fff2c8] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#1e3a8a]">Étape 0{index + 1}</span><h3 className="mt-3 text-lg font-extrabold text-[#1e3a8a]">{title}</h3><p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-600">{text}</p></article>)}</div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl bg-[#f6f8fc] px-5 py-4 text-sm font-semibold text-slate-600"><span className="flex items-center gap-2"><Clock3 aria-hidden="true" className="size-4 text-[#1e3a8a]" /> Livraison en 24h à Dakar</span><span className="flex items-center gap-2"><MapPin aria-hidden="true" className="size-4 text-[#1e3a8a]" /> Dakar et banlieue</span><span className="flex items-center gap-2"><Truck aria-hidden="true" className="size-4 text-[#1e3a8a]" /> Livraison gratuite</span></div>
        </div>
      </section>

      <section className="bg-[#f5f8ff] py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-[#1e3a8a] shadow-sm"><Heart aria-hidden="true" className="size-5 text-amber-400" /></span>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-[#1e3a8a]">Avis des familles</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#1e3a8a] sm:text-4xl">Votre expérience compte.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">Les premiers avis vérifiés seront publiés après les livraisons. Vous avez déjà commandé ? Partagez votre retour avec notre équipe.</p>
          <a href={whatsappHref('Bonjour SCHOOL BOX SENEGAL, je souhaite partager mon avis sur ma commande.')} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#1e3a8a]/15 bg-white px-5 py-3.5 text-sm font-bold text-[#1e3a8a] transition hover:border-[#1e3a8a] hover:bg-blue-50"><MessageMark /> Donner mon avis sur WhatsApp</a>
        </div>
      </section>

      <section className="bg-[#1e3a8a] px-4 py-14 text-white sm:px-6 sm:py-16 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"><div><span className="inline-flex items-center gap-2 text-xs font-bold text-blue-100"><MapPin aria-hidden="true" className="size-3.5" /> Dakar, Sénégal</span><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">La rentrée, c’est déjà dans le sac.</h2><p className="mt-2 text-sm text-blue-100">Choisissez votre kit et commandez en toute simplicité.</p></div><a href="#kits" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#fbbf24] px-6 py-4 text-sm font-extrabold text-[#1e3a8a] transition hover:bg-amber-300">Choisir un kit <ArrowRight aria-hidden="true" className="size-4" /></a></div></section>

      <footer className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_0.8fr_0.9fr] lg:px-8"><div><BrandMark /><p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">Tout pour la rentrée, sans vous déplacer. Des kits scolaires pratiques préparés pour les familles de Dakar.</p><a className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#1e3a8a]" href={whatsappHref('Bonjour SCHOOL BOX SENEGAL, je souhaite en savoir plus.')} target="_blank" rel="noopener noreferrer"><MessageMark /> WhatsApp · 78 168 01 45</a></div><div><h3 className="text-sm font-extrabold text-[#1e3a8a]">La boutique</h3><div className="mt-4 flex flex-col gap-3 text-sm text-slate-600"><a href="#kits" className="hover:text-[#1e3a8a]">Nos kits scolaires</a><a href="#sur-mesure" className="hover:text-[#1e3a8a]">Créer un kit sur mesure</a><a href="#livraison" className="hover:text-[#1e3a8a]">Livraison & paiement</a></div></div><div><h3 className="text-sm font-extrabold text-[#1e3a8a]">Livraison & contact</h3><div className="mt-4 flex flex-col gap-3 text-sm text-slate-600"><span className="flex items-center gap-2"><MapPin aria-hidden="true" className="size-4 text-[#1e3a8a]" /> Dakar et banlieue</span><span className="flex items-center gap-2"><Clock3 aria-hidden="true" className="size-4 text-[#1e3a8a]" /> Livraison en 24h</span><span className="flex items-center gap-2"><MessageMark /> Wave & Orange Money · 78 168 01 45</span></div></div></div>
        <div className="border-t border-slate-100 px-4 py-5 text-center text-xs text-slate-500">© {new Date().getFullYear()} SCHOOL BOX SENEGAL · Fait avec soin à Dakar</div>
      </footer>
      <a aria-label="Nous écrire sur WhatsApp" href={whatsappHref('Bonjour SCHOOL BOX SENEGAL, je souhaite en savoir plus sur vos kits scolaires.')} target="_blank" rel="noopener noreferrer" className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#1e3a8a] text-white shadow-xl shadow-blue-900/25 transition hover:scale-105"><MessageMark /></a>
      {cartOpen && <CartDrawer entries={cartEntries} products={products} details={details} setDetails={setDetails} onClose={() => setCartOpen(false)} onQuantity={setQuantity} onRemove={removeEntry} total={total} />}
    </main>
  )
}

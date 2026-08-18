import { UsedTractorDrive, UsedTractorStatus } from "@prisma/client";
import { FilePdf } from "@phosphor-icons/react/ssr";
import ProductMediaGallery from "@/components/product/detail/ProductMediaGallery";
import QuoteButton from "@/components/product/QuoteButton";
import QuoteForm from "@/components/product/QuoteForm";
import JsonLd from "@/components/seo/JsonLd";
import {
  usedTractorGallery,
  usedTractorLabel,
  type PublicUsedTractor,
} from "@/lib/used-tractors";
import { usedTractorBreadcrumbJsonLd, usedTractorJsonLd } from "@/lib/seo";
import { productBody, productContainer, productEyebrow, productSection, productTitle } from "@/components/product/detail/product-shell";

function driveLabel(drive: UsedTractorDrive | null) {
  if (drive === UsedTractorDrive.FOUR_WD) return "4x4";
  if (drive === UsedTractorDrive.TWO_WD) return "4x2";
  return null;
}

function statusBadge(status: UsedTractorStatus) {
  if (status === UsedTractorStatus.SOLD) return "E SHITUR";
  if (status === UsedTractorStatus.RESERVED) return "E REZERVUAR";
  return null;
}

export default function UsedTractorDetail({ item }: { item: PublicUsedTractor }) {
  const label = usedTractorLabel(item);
  const images = usedTractorGallery(item);
  const badge = statusBadge(item.status);
  const sold = item.status === UsedTractorStatus.SOLD;
  const specs = Object.entries(item.specs);
  const facts = [
    { label: "Viti", value: item.year ? String(item.year) : null },
    { label: "Orë pune", value: item.hours != null ? item.hours.toLocaleString("sq-AL") : null },
    { label: "Fuqia", value: item.horsePower != null ? `${item.horsePower} HP` : null },
    { label: "Tërheqja", value: driveLabel(item.drive) },
    { label: "Kabinë", value: item.hasCabin ? "Kabinë" : "ROPS" },
    { label: "Karburanti", value: item.fuelType },
    { label: "Transmisioni", value: item.transmission },
    { label: "Vendndodhja", value: item.location },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));

  return (
    <>
      <JsonLd data={usedTractorJsonLd(item)} />
      <JsonLd data={usedTractorBreadcrumbJsonLd(item)} />

      <section className="border-b border-ink/[0.08] bg-ivory pt-24 pb-10 md:pt-28 md:pb-14">
        <div className={`${productContainer} grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:gap-12`}>
          <ProductMediaGallery images={images} alt={`${label} i përdorur`} heroImageMode="COVER" layout="hero" />
          <div className="flex flex-col">
            <p className={productEyebrow}>Traktor i përdorur</p>
            {badge ? (
              <p className="mt-3 inline-flex w-fit bg-ink px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase text-white">
                {badge}
              </p>
            ) : null}
            <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[0.95] tracking-tight">
              {item.brand} {item.model}
            </h1>
            {item.shortDescription ? <p className="mt-4 text-base leading-relaxed text-ink/60">{item.shortDescription}</p> : null}
            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-ink/10 py-5">
              {facts.slice(0, 6).map((fact) => (
                <div key={fact.label}>
                  <dt className="text-[11px] font-semibold tracking-[0.12em] uppercase text-ink/40">{fact.label}</dt>
                  <dd className="mt-1 text-sm font-medium text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>
            {!sold ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <QuoteButton usedTractorId={item.id} productLabel={label} />
                <a href="#oferte" className="inline-flex items-center justify-center border border-ink/18 px-5 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase text-ink hover:border-tractor-red hover:text-tractor-red">
                  Formulari
                </a>
              </div>
            ) : (
              <p className="mt-6 text-sm text-ink/55">Ky traktor është shitur. Na kontaktoni për modele të tjera të disponueshme.</p>
            )}
          </div>
        </div>
      </section>

      {item.description ? (
        <section className={`${productSection} bg-warm-white`} aria-labelledby="used-desc">
          <div className={productContainer}>
            <p className={productEyebrow}>Përshkrimi</p>
            <h2 id="used-desc" className={`mt-3 ${productTitle}`}>
              Përshkrimi
            </h2>
            <p className={`mt-6 whitespace-pre-line ${productBody}`}>{item.description}</p>
          </div>
        </section>
      ) : null}

      {specs.length || facts.length ? (
        <section className={`${productSection} bg-ivory`} aria-labelledby="used-specs">
          <div className={productContainer}>
            <p className={productEyebrow}>Specifikimet</p>
            <h2 id="used-specs" className={`mt-3 ${productTitle}`}>
              Specifikimet
            </h2>
            <dl className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
              {facts.map((fact) => (
                <div key={fact.label} className="grid grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] gap-4 py-3 text-sm">
                  <dt className="text-ink/50">{fact.label}</dt>
                  <dd className="font-medium text-ink">{fact.value}</dd>
                </div>
              ))}
              {specs.map(([key, value]) => (
                <div key={key} className="grid grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] gap-4 py-3 text-sm">
                  <dt className="text-ink/50">{key}</dt>
                  <dd className="font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      {images.length > 1 ? (
        <section className={`${productSection} bg-warm-white`} aria-labelledby="used-gallery">
          <div className={productContainer}>
            <p className={productEyebrow}>Galeria</p>
            <h2 id="used-gallery" className={`mt-3 ${productTitle}`}>
              Galeria
            </h2>
            <div className="mt-8">
              <ProductMediaGallery images={images} alt={`${label} i përdorur`} heroImageMode="COVER" layout="section" />
            </div>
          </div>
        </section>
      ) : null}

      {item.technicalPdfUrl ? (
        <section className={`${productSection} bg-ivory`} aria-labelledby="used-pdf">
          <div className={productContainer}>
            <div className="flex flex-col gap-6 border border-ink/[0.08] bg-warm-white px-6 py-7 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <span className="mt-0.5 grid h-11 w-11 place-items-center border border-ink/10 text-tractor-red">
                  <FilePdf size={22} />
                </span>
                <div>
                  <h2 id="used-pdf" className="font-display text-2xl font-semibold tracking-tight">
                    Dokumentacion teknik
                  </h2>
                  <p className="mt-2 max-w-xl text-sm text-ink/60">Shikoni dokumentin teknik të këtij traktori të përdorur.</p>
                </div>
              </div>
              <a
                href={item.technicalPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-tractor-red px-5 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase text-white hover:bg-tractor-red-dark"
              >
                Shiko PDF-në
              </a>
            </div>
          </div>
        </section>
      ) : null}

      {!sold ? (
        <section className={`${productSection} bg-warm-white`} aria-labelledby="used-quote">
          <div className={productContainer}>
            <p className={productEyebrow}>Ofertë</p>
            <h2 id="used-quote" className={`mt-3 ${productTitle}`}>
              Kërko ofertë
            </h2>
            <div className="mt-8 max-w-xl">
              <QuoteForm usedTractorId={item.id} productLabel={label} />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

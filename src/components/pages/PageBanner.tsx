import PageHero from "@/components/pages/PageHero";
import PageIntro from "@/components/pages/PageIntro";
import { pageHasHeroMedia, type PublicPageHero } from "@/lib/page-cms";

export default function PageBanner({ page }: { page: PublicPageHero }) {
  return pageHasHeroMedia(page) ? <PageHero page={page} /> : <PageIntro page={page} />;
}

import { PrismaClient, Category, Theme } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type TractorSeed = {
  name: string;
  series: string;
  stage: string;
  horsePower: number;
  hasCabin: boolean;
  dealerPrice: number;
  retailPrice: number;
  isCampaign?: boolean;
  isNew?: boolean;
  description: string;
};

const ORCHARD = "Orchard Series (Bahçe Serisi)";
const ORCHARD_CABIN = "Orchard Series (Bahçe Serisi - Kabinli)";
const FIELD = "Field Series (Tarla Serisi)";
const FIELD_CABIN = "Field Series (Tarla Serisi - Kabinli)";

const orchardDesc =
  "Traktor kompakt Armatrack nga Seria Orchard, i projektuar për punë në kopshte dhe fusha me hapësira të kufizuara. Ndërtim i fortë, manovrim i lehtë dhe konsum efikas karburanti.";
const fieldDesc =
  "Traktor Armatrack nga Seria Field, i përshtatshëm për punë të rënda bujqësore në fusha të hapura. Fuqi, qëndrueshmëri dhe komoditet për përdorim intensiv gjatë gjithë sezonit.";

const tractors: TractorSeed[] = [
  {
    name: "514 T2 Rops",
    series: ORCHARD,
    stage: "Stage IIIA",
    horsePower: 50,
    hasCabin: false,
    dealerPrice: 16638.0,
    retailPrice: 18301.8,
    description: orchardDesc,
  },
  {
    name: "614 T2 Rops",
    series: ORCHARD,
    stage: "Stage IIIA",
    horsePower: 58,
    hasCabin: false,
    dealerPrice: 17525.36,
    retailPrice: 19277.9,
    description: orchardDesc,
  },
  {
    name: "804.4 Orchard Rops",
    series: ORCHARD,
    stage: "Stage IIIA",
    horsePower: 75.5,
    hasCabin: false,
    dealerPrice: 26731.72,
    retailPrice: 29404.89,
    description: orchardDesc,
  },
  {
    name: "804.4 Orchard Cabin",
    series: ORCHARD_CABIN,
    stage: "Stage IIIA",
    horsePower: 75.5,
    hasCabin: true,
    dealerPrice: 28284.6,
    retailPrice: 31113.06,
    description: orchardDesc,
  },
  {
    name: "514 T2 Rops (eCapra)",
    series: ORCHARD,
    stage: "Stage V",
    horsePower: 50,
    hasCabin: false,
    dealerPrice: 18079.96,
    retailPrice: 19887.96,
    isNew: true,
    description: orchardDesc + " Motor Stage V, teknologjia më e re e emetimeve.",
  },
  {
    name: "614 T2 Rops (ECapra)",
    series: ORCHARD,
    stage: "Stage V",
    horsePower: 58,
    hasCabin: false,
    dealerPrice: 18967.32,
    retailPrice: 20864.05,
    isNew: true,
    description: orchardDesc + " Motor Stage V, teknologjia më e re e emetimeve.",
  },
  {
    name: "514e Rops",
    series: FIELD,
    stage: "Stage IIIA",
    horsePower: 50,
    hasCabin: false,
    dealerPrice: 15750.0,
    retailPrice: 17325.0,
    isCampaign: true,
    description: fieldDesc,
  },
  {
    name: "614e Rops",
    series: FIELD,
    stage: "Stage IIIA",
    horsePower: 58,
    hasCabin: false,
    dealerPrice: 16065.0,
    retailPrice: 17671.5,
    isCampaign: true,
    description: fieldDesc,
  },
  {
    name: "604e Cabin",
    series: FIELD_CABIN,
    stage: "Stage IIIA",
    horsePower: 58,
    hasCabin: true,
    dealerPrice: 19005.0,
    retailPrice: 20905.5,
    isCampaign: true,
    description: fieldDesc,
  },
  {
    name: "704e Cabin",
    series: FIELD_CABIN,
    stage: "Stage IIIA",
    horsePower: 73,
    hasCabin: true,
    dealerPrice: 22785.0,
    retailPrice: 25063.5,
    isCampaign: true,
    description: fieldDesc,
  },
  {
    name: "584e Cabin",
    series: FIELD_CABIN,
    stage: "Stage IIIA",
    horsePower: 58,
    hasCabin: true,
    dealerPrice: 19078.24,
    retailPrice: 20986.06,
    description: fieldDesc,
  },
  {
    name: "854e Cabin",
    series: FIELD_CABIN,
    stage: "Stage IIIA",
    horsePower: 83.6,
    hasCabin: true,
    dealerPrice: 25289.76,
    retailPrice: 27818.74,
    description: fieldDesc,
  },
  {
    name: "854 Lux Cabin",
    series: FIELD_CABIN,
    stage: "Stage IIIA",
    horsePower: 83.6,
    hasCabin: true,
    dealerPrice: 26953.56,
    retailPrice: 29648.92,
    description: fieldDesc + " Versioni Lux me pajisje shtesë komoditeti.",
  },
  {
    name: "1054e Cabin",
    series: FIELD_CABIN,
    stage: "Stage IIIA",
    horsePower: 102,
    hasCabin: true,
    dealerPrice: 27840.92,
    retailPrice: 30625.01,
    description: fieldDesc,
  },
  {
    name: "1104 Lux Cabin",
    series: FIELD_CABIN,
    stage: "Stage IIIA",
    horsePower: 110,
    hasCabin: true,
    dealerPrice: 39043.84,
    retailPrice: 42948.22,
    description: fieldDesc + " Versioni Lux me pajisje shtesë komoditeti, modeli më i fuqishëm i gamës.",
  },
];

type EquipmentSeed = {
  name: string;
  dealerPrice: number;
  retailPrice: number;
  specs: Record<string, string>;
  description: string;
};

const equipmentSeries = "Makineri Bujqësore (Ataşman)";

const equipment: EquipmentSeed[] = [
  {
    name: "11 Lİ Kazayağı Kültivatör",
    dealerPrice: 846.42,
    retailPrice: 931.07,
    specs: { "Numri i rreshtave": "11", Tipi: "Kultivator me këmbë patë" },
    description:
      "Kultivator me 11 rreshta, ideal për përgatitjen dhe pastrimin e tokës nga barërat e këqija ndërmjet rreshtave.",
  },
  {
    name: "7 Lİ Çizel",
    dealerPrice: 1194.51,
    retailPrice: 1313.96,
    specs: { "Numri i rreshtave": "7", Tipi: "Çizel" },
    description: "Çizel me 7 rreshta për thyerjen e shtresës së ngjeshur të tokës dhe përmirësimin e drenazhimit.",
  },
  {
    name: "100 CM Rotovatör",
    dealerPrice: 1411.79,
    retailPrice: 1552.96,
    specs: { "Gjerësia e punës": "100 cm" },
    description: "Rotovator 100 cm për përgatitjen e shtratit të mbjelljes në kopshte dhe parcela të vogla.",
  },
  {
    name: "165 Çayır Biçme",
    dealerPrice: 1586.91,
    retailPrice: 1745.6,
    specs: { "Gjerësia e punës": "165 cm", Tipi: "Kositëse livadhi" },
    description: "Kositëse livadhi me gjerësi pune 165 cm, e përshtatshme për kositjen e barit dhe kullotave.",
  },
  {
    name: "210 CM Rotovatör",
    dealerPrice: 2283.07,
    retailPrice: 2511.38,
    specs: { "Gjerësia e punës": "210 cm" },
    description: "Rotovator me gjerësi pune 210 cm për përgatitje toke në sipërfaqe më të mëdha.",
  },
  {
    name: "500 LT Liftli Gübre Serpme",
    dealerPrice: 868.04,
    retailPrice: 954.85,
    specs: { Kapaciteti: "500 L", Tipi: "Spërkatëse plehu me montim hidraulik" },
    description: "Spërkatëse plehu me kapacitet 500 litra, montim me sistem hidraulik (lift) në traktor.",
  },
  {
    name: "800 LT Liftli Gübre Serpme",
    dealerPrice: 933.98,
    retailPrice: 1027.38,
    specs: { Kapaciteti: "800 L", Tipi: "Spërkatëse plehu me montim hidraulik" },
    description: "Spërkatëse plehu me kapacitet 800 litra, montim me sistem hidraulik (lift) në traktor.",
  },
  {
    name: "400 LT İlaçlama",
    dealerPrice: 912.36,
    retailPrice: 1003.6,
    specs: { Kapaciteti: "400 L", Tipi: "Spërkatëse ilaçesh" },
    description: "Spërkatëse ilaçesh bujqësore me kapacitet 400 litra për mbrojtjen e kulturave.",
  },
  {
    name: "600 LT İlaçlama",
    dealerPrice: 1086.41,
    retailPrice: 1195.05,
    specs: { Kapaciteti: "600 L", Tipi: "Spërkatëse ilaçesh" },
    description: "Spërkatëse ilaçesh bujqësore me kapacitet 600 litra për mbrojtjen e kulturave.",
  },
  {
    name: "20 Lİ Asılır Tip Diskaro",
    dealerPrice: 1890.67,
    retailPrice: 2079.74,
    specs: { "Numri i diskeve": "20", Tipi: "Diskore e varur" },
    description: "Diskore e varur me 20 disqe për përgatitjen e thellë të tokës para mbjelljes.",
  },
  {
    name: "220 CM Tesviye Küreği",
    dealerPrice: 715.62,
    retailPrice: 787.18,
    specs: { "Gjerësia e punës": "220 cm", Tipi: "Lopatë nivelimi" },
    description: "Lopatë nivelimi me gjerësi 220 cm për rrafshimin e sipërfaqes së tokës.",
  },
  {
    name: "4 Lü 11 No Pulluk",
    dealerPrice: 2064.71,
    retailPrice: 2271.18,
    specs: { "Numri i trupave": "4", Madhësia: "Nr. 11" },
    description: "Plug me 4 trupa, madhësia Nr. 11, për lërimin e thellë të tokës.",
  },
  {
    name: "4 Lü 12 No Pulluk",
    dealerPrice: 2260.37,
    retailPrice: 2486.41,
    specs: { "Numri i trupave": "4", Madhësia: "Nr. 12" },
    description: "Plug me 4 trupa, madhësia Nr. 12, për lërimin e thellë të tokës.",
  },
  {
    name: "3 Lü 12 No Pulluk",
    dealerPrice: 1673.39,
    retailPrice: 1840.73,
    specs: { "Numri i trupave": "3", Madhësia: "Nr. 12" },
    description: "Plug me 3 trupa, madhësia Nr. 12, i përshtatshëm për traktorë me fuqi më të vogël.",
  },
];

async function main() {
  console.log("Seeding traktorë...");
  for (const p of tractors) {
    const fullTitle = `${p.name} ${p.stage} - ${p.series} ${p.horsePower} HP`;
    await prisma.product.upsert({
      where: { slug: slugify(fullTitle) },
      update: {},
      create: {
        category: Category.TRACTOR,
        theme: Theme.TRACTOR_THEME,
        series: p.series,
        name: p.name,
        fullTitle,
        stage: p.stage,
        horsePower: p.horsePower,
        hasCabin: p.hasCabin,
        dealerPrice: p.dealerPrice,
        retailPrice: p.retailPrice,
        isCampaign: p.isCampaign ?? false,
        isNew: p.isNew ?? false,
        showPriceOnSite: false,
        description: p.description,
        specs: {
          Seria: p.series,
          Stage: p.stage,
          "Fuqia (HP)": String(p.horsePower),
          Kabina: p.hasCabin ? "Po" : "Jo (Rops)",
        },
        images: [],
        slug: slugify(fullTitle),
      },
    });
  }

  console.log("Seeding makineri bujqësore...");
  for (const p of equipment) {
    const fullTitle = `${p.name} - ${equipmentSeries}`;
    await prisma.product.upsert({
      where: { slug: slugify(fullTitle) },
      update: {},
      create: {
        category: Category.EQUIPMENT,
        theme: Theme.EQUIPMENT_THEME,
        series: equipmentSeries,
        name: p.name,
        fullTitle,
        hasCabin: false,
        dealerPrice: p.dealerPrice,
        retailPrice: p.retailPrice,
        isCampaign: false,
        isNew: false,
        showPriceOnSite: false,
        description: p.description,
        specs: p.specs,
        images: [],
        slug: slugify(fullTitle),
        horsePower: null,
      },
    });
  }

  const count = await prisma.product.count();
  console.log(`U shtuan ${count} produkte gjithsej.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

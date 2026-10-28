require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../src/config/prisma");

const DEMO_MARKER = "Référence démo :";
const DEMO_CLIENT_EMAIL = "client.demo@atlaspara.test";
const DEMO_CLIENT_PHONE = "0611887701";

function requiredSeedPassword(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variable manquante pour le seed local : ${name}. Définissez-la dans Backend/.env. Le fichier n'est pas versionné.`,
    );
  }
  return value;
}

function demoAccounts() {
  return [
    {
      email: "admin@admin.com",
      password: requiredSeedPassword("SEED_ADMIN_PASSWORD"),
      role: "ADMIN",
      firstName: "Admin",
      lastName: "AtlasPara",
      preserve: true,
    },
    {
      email: "livreur@atlaspara.com",
      password: requiredSeedPassword("SEED_LIVREUR_PASSWORD"),
      role: "LIVREUR",
      firstName: "Youssef",
      lastName: "Amrani",
      preserve: true,
    },
    {
      email: DEMO_CLIENT_EMAIL,
      password: requiredSeedPassword("SEED_CLIENT_PASSWORD"),
      role: "CLIENT",
      firstName: "Client",
      lastName: "Démo",
      phone: DEMO_CLIENT_PHONE,
      preserve: false,
    },
  ];
}

const categories = [
  {
    name: "Soins du visage",
    description:
      "Sérums, crèmes et protections solaires pour le visage. Catalogue de démonstration AtlasPara.",
    image: "/home/cat-visage.jpg",
  },
  {
    name: "Soins capillaires",
    description:
      "Shampooings, masques et soins des cheveux. Catalogue de démonstration AtlasPara.",
    image: "/home/cat-cheveux.jpg",
  },
  {
    name: "Hygiène quotidienne",
    description:
      "Gels douche, soins dentaires et savons. Catalogue de démonstration AtlasPara.",
    image: "/home/cat-hygiene.jpg",
  },
  {
    name: "Vitamines et compléments",
    description:
      "Vitamines, minéraux et compléments alimentaires. Catalogue de démonstration AtlasPara.",
    image: "/home/cat-vitalite.jpg",
  },
  {
    name: "Bébé et maman",
    description:
      "Soins de toilette et change pour bébé. Catalogue de démonstration AtlasPara.",
    image: "/home/cat-bebe.jpg",
  },
  {
    name: "Matériel médical",
    description:
      "Compresses, antiseptiques et petit matériel. Catalogue de démonstration AtlasPara.",
    image: "/home/story-pharmacy.jpg",
  },
];

const products = [
  ["AP-DEMO-01", "Soins du visage", "Fluide solaire invisible SPF50+", "Fluide très haute protection pour le visage, fini invisible, adapté aux peaux sensibles.", "189.00", 42, true, "/home/cat-visage.jpg"],
  ["AP-DEMO-02", "Soins du visage", "Crème hydratante aux céramides", "Crème riche qui restaure la barrière cutanée des peaux sèches et tiraille.", "169.00", 36, true, "/home/cat-corps.jpg"],
  ["AP-DEMO-03", "Soins du visage", "Sérum correcteur anti-imperfections", "Sérum léger qui affine le grain de peau et atténue les marques.", "215.00", 28, true, "/home/hero-shelf.jpg"],
  ["AP-DEMO-04", "Soins du visage", "Eau micellaire peaux sensibles", "Eau micellaire sans parfum pour démaquiller visage et yeux.", "79.00", 50, false, "/home/cat-hygiene.jpg"],
  ["AP-DEMO-05", "Soins du visage", "Contour des yeux apaisant", "Soin contour des yeux qui réduit les poches et les sensations de fatigue.", "145.00", 22, false, "/home/cat-visage.jpg"],
  ["AP-DEMO-06", "Soins capillaires", "Shampooing fortifiant anti-chute", "Shampooing qui densifie les cheveux fragilisés et limite la chute.", "129.00", 40, true, "/home/cat-cheveux.jpg"],
  ["AP-DEMO-07", "Soins capillaires", "Après-shampooing réparateur", "Démêle et nourrit les longueurs abîmées sans les alourdir.", "119.00", 34, false, "/home/cat-cheveux.jpg"],
  ["AP-DEMO-08", "Soins capillaires", "Sérum capillaire à la kératine", "Sérum sans rinçage pour lisser les pointes sèches.", "165.00", 26, false, "/home/cat-cheveux.jpg"],
  ["AP-DEMO-09", "Soins capillaires", "Masque nourrissant cheveux secs", "Masque hebdomadaire pour cheveux secs et ternes.", "98.00", 30, false, "/home/cat-cheveux.jpg"],
  ["AP-DEMO-10", "Hygiène quotidienne", "Gel douche surgras", "Gel douche sans savon, adapté au lavage quotidien des peaux sèches.", "62.00", 48, false, "/home/cat-hygiene.jpg"],
  ["AP-DEMO-11", "Hygiène quotidienne", "Dentifrice fraîcheur 75 ml", "Dentifrice au fluor pour l'hygiène quotidienne des dents et des gencives.", "39.00", 60, false, "/home/cat-hygiene.jpg"],
  ["AP-DEMO-12", "Hygiène quotidienne", "Déodorant soin 24 h", "Déodorant sans alcool, protection de la journée. Article de démonstration en rupture.", "54.00", 0, false, "/home/cat-hygiene.jpg"],
  ["AP-DEMO-13", "Hygiène quotidienne", "Savon dermatologique", "Pain surgras pour le visage et le corps, sans parfum.", "28.00", 70, false, "/home/cat-hygiene.jpg"],
  ["AP-DEMO-14", "Vitamines et compléments", "Vitamine D3 1000 UI", "Complément de vitamine D3, 60 gélules, pour l'apport quotidien.", "89.00", 44, true, "/home/cat-vitalite.jpg"],
  ["AP-DEMO-15", "Vitamines et compléments", "Magnésium marin", "Magnésium marin en comprimés pour réduire la fatigue passagère.", "95.00", 38, false, "/home/cat-vitalite.jpg"],
  ["AP-DEMO-16", "Vitamines et compléments", "Multivitamines adulte", "Complexe de vitamines et minéraux pour un apport quotidien.", "110.00", 33, true, "/home/cat-vitalite.jpg"],
  ["AP-DEMO-17", "Vitamines et compléments", "Oméga-3 capsules", "Huile de poisson concentrée en oméga-3, 60 capsules.", "132.00", 27, false, "/home/cat-vitalite.jpg"],
  ["AP-DEMO-18", "Bébé et maman", "Liniment oléo-calcaire", "Liniment pour le change, à base d'huile et d'eau de chaux.", "48.00", 41, false, "/home/cat-bebe.jpg"],
  ["AP-DEMO-19", "Bébé et maman", "Crème pour le change", "Crème protectrice qui isole la peau du bébé lors du change.", "56.00", 39, true, "/home/cat-bebe.jpg"],
  ["AP-DEMO-20", "Bébé et maman", "Gel lavant bébé", "Gel lavant corps et cheveux, formule douce sans savon.", "72.00", 35, false, "/home/cat-bebe.jpg"],
  ["AP-DEMO-21", "Bébé et maman", "Sérum physiologique unidoses", "Sérum physiologique stérile pour le lavage des yeux et du nez.", "34.00", 55, false, "/home/cat-bebe.jpg"],
  ["AP-DEMO-22", "Matériel médical", "Compresses stériles", "Boîte de compresses stériles non tissées pour les petits soins.", "18.00", 80, false, "/home/story-pharmacy.jpg"],
  ["AP-DEMO-23", "Matériel médical", "Thermomètre digital", "Thermomètre digital à embout souple, affichage en degrés Celsius.", "45.00", 24, true, "/home/story-pharmacy.jpg"],
  ["AP-DEMO-24", "Matériel médical", "Masques chirurgicaux", "Boîte de 50 masques à usage unique. Article de démonstration.", "29.00", 64, false, "/home/cat-hygiene.jpg"],
  ["AP-DEMO-25", "Matériel médical", "Solution antiseptique", "Solution aqueuse pour l'antisepsie des petites plaies superficielles.", "41.00", 31, false, "/home/story-pharmacy.jpg"],
];

const orders = [
  { code: "DEMO-CMD-ATTENTE", sku: "AP-DEMO-01", status: "PENDING", payment: "PENDING" },
  { code: "DEMO-CMD-VALIDEE", sku: "AP-DEMO-14", status: "CONFIRMED", payment: "PENDING" },
  { code: "DEMO-CMD-ASSIGNEE", sku: "AP-DEMO-06", status: "ASSIGNED", payment: "PENDING", delivery: "ASSIGNED" },
  { code: "DEMO-CMD-ENCOURS", sku: "AP-DEMO-19", status: "OUT_FOR_DELIVERY", payment: "PENDING", delivery: "OUT_FOR_DELIVERY" },
  { code: "DEMO-CMD-LIVREE", sku: "AP-DEMO-23", status: "DELIVERED", payment: "PAID", delivery: "DELIVERED" },
];

const money = (value) => Math.round(Number(value) * 100) / 100;

async function ensureAccount(account) {
  const existing = await prisma.user.findUnique({ where: { email: account.email } });

  if (existing) {
    if (account.preserve || existing.role !== account.role) {
      console.log(`Compte conservé : ${account.email} (${existing.role})`);
      return existing;
    }

    const passwordHash = await bcrypt.hash(account.password, 10);
    const phoneTaken = account.phone
      ? await prisma.user.findFirst({
          where: { phone: account.phone, NOT: { id: existing.id } },
          select: { id: true },
        })
      : null;

    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        firstName: account.firstName,
        lastName: account.lastName,
        passwordHash,
        role: account.role,
        emailVerified: true,
        isActive: true,
        ...(account.phone && !phoneTaken && !existing.phone ? { phone: account.phone } : {}),
      },
    });
    console.log(`Compte démo mis à jour : ${account.email}`);
    return updated;
  }

  const phoneTaken = account.phone
    ? await prisma.user.findFirst({ where: { phone: account.phone }, select: { id: true } })
    : null;
  const passwordHash = await bcrypt.hash(account.password, 10);
  const created = await prisma.user.create({
    data: {
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      passwordHash,
      role: account.role,
      emailVerified: true,
      isActive: true,
      ...(account.phone && !phoneTaken ? { phone: account.phone } : {}),
    },
  });
  console.log(`Compte créé : ${account.email} (${account.role})`);
  return created;
}

async function ensureCategory(category) {
  const existing = await prisma.category.findFirst({
    where: { name: { equals: category.name, mode: "insensitive" } },
  });
  if (existing) {
    if ((existing.description || "").includes("Catalogue de démonstration AtlasPara")) {
      return prisma.category.update({
        where: { id: existing.id },
        data: { description: category.description },
      });
    }
    console.log(`Catégorie conservée : ${existing.name}`);
    return existing;
  }
  return prisma.category.create({
    data: { name: category.name, description: category.description },
  });
}

async function ensureBrand() {
  const name = "Catalogue démo AtlasPara";
  const existing = await prisma.brand.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  if (existing) return existing;
  return prisma.brand.create({
    data: { name, description: "Marque réservée aux produits de démonstration AtlasPara." },
  });
}

async function ensureProduct(item, categoryId, brandId) {
  const [sku, , name, text, price, stock, featured, image] = item;
  const description = `${text}\n\n${DEMO_MARKER} ${sku}`;
  const existing = await prisma.product.findFirst({
    where: { description: { contains: sku } },
  });

  if (existing && !(existing.description || "").includes(DEMO_MARKER)) {
    console.log(`Produit conservé : ${existing.name}`);
    return existing;
  }

  const data = {
    name,
    description,
    price,
    imageUrl: image,
    isActive: true,
    isFeatured: featured,
    categoryId,
    brandId,
  };

  if (existing) {
    return prisma.product.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.product.create({
    data: { ...data, stockQuantity: stock },
  });
}

async function ensureOrder(spec, clientId, livreurId, catalog) {
  const existing = await prisma.invoice.findUnique({ where: { invoiceNumber: spec.code } });
  if (existing) {
    console.log(`Commande démo conservée : ${spec.code}`);
    return;
  }

  const product = catalog.get(spec.sku);
  if (!product || product.stockQuantity < 1) {
    console.log(`Commande démo ignorée, stock insuffisant : ${spec.code}`);
    return;
  }

  const createdAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const unitPrice = money(product.price);
  const address = `DEMO ${spec.code} — 12 rue de la Démonstration, Casablanca`;

  await prisma.$transaction(async (tx) => {
    const updated = await tx.product.updateMany({
      where: { id: product.id, stockQuantity: { gte: 1 } },
      data: { stockQuantity: { decrement: 1 } },
    });
    if (updated.count !== 1) return;

    const order = await tx.order.create({
      data: {
        userId: clientId,
        status: spec.status,
        totalAmount: unitPrice.toFixed(2),
        deliveryAddress: address,
        orderDate: createdAt,
        createdAt,
        items: {
          create: {
            productId: product.id,
            quantity: 1,
            unitPrice: unitPrice.toFixed(2),
            subtotal: unitPrice.toFixed(2),
          },
        },
        payments: {
          create: {
            amount: unitPrice.toFixed(2),
            method: "CASH_ON_DELIVERY",
            status: spec.payment,
            ...(spec.payment === "PAID" ? { paymentDate: createdAt } : {}),
          },
        },
        invoice: {
          create: {
            invoiceNumber: spec.code,
            totalAmount: unitPrice.toFixed(2),
            status: "ISSUED",
            issueDate: createdAt,
          },
        },
        ...(spec.delivery
          ? {
              delivery: {
                create: {
                  deliveryAddress: address,
                  status: spec.delivery,
                  livreurId,
                  assignedAt: createdAt,
                  deliveryNotes: "Livraison de démonstration AtlasPara. Ne pas traiter comme une course réelle.",
                  ...(spec.delivery === "DELIVERED" ? { deliveredAt: createdAt } : {}),
                },
              },
            }
          : {}),
      },
    });
    console.log(`Commande démo créée : ${spec.code} (${order.status})`);
  });
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Le seed de démonstration est désactivé lorsque NODE_ENV=production.");
  }

  const accounts = demoAccounts();
  const users = {};
  for (const account of accounts) {
    users[account.role] = await ensureAccount(account);
  }

  const categoryRows = {};
  for (const category of categories) {
    categoryRows[category.name] = await ensureCategory(category);
  }

  const brand = await ensureBrand();
  const catalog = new Map();

  for (const item of products) {
    const category = categoryRows[item[1]];
    const product = await ensureProduct(item, category.id, brand.id);
    catalog.set(item[0], product);
  }

  const client = users.CLIENT;
  const livreur = users.LIVREUR;
  if (client?.role === "CLIENT" && livreur?.role === "LIVREUR") {
    for (const spec of orders) {
      await ensureOrder(spec, client.id, livreur.id, catalog);
      const fresh = catalog.get(spec.sku);
      if (fresh) {
        catalog.set(spec.sku, {
          ...fresh,
          stockQuantity: Math.max(0, fresh.stockQuantity - 1),
        });
      }
    }
  } else {
    console.log("Commandes démo ignorées : client ou livreur de démonstration indisponible.");
  }

  console.log("Seed de démonstration terminé.");
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

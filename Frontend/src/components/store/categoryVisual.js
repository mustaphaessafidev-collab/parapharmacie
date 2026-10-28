const visuals = [
  { test: /visage|peau|beauté|beaute/, image: "/home/cat-visage.jpg" },
  { test: /cheveu|capillaire/, image: "/home/cat-cheveux.jpg" },
  { test: /bébé|bebe|maman/, image: "/home/cat-bebe.jpg" },
  { test: /vitamin|complément|complement|vital/, image: "/home/cat-vitalite.jpg" },
  { test: /hygiène|hygiene/, image: "/home/cat-hygiene.jpg" },
  { test: /médical|medical|matériel|materiel/, image: "/home/story-pharmacy.jpg" },
  { test: /bio|bien/, image: "/home/cat-bio.jpg" },
  { test: /corps/, image: "/home/cat-corps.jpg" },
];

export const categoryImage = (name = "") =>
  visuals.find((item) => item.test.test(name.toLowerCase()))?.image || "/home/cat-beaute.jpg";

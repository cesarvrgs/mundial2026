export interface Team {
  name: string;
  code: string; // ISO 2-letter, or custom like gb-sct, gb-eng
}

export type PotId = 'C' | 'B' | 'A';

export interface Pot {
  id: PotId;
  name: string;
  subtitle: string;
  color: string; // Tailwind accent color
  teams: Team[];
}

export interface Assignment {
  participant: string;
  bomboC?: Team;
  bomboB?: Team;
  bomboA?: Team;
}

export const PARTICIPANTS: string[] = [
  "Asael",
  "César",
  "Cochevis",
  "Dulce",
  "Elías",
  "Enrique",
  "Fer",
  "Francisco",
  "Lilia",
  "Livia",
  "Omar",
  "Patricio",
  "Paulina",
  "Sandra",
  "Taquito",
  "Ximena"
];

export const POT_C_TEAMS: Team[] = [
  { name: "Escocia", code: "gb-sct" },
  { name: "Australia", code: "au" },
  { name: "Irán", code: "ir" },
  { name: "Túnez", code: "tn" },
  { name: "RD Congo", code: "cd" },
  { name: "Cabo Verde", code: "cv" },
  { name: "Irak", code: "iq" },
  { name: "Jordania", code: "jo" },
  { name: "Nueva Zelanda", code: "nz" },
  { name: "Panamá", code: "pa" },
  { name: "Catar", code: "qa" },
  { name: "Arabia Saudita", code: "sa" },
  { name: "Sudáfrica", code: "za" },
  { name: "Uzbekistán", code: "uz" },
  { name: "Curazao", code: "cw" },
  { name: "Haití", code: "ht" }
];

export const POT_B_TEAMS: Team[] = [
  { name: "Ecuador", code: "ec" },
  { name: "México", code: "mx" },
  { name: "Senegal", code: "sn" },
  { name: "Suecia", code: "se" },
  { name: "Suiza", code: "ch" },
  { name: "Turquía", code: "tr" },
  { name: "Austria", code: "at" },
  { name: "Canadá", code: "ca" },
  { name: "Paraguay", code: "py" },
  { name: "República Checa", code: "cz" },
  { name: "Costa de Marfil", code: "ci" },
  { name: "Argelia", code: "dz" },
  { name: "Bosnia y Herzegovina", code: "ba" },
  { name: "Egipto", code: "eg" },
  { name: "Ghana", code: "gh" },
  { name: "Corea del Sur", code: "kr" }
];

export const POT_A_TEAMS: Team[] = [
  { name: "Francia", code: "fr" },
  { name: "España", code: "es" },
  { name: "Inglaterra", code: "gb-eng" },
  { name: "Argentina", code: "ar" },
  { name: "Brasil", code: "br" },
  { name: "Portugal", code: "pt" },
  { name: "Alemania", code: "de" },
  { name: "Países Bajos", code: "nl" },
  { name: "Noruega", code: "no" },
  { name: "Bélgica", code: "be" },
  { name: "Colombia", code: "co" },
  { name: "Marruecos", code: "ma" },
  { name: "Estados Unidos", code: "us" },
  { name: "Japón", code: "jp" },
  { name: "Uruguay", code: "uy" },
  { name: "Croacia", code: "hr" }
];

export const POTS: Record<PotId, Pot> = {
  C: {
    id: 'C',
    name: "Bombo C — Sorpresas",
    subtitle: "Sorpresas",
    color: "#08C84C", // Verde intenso
    teams: POT_C_TEAMS
  },
  B: {
    id: 'B',
    name: "Bombo B — Intermedios",
    subtitle: "Intermedios",
    color: "#3D56F5", // Azul eléctrico
    teams: POT_B_TEAMS
  },
  A: {
    id: 'A',
    name: "Bombo A — Favoritos",
    subtitle: "Favoritos",
    color: "#E10000", // Rojo intenso
    teams: POT_A_TEAMS
  }
};

export function getFlagUrl(code: string): string {
  // Use flagcdn.com
  return `https://flagcdn.com/w160/${code.toLowerCase()}.png`;
}

// Deterministic PRNG with a string seed (such as selected date) to match results across clients
export function seedRandom(seedStr: string) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle using our seeded PRNG instance
export function shuffleDeterministic<T>(array: T[], r: () => number): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}


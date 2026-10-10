export type WorkspaceType = "cafe" | "study" | "coworking" | "meeting-room";
export type PriceUnit = "person" | "desk" | "room";
export type PaymentMethod = "free" | "pay-online" | "pay-at-venue";

export type Workspace = {
  slug: string;
  name: string;
  type: WorkspaceType;
  neighborhood: string;
  city: "Madrid";
  address: string;
  image: string;
  description: string;
  pricePerHour: number;
  priceUnit: PriceUnit;
  capacity: number;
  sampleScore: number;
  recommendedRank: number;
  openingHours: { open: string; close: string };
  openDays: number[];
  amenities: {
    wifi: boolean;
    outlets: boolean;
    quiet: boolean;
    foodDrinks: boolean;
    indoor: boolean;
    outdoor: boolean;
    meetingRooms: boolean;
  };
  facilities: string[];
  paymentMethods: PaymentMethod[];
  purchaseCondition?: string;
  cancellation: string;
};

export const workspaceTypeLabels: Record<WorkspaceType, string> = {
  cafe: "Café workspace",
  study: "Study space",
  coworking: "Coworking desk",
  "meeting-room": "Meeting room",
};

export const priceUnitLabels: Record<PriceUnit, string> = {
  person: "per person",
  desk: "per desk",
  room: "per room",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  free: "Free booking",
  "pay-online": "Pay Online (simulated)",
  "pay-at-venue": "Pay at venue",
};

export const workspaces: Workspace[] = [
  {
    slug: "luz-de-barrio-cafe",
    name: "Luz de Barrio Café",
    type: "cafe",
    neighborhood: "Malasaña",
    city: "Madrid",
    address: "Calle de la Brisa, 18, Malasaña, Madrid",
    image: "/images/hero-workspace.jpg",
    description:
      "A warm neighbourhood café with generous communal tables, reliable Wi-Fi and plenty of daylight for a relaxed working session.",
    pricePerHour: 2.5,
    priceUnit: "person",
    capacity: 10,
    sampleScore: 4.7,
    recommendedRank: 1,
    openingHours: { open: "08:30", close: "20:00" },
    openDays: [1, 2, 3, 4, 5, 6, 0],
    amenities: { wifi: true, outlets: true, quiet: false, foodDrinks: true, indoor: true, outdoor: false, meetingRooms: false },
    facilities: ["Fast Wi-Fi", "Power outlets", "Communal tables", "Coffee and food", "Natural light"],
    paymentMethods: ["pay-at-venue"],
    purchaseCondition: "One drink purchase is required during the reservation.",
    cancellation: "Free cancellation up to 2 hours before the start time.",
  },
  {
    slug: "nido-study-club",
    name: "Nido Study Club",
    type: "study",
    neighborhood: "Moncloa",
    city: "Madrid",
    address: "Pasaje del Olmo, 7, Moncloa, Madrid",
    image: "/images/quiet-study.jpg",
    description:
      "A focused study room with individual desks, desk lamps and acoustic treatment close to Madrid's university district.",
    pricePerHour: 3,
    priceUnit: "person",
    capacity: 18,
    sampleScore: 4.8,
    recommendedRank: 2,
    openingHours: { open: "08:00", close: "22:00" },
    openDays: [1, 2, 3, 4, 5, 6, 0],
    amenities: { wifi: true, outlets: true, quiet: true, foodDrinks: false, indoor: true, outdoor: false, meetingRooms: false },
    facilities: ["Silent zone", "Individual desk", "Task light", "Power outlets", "Fast Wi-Fi"],
    paymentMethods: ["pay-online", "pay-at-venue"],
    cancellation: "Free cancellation up to 4 hours before the start time.",
  },
  {
    slug: "sala-cibeles",
    name: "Sala Cibeles",
    type: "meeting-room",
    neighborhood: "Centro",
    city: "Madrid",
    address: "Calle del Horizonte, 12, Centro, Madrid",
    image: "/images/meeting-room.jpg",
    description:
      "A private six-person meeting room with a large display, video-call equipment and a calm professional setting.",
    pricePerHour: 12,
    priceUnit: "room",
    capacity: 6,
    sampleScore: 4.6,
    recommendedRank: 4,
    openingHours: { open: "09:00", close: "20:00" },
    openDays: [1, 2, 3, 4, 5, 6],
    amenities: { wifi: true, outlets: true, quiet: true, foodDrinks: false, indoor: true, outdoor: false, meetingRooms: true },
    facilities: ["Private room", "Display screen", "Video calls", "Whiteboard", "Fast Wi-Fi"],
    paymentMethods: ["pay-online"],
    cancellation: "Free cancellation up to 12 hours before the start time.",
  },
  {
    slug: "patio-norte-cafe",
    name: "Patio Norte Café",
    type: "cafe",
    neighborhood: "Chamberí",
    city: "Madrid",
    address: "Patio de la Luz, 4, Chamberí, Madrid",
    image: "/images/patio-norte.jpg",
    description:
      "A plant-filled covered courtyard with spacious tables and free reservations for customers purchasing a drink.",
    pricePerHour: 0,
    priceUnit: "person",
    capacity: 8,
    sampleScore: 4.5,
    recommendedRank: 5,
    openingHours: { open: "09:00", close: "19:30" },
    openDays: [1, 2, 3, 4, 5, 6, 0],
    amenities: { wifi: true, outlets: true, quiet: false, foodDrinks: true, indoor: true, outdoor: true, meetingRooms: false },
    facilities: ["Free reservation", "Wi-Fi", "Power outlets", "Covered courtyard", "Coffee and food"],
    paymentMethods: ["free"],
    purchaseCondition: "A minimum purchase of one drink per person is required.",
    cancellation: "Cancel at any time before arrival.",
  },
  {
    slug: "mesa-clara-lavapies",
    name: "Mesa Clara Lavapiés",
    type: "cafe",
    neighborhood: "Lavapiés",
    city: "Madrid",
    address: "Calle del Jazmín, 21, Lavapiés, Madrid",
    image: "/images/mesa-clara.jpg",
    description:
      "An informal community café with large shared tables, good natural light and free work-friendly reservations.",
    pricePerHour: 0,
    priceUnit: "person",
    capacity: 6,
    sampleScore: 4.4,
    recommendedRank: 7,
    openingHours: { open: "10:00", close: "18:30" },
    openDays: [1, 2, 3, 4, 5, 6],
    amenities: { wifi: true, outlets: false, quiet: false, foodDrinks: true, indoor: true, outdoor: false, meetingRooms: false },
    facilities: ["Free reservation", "Wi-Fi", "Communal tables", "Coffee and snacks", "Natural light"],
    paymentMethods: ["free"],
    purchaseCondition: "No minimum purchase is required. Food and drinks are available optionally.",
    cancellation: "Cancel at any time before arrival.",
  },
  {
    slug: "retiro-reading-room",
    name: "Retiro Reading Room",
    type: "study",
    neighborhood: "Retiro",
    city: "Madrid",
    address: "Galería del Parque, 9, Retiro, Madrid",
    image: "/images/retiro-reading-room.jpg",
    description:
      "A premium silent reading room with acoustic desk dividers, personal lamps and a carefully controlled study environment.",
    pricePerHour: 5,
    priceUnit: "person",
    capacity: 24,
    sampleScore: 4.9,
    recommendedRank: 3,
    openingHours: { open: "08:00", close: "21:30" },
    openDays: [1, 2, 3, 4, 5, 6, 0],
    amenities: { wifi: true, outlets: true, quiet: true, foodDrinks: false, indoor: true, outdoor: false, meetingRooms: false },
    facilities: ["Silent room", "Acoustic divider", "Personal lamp", "Fast Wi-Fi", "Secure lockers"],
    paymentMethods: ["pay-online"],
    cancellation: "Free cancellation up to 6 hours before the start time.",
  },
  {
    slug: "prisma-coworking",
    name: "Prisma Coworking",
    type: "coworking",
    neighborhood: "Salamanca",
    city: "Madrid",
    address: "Calle Prisma, 15, Salamanca, Madrid",
    image: "/images/prisma-coworking.jpg",
    description:
      "A bright shared-office floor with ergonomic desks, acoustic panels and everything needed for a productive workday.",
    pricePerHour: 6,
    priceUnit: "desk",
    capacity: 30,
    sampleScore: 4.7,
    recommendedRank: 6,
    openingHours: { open: "08:00", close: "22:00" },
    openDays: [1, 2, 3, 4, 5, 6],
    amenities: { wifi: true, outlets: true, quiet: true, foodDrinks: true, indoor: true, outdoor: false, meetingRooms: true },
    facilities: ["Ergonomic desk", "High-speed Wi-Fi", "Phone booths", "Kitchen", "Meeting rooms"],
    paymentMethods: ["pay-online", "pay-at-venue"],
    cancellation: "Free cancellation up to 6 hours before the start time.",
  },
  {
    slug: "nave-sur-cowork",
    name: "Nave Sur Cowork",
    type: "coworking",
    neighborhood: "Arganzuela",
    city: "Madrid",
    address: "Travesía del Taller, 6, Arganzuela, Madrid",
    image: "/images/nave-sur.jpg",
    description:
      "A practical converted workshop offering affordable shared desks, strong Wi-Fi and plenty of space for longer sessions.",
    pricePerHour: 4.5,
    priceUnit: "desk",
    capacity: 36,
    sampleScore: 4.5,
    recommendedRank: 8,
    openingHours: { open: "08:30", close: "21:00" },
    openDays: [1, 2, 3, 4, 5, 6],
    amenities: { wifi: true, outlets: true, quiet: false, foodDrinks: true, indoor: true, outdoor: false, meetingRooms: true },
    facilities: ["Shared desk", "Fast Wi-Fi", "Power strip", "Kitchen", "Bike storage"],
    paymentMethods: ["pay-online", "pay-at-venue"],
    cancellation: "Free cancellation up to 4 hours before the start time.",
  },
  {
    slug: "circulo-serrano",
    name: "Círculo Serrano",
    type: "coworking",
    neighborhood: "Salamanca",
    city: "Madrid",
    address: "Paseo del Círculo, 28, Salamanca, Madrid",
    image: "/images/circulo-serrano.jpg",
    description:
      "A refined quiet coworking lounge with spacious walnut desks, supportive seating and discreet professional facilities.",
    pricePerHour: 9,
    priceUnit: "desk",
    capacity: 20,
    sampleScore: 4.8,
    recommendedRank: 9,
    openingHours: { open: "08:00", close: "21:00" },
    openDays: [1, 2, 3, 4, 5, 6],
    amenities: { wifi: true, outlets: true, quiet: true, foodDrinks: true, indoor: true, outdoor: false, meetingRooms: true },
    facilities: ["Premium desk", "High-speed Wi-Fi", "Quiet lounge", "Coffee station", "Phone booths"],
    paymentMethods: ["pay-online"],
    cancellation: "Free cancellation up to 12 hours before the start time.",
  },
  {
    slug: "atocha-team-room",
    name: "Atocha Team Room",
    type: "meeting-room",
    neighborhood: "Atocha",
    city: "Madrid",
    address: "Plaza del Andén, 3, Atocha, Madrid",
    image: "/images/atocha-team-room.jpg",
    description:
      "A compact private room for focused team sessions, equipped with a display, whiteboard and reliable video calling.",
    pricePerHour: 10,
    priceUnit: "room",
    capacity: 4,
    sampleScore: 4.6,
    recommendedRank: 10,
    openingHours: { open: "09:00", close: "20:00" },
    openDays: [1, 2, 3, 4, 5],
    amenities: { wifi: true, outlets: true, quiet: true, foodDrinks: false, indoor: true, outdoor: false, meetingRooms: true },
    facilities: ["Private room", "Display screen", "Whiteboard", "Video calls", "Air conditioning"],
    paymentMethods: ["pay-online", "pay-at-venue"],
    cancellation: "Free cancellation up to 8 hours before the start time.",
  },
];

export function getWorkspace(slug: string) {
  return workspaces.find((workspace) => workspace.slug === slug);
}

export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
  }).format(price);
}

function minutesFromTime(value: string) {
  const [hours = 0, minutes = 0] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isWorkspaceAvailable(
  workspace: Workspace,
  criteria: { date?: string; time?: string; duration?: number; people?: number },
) {
  const people = Math.max(1, criteria.people ?? 1);
  if (people > workspace.capacity) return false;

  if (criteria.date) {
    const selectedDate = new Date(`${criteria.date}T12:00:00`);
    if (Number.isNaN(selectedDate.getTime()) || !workspace.openDays.includes(selectedDate.getDay())) return false;
  }

  if (criteria.time) {
    const start = minutesFromTime(criteria.time);
    const end = start + Math.max(1, criteria.duration ?? 1) * 60;
    if (start < minutesFromTime(workspace.openingHours.open) || end > minutesFromTime(workspace.openingHours.close)) return false;
  }

  return true;
}

export function calculateTotal(workspace: Workspace, duration: number, people: number) {
  const quantity = workspace.priceUnit === "room" ? 1 : Math.max(1, people);
  return workspace.pricePerHour * Math.max(1, duration) * quantity;
}

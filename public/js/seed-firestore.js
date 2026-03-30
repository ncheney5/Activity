/**
 * One-time seed: run from seed.html while signed in as admin.
 */
import { db } from "../firebase.js";
import {
  collection,
  doc,
  writeBatch,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const SEED_ACTIVITIES = [
  {
    id: "kayaking",
    title: "Kayaking at Rexburg Rapids",
    location: "South Boat Launch",
    date: "2026-03-22",
    time: "10:00",
    displayTime: "Saturday, March 22 · 10:00 AM",
    image: "images/kayaking.webp",
    goingCount: 0,
    cost: 0,
    description:
      "Join us for a relaxing kayak trip down the river. All skill levels welcome — equipment provided. Meet at the south boat launch.",
    active: true
  },
  {
    id: "bonfire",
    title: "Bonfire & S'mores Night",
    location: "Outdoor Fire Pit",
    date: "2026-03-28",
    time: "19:30",
    displayTime: "Friday, March 28 · 7:30 PM",
    image: "images/Bonfire.webp",
    goingCount: 0,
    cost: 0,
    description:
      "Gather around the fire for s'mores, music, and good company. Bring a blanket and your best campfire stories!",
    active: true
  },
  {
    id: "volleyball",
    title: "Beach Volleyball Tournament",
    location: "Campus Sand Courts",
    date: "2026-03-30",
    time: "14:00",
    displayTime: "Sunday, March 30 · 2:00 PM",
    image: "images/volleyball.webp",
    goingCount: 0,
    cost: 0,
    description:
      "Form a team of 4 and compete in our annual sand volleyball tournament. Prizes for 1st and 2nd place. Sign up before Friday!",
    active: true
  },
  {
    id: "hiking",
    title: "Mesa Falls Hike",
    location: "Mesa Falls Scenic Byway",
    date: "2026-04-05",
    time: "09:00",
    displayTime: "Saturday, April 5 · 9:00 AM",
    image: "images/hiking.webp",
    goingCount: 0,
    cost: 0,
    description:
      "Explore one of Idaho's most stunning waterfalls on this scenic group hike. Moderate difficulty, about 2 miles round trip. Carpooling available — meet at the Smith Park parking lot.",
    active: true
  },
  {
    id: "gamenight",
    title: "Board Game Night",
    location: "Manwaring Center Room 3",
    date: "2026-04-09",
    time: "18:00",
    displayTime: "Wednesday, April 9 · 6:00 PM",
    image: "images/gamenight.webp",
    goingCount: 0,
    cost: 0,
    description:
      "Come hang out for a chill evening of board games, card games, and snacks. We'll have classics and new games — bring a favorite if you have one!",
    active: true
  },
  {
    id: "stargazing",
    title: "Stargazing at Teton Dam",
    location: "Teton Dam Site",
    date: "2026-04-11",
    time: "21:30",
    displayTime: "Friday, April 11 · 9:30 PM",
    image: "images/stargazing.webp",
    goingCount: 0,
    cost: 0,
    description:
      "Head out to one of the darkest skies near Rexburg for a night of stargazing. Telescopes provided. Dress warm and bring a blanket or lawn chair!",
    active: true
  }
];

export async function seedActivities(adminUid) {
  const existing = await getDocs(collection(db, "activities"));
  if (!existing.empty) {
    return { skipped: true, message: "Activities collection is not empty. Clear it first or skip seeding." };
  }
  const batch = writeBatch(db);
  for (const a of SEED_ACTIVITIES) {
    const { id, ...data } = a;
    const ref = doc(db, "activities", id);
    batch.set(ref, {
      ...data,
      createdBy: adminUid,
      seeded: true,
      createdAt: serverTimestamp()
    });
  }
  await batch.commit();
  return { skipped: false, message: "Seed complete." };
}

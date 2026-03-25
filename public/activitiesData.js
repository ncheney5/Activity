/**
 * activitiesData.js
 * ─────────────────────────────────────────────────────────────────
 * TEMPORARY local data store — mirrors the Firestore document schema.
 *
 * When the backend team has Firestore ready, replace getActivities()
 * and getActivityById() with Firestore SDK calls. All page code that
 * consumes these functions stays exactly the same.
 *
 * Firestore collection this maps to:  "activities"
 * Document ID:                         activity.id  (e.g. "kayaking")
 * ─────────────────────────────────────────────────────────────────
 */

const _activities = [
    {
        id: "kayaking",
        title: "Kayaking at Rexburg Rapids",
        location: "South Boat Launch",
        time: "Saturday, March 22 · 10:00 AM",
        image: "images/kayaking.webp",
        goingCount: 0,   // FIRESTORE SWAP: read from document field "goingCount"
        description:
            "Join us for a relaxing kayak trip down the river. All skill levels welcome — " +
            "equipment provided. Meet at the south boat launch.",
    },
    {
        id: "bonfire",
        title: "Bonfire & S'mores Night",
        location: "Outdoor Fire Pit",
        time: "Friday, March 28 · 7:30 PM",
        image: "images/Bonfire.webp",
        goingCount: 0,   // FIRESTORE SWAP: read from document field "goingCount"
        description:
            "Gather around the fire for s'mores, music, and good company. " +
            "Bring a blanket and your best campfire stories!",
    },
    {
        id: "volleyball",
        title: "Beach Volleyball Tournament",
        location: "Campus Sand Courts",
        time: "Sunday, March 30 · 2:00 PM",
        image: "images/volleyball.webp",
        goingCount: 0,   // FIRESTORE SWAP: read from document field "goingCount"
        description:
            "Form a team of 4 and compete in our annual sand volleyball tournament. " +
            "Prizes for 1st and 2nd place. Sign up before Friday!",
    },
    {
        id: "hiking",
        title: "Mesa Falls Hike",
        location: "Mesa Falls Scenic Byway",
        time: "Saturday, April 5 · 9:00 AM",
        image: "images/hiking.webp",        // TODO: add image
        goingCount: 0,   // FIRESTORE SWAP: read from document field "goingCount"
        description:
            "Explore one of Idaho's most stunning waterfalls on this scenic group hike. " +
            "Moderate difficulty, about 2 miles round trip. Carpooling available — meet at the Smith Park parking lot.",
    },
    {
        id: "gamenight",
        title: "Board Game Night",
        location: "Manwaring Center Room 3",
        time: "Wednesday, April 9 · 6:00 PM",
        image: "images/gamenight.webp",     // TODO: add image
        goingCount: 0,   // FIRESTORE SWAP: read from document field "goingCount"
        description:
            "Come hang out for a chill evening of board games, card games, and snacks. " +
            "We'll have classics and new games — bring a favorite if you have one!",
    },
    {
        id: "stargazing",
        title: "Stargazing at Teton Dam",
        location: "Teton Dam Site",
        time: "Friday, April 11 · 9:30 PM",
        image: "images/stargazing.webp",    // TODO: add image
        goingCount: 0,   // FIRESTORE SWAP: read from document field "goingCount"
        description:
            "Head out to one of the darkest skies near Rexburg for a night of stargazing. " +
            "Telescopes provided. Dress warm and bring a blanket or lawn chair!",
    },
];

/**
 * Returns a Promise that resolves to all activities.
 *
 * FIRESTORE SWAP:
 *   const snapshot = await getDocs(collection(db, "activities"));
 *   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
 */
function getActivities() {
    return Promise.resolve(_activities);
}

/**
 * Returns a Promise that resolves to a single activity by its ID,
 * or null if not found.
 *
 * FIRESTORE SWAP:
 *   const ref = doc(db, "activities", id);
 *   const snap = await getDoc(ref);
 *   return snap.exists() ? { id: snap.id, ...snap.data() } : null;
 */
function getActivityById(id) {
    const found = _activities.find((a) => a.id === id) || null;
    return Promise.resolve(found);
}
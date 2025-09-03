// ESM-friendly admin SDK imports (v13+)
import { initializeApp, applicationDefault, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import fs from "node:fs";

// Initialize Admin SDK once (works with ts-node --esm)
function initAdmin() {
  if (getApps().length) return; // already initialized (HMR / reruns)

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (credPath && fs.existsSync(credPath)) {
    // Use explicit service account JSON file via env var
    const sa = JSON.parse(fs.readFileSync(credPath, "utf8"));
    initializeApp({ credential: cert(sa) });
    console.log("Initialized firebase-admin with service account file.");
  } else {
    // Fallback to ADC (gcloud auth or environment on CI)
    initializeApp({ credential: applicationDefault() });
    console.log("Initialized firebase-admin with applicationDefault credentials.");
  }
}

async function main() {
  initAdmin();
  const auth = getAuth();
  const db = getFirestore();

  let nextPageToken: string | undefined = undefined;
  let totalProcessed = 0;

  do {
    const list = await auth.listUsers(1000, nextPageToken);
    for (const u of list.users) {
      const uid = u.uid;

      const userRef = db.collection("users").doc(uid);
      const walletRef = userRef.collection("wallet").doc("default");

      const userSnap = await userRef.get();
      if (!userSnap.exists) {
        await userRef.set(
          {
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            email: u.email ?? null,
            providerIds: u.providerData.map((p) => p.providerId),
          },
          { merge: true }
        );
        console.log(`+ created user doc for ${uid}`);
      } else {
        await userRef.set({ updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      }

      const walletSnap = await walletRef.get();
      if (!walletSnap.exists) {
        await walletRef.set({
          userId: uid,
          hoursBalance: 0,
          filamentGrams: 0,
          updatedAt: FieldValue.serverTimestamp(),
        });
        console.log(`+ created wallet for ${uid}`);
      } else {
        console.log(`• wallet exists for ${uid}`);
      }

      totalProcessed++;
    }
    nextPageToken = list.pageToken;
  } while (nextPageToken);

  console.log(`Done. Processed ${totalProcessed} users.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

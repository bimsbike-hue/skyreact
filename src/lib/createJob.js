// src/lib/createJob.ts
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
export async function createPrintJob(input) {
    const ref = await addDoc(collection(db, "printJobs"), {
        userId: input.userId,
        status: "submitted",
        createdAt: serverTimestamp(),
        model: input.model,
        settings: {
            preset: input.settings.preset,
            layerHeightMm: input.settings.layerHeightMm ?? null,
            infillPercent: input.settings.infillPercent ?? null,
            wallLoops: input.settings.wallLoops ?? null,
            filamentType: input.settings.filamentType ?? null,
            color: input.settings.color ?? null,
        },
        quantity: input.quantity,
        notes: input.notes ?? "",
    });
    return ref.id;
}

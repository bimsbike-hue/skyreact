// src/lib/createJob.ts
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type UserVisibleSettings = {
  preset: "default" | "custom";
  layerHeightMm?: number;
  infillPercent?: number;
  wallLoops?: number;
  filamentType?: string;
  color?: string;
};

export type NewPrintJobInput = {
  userId: string;
  model: {
    filename: string;
    storagePath: string;
    publicUrl: string;
  };
  settings: UserVisibleSettings;
  quantity: number;
  notes?: string;
};

export async function createPrintJob(input: NewPrintJobInput) {
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

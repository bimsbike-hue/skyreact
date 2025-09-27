// src/lib/upload.ts
// Supabase Storage uploader for print models (STL/3MF/STEP/OBJ,...)
import { supabase, SUPABASE_BUCKET } from "./supabaseClient";
const ALLOWED_EXTS = ["stl", "3mf", "obj", "step", "stp"];
function sanitizeFilename(name) {
    // keep extension as-is; sanitize the basename
    const parts = name.split(".");
    const ext = parts.length > 1 ? parts.pop() : "";
    const base = parts.join(".").replace(/[^\w.\-]+/g, "_");
    return { base, ext: ext.toLowerCase() };
}
/**
 * Upload a 3D model to Supabase Storage and return metadata for Firestore.
 * The bucket must already exist in Supabase (“Storage → + New bucket”).
 */
export async function uploadModelToSupabase(file, uid) {
    const { base, ext } = sanitizeFilename(file.name);
    if (!ALLOWED_EXTS.includes(ext)) {
        throw new Error(`File type ".${ext}" is not allowed. Allowed: ${ALLOWED_EXTS.join(", ")}`);
    }
    // Path inside bucket: <uid>/<timestamp>-<sanitizedName>.<ext>
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const objectPath = `${uid}/${ts}-${base}.${ext}`;
    const bucket = SUPABASE_BUCKET;
    // Upload (bucket must exist; anon key cannot create buckets)
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(objectPath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "application/octet-stream",
    });
    if (error) {
        // Provide a friendly message if the bucket is missing
        if (String(error.message).toLowerCase().includes("bucket not found")) {
            throw new Error(`Supabase bucket "${bucket}" not found. Create it in Supabase → Storage (name must match VITE_SUPABASE_BUCKET), then retry.`);
        }
        throw error;
    }
    // Public URL (simplest). If your bucket is private, switch to signed URLs.
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
    const publicUrl = pub?.publicUrl;
    if (!publicUrl) {
        throw new Error(`Upload succeeded but no public URL. Make sure the "${bucket}" bucket is set to Public, or implement signed URLs.`);
    }
    return {
        filename: file.name,
        storagePath: `${bucket}/${data.path}`,
        publicUrl,
    };
}

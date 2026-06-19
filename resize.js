console.log("🚀 Starting resize job...");

// ---- ENV ----
const accessKey = process.env.R2_ACCESS_KEY_ID;
const secretKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;
const key = process.env.R2_KEY;

// ---- DEBUG OUTPUT ----
console.log("R2_KEY:", key);
console.log("R2_BUCKET:", bucket);

// ---- VALIDATION ----
if (!accessKey || !secretKey || !bucket) {
  throw new Error("Missing R2 credentials (ACCESS_KEY / SECRET_KEY / BUCKET)");
}

if (!key) {
  throw new Error("Missing R2_KEY");
}

// ---- PLACEHOLDER FLOW (SAFE TEST) ----
async function run() {
  console.log(`📦 Would process file: ${key}`);
  console.log(`🪣 Bucket: ${bucket}`);

  // HERE you will later:
  // 1. download from R2
  // 2. resize image
  // 3. upload back

  console.log("✅ Script finished successfully (test mode)");
}

run();

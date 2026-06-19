const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

const sharp = require("sharp");

// ---- ENV ----
const accessKey = process.env.R2_ACCESS_KEY_ID;
const secretKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;
const key = process.env.R2_KEY;

if (!accessKey || !secretKey || !bucket || !key) {
  throw new Error("Missing required environment variables");
}

// ---- R2 CLIENT ----
const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT, // optional but recommended
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
});

// ---- STREAM TO BUFFER ----
async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

async function run() {
  console.log("📥 Downloading from R2:", key);

  // 1. DOWNLOAD
  const file = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  const inputBuffer = await streamToBuffer(file.Body);

  console.log("🧠 Resizing image...");

  // 2. RESIZE
  const outputBuffer = await sharp(inputBuffer)
    .resize(800) // width 800px (auto height)
    .jpeg({ quality: 80 })
    .toBuffer();

  const newKey = `resized-${key}`;

  console.log("📤 Uploading as:", newKey);

  // 3. UPLOAD BACK TO R2
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: newKey,
      Body: outputBuffer,
      ContentType: "image/jpeg",
    })
  );

  console.log("✅ Done! Uploaded:", newKey);
}

run().catch((err) => {
  console.error("❌ ERROR:", err);
  process.exit(1);
});

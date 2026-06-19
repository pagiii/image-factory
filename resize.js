const sharp = require("sharp");
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

const bucket = process.env.R2_BUCKET;
const key = process.env.IMAGE_KEY;

if (!key) {
  throw new Error("Missing R2_KEY");
}

if (!bucket) {
  throw new Error("Missing R2_BUCKET");
}

console.log("Processing file:", key);

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function run() {
  console.log("📦 Downloading image...");

  const original = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );

  const buffer = await streamToBuffer(original.Body);

  const sizes = [300, 600];

  for (const size of sizes) {
    console.log("✂️ resizing:", size);

    const resized = await sharp(buffer).resize(size).toBuffer();

    const newKey = key.replace(".jpg", `_${size}.jpg`);

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: newKey,
        Body: resized,
        ContentType: "image/jpeg",
      }),
    );

    console.log("✅ saved:", newKey);
  }

  console.log("🎉 DONE");
}

run();

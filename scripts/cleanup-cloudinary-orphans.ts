import "@/env-config";
import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

const RESOURCES_PAGE_SIZE = 500;
const VALID_PREFIX = /^[\w-./ *!]+$/;

function parseArgs() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const prefixArg = args.find((arg) => arg.startsWith("--prefix="));
  const prefix = prefixArg?.split("=")[1];
  if (prefix !== undefined && !VALID_PREFIX.test(prefix)) {
    throw new Error(`Invalid prefix: ${prefix}`);
  }
  return { apply, prefix };
}

async function listCloudinaryPublicIds(prefix?: string) {
  const publicIds = new Set<string>();
  let nextCursor: string | undefined;

  do {
    const response = await cloudinary.api.resources({
      type: "upload",
      max_results: RESOURCES_PAGE_SIZE,
      prefix: prefix || undefined,
      next_cursor: nextCursor,
    });
    for (const resource of response.resources) {
      publicIds.add(resource.public_id);
    }
    nextCursor = response.next_cursor;
  } while (nextCursor);

  return publicIds;
}

async function main() {
  const { apply, prefix } = parseArgs();

  const dbImages = await prisma.coffeeTruckImage.findMany({
    select: { publicId: true },
  });
  const dbPublicIds = new Set(dbImages.map((img) => img.publicId));

  const cloudinaryPublicIds = await listCloudinaryPublicIds(prefix);
  const orphans = [...cloudinaryPublicIds].filter((id) => !dbPublicIds.has(id));

  console.log(`Cloudinary assets: ${cloudinaryPublicIds.size}`);
  console.log(`DB references: ${dbPublicIds.size}`);
  console.log(`Orphaned: ${orphans.length}`);

  if (orphans.length === 0) {
    return;
  }

  for (const orphan of orphans) {
    console.log(`  ${orphan}`);
  }

  if (!apply) {
    console.log("\nDry run. Re-run with --apply to destroy these assets.");
    return;
  }

  let destroyed = 0;
  const failed: string[] = [];
  for (const orphan of orphans) {
    try {
      await cloudinary.uploader.destroy(orphan);
      destroyed += 1;
    } catch (error) {
      console.error(`Failed to destroy ${orphan}:`, error);
      failed.push(orphan);
    }
  }

  console.log(`\nDestroyed: ${destroyed}/${orphans.length}`);
  if (failed.length > 0) {
    console.log("Failed (re-run the script to retry):");
    for (const orphan of failed) {
      console.log(`  ${orphan}`);
    }
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

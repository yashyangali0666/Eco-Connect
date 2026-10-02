import prisma from '../prisma';

export async function generateRequestNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `EC-${currentYear}-`;

  // Count existing requests for the current year
  const count = await prisma.pickupRequest.count({
    where: {
      requestNumber: {
        startsWith: prefix,
      },
    },
  });

  const nextNumber = (count + 1).toString().padStart(6, '0');
  let candidate = `${prefix}${nextNumber}`;

  // Double check uniqueness just in case
  const exists = await prisma.pickupRequest.findUnique({
    where: { requestNumber: candidate },
  });

  if (exists) {
    // If collision somehow occurs, append timestamp suffix
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    candidate = `${prefix}${nextNumber.slice(0, 2)}${randomSuffix}`;
  }

  return candidate;
}

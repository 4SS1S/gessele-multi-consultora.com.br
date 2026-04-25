import { prisma } from "@/lib/prisma";

export async function createNotification(data: {
  userId: string;
  title: string;
  body: string;
  href?: string;
}) {
  await prisma.notification.create({ data });
}

export async function createManyNotifications(
  notifications: {
    userId: string;
    title: string;
    body: string;
    href?: string;
  }[],
) {
  if (notifications.length === 0) return;
  await prisma.notification.createMany({ data: notifications });
}

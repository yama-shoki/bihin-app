"use client";

import { notifications } from "@mantine/notifications";

type NotificationOptions = {
  title?: string;
  autoClose?: number | false;
};

export function showSuccessNotification(
  message: string,
  options?: NotificationOptions,
): void {
  notifications.show({
    title: options?.title,
    message,
    color: "green",
    autoClose: options?.autoClose ?? 4000,
  });
}

export function showErrorNotification(
  message: string,
  options?: NotificationOptions,
): void {
  notifications.show({
    title: options?.title,
    message,
    color: "red",
    autoClose: options?.autoClose ?? 6000,
  });
}

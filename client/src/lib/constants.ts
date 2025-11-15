import { Domain, ComplaintStatus, NotificationType } from "./types";

export const DOMAIN_LABELS: Record<Domain, string> = {
  WATER: "Water",
  MESS: "Mess",
  INTERNET: "Internet",
  CLEANING: "Cleaning",
  TRANSPORT: "Transport",
};

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  CREATED: "Created",
  REVIEWED: "Reviewed",
  ASSIGNED: "Assigned",
  WORK_IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  ARCHIVED: "Archived",
  CANCELED: "Canceled",
  DELETED: "Deleted",
};

export const STATUS_COLORS: Record<ComplaintStatus, string> = {
  CREATED: "status-created",
  REVIEWED: "status-reviewed",
  ASSIGNED: "status-assigned",
  WORK_IN_PROGRESS: "status-progress",
  RESOLVED: "status-resolved",
  ARCHIVED: "muted",
  CANCELED: "destructive",
  DELETED: "muted",
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  ALERT: "Alert",
  UPDATE: "Update",
  ANNOUNCEMENT: "Announcement",
};

export const STAFF_DOMAINS: Domain[] = ["MESS", "INTERNET", "CLEANING", "WATER", "TRANSPORT"];

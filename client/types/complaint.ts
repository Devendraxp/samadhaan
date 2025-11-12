// Types aligned to server response shape

export type ComplaintStatus =
  | "CREATED"
  | "REVIEWED"
  | "ASSIGNED"
  | "WORK_IN_PROGRESS"
  | "RESOLVED"
  | "ARCHIVED"
  | "CANCELED"
  | "DELETED";

export type ComplaintDomain =
  | "WATER"
  | "MESS"
  | "INTERNET"
  | "CLEANING"
  | "TRANSPORT"
  | string;

export type UserRole =
  | "STUDENT"
  | "ADMIN"
  | "MESS"
  | "INTERNET"
  | "CLEANING"
  | "WATER"
  | "TRANSPORT";

export interface UserRef {
  email: string;
  id: string;
  name: string;
  role: UserRole;
}

export interface Response {
  id: string;
  complaintId: string;
  content: string;
  mediaLink?: string | null;
  responderId: string;
  responder: UserRef;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

// Backward compatibility: keep existing name mapped to Response
export type ComplaintResponseItem = Response;

export interface Complaint {
  id: string;
  subject: string;
  description: string;
  mediaLink?: string | null;
  domain: ComplaintDomain;
  anonymous: boolean;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  complainer: UserRef;
  responses: Response[];
}
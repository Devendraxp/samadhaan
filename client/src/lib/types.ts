export type Role = 
  | "STUDENT" 
  | "ADMIN" 
  | "MESS" 
  | "INTERNET" 
  | "CLEANING" 
  | "WATER" 
  | "TRANSPORT";

export type Domain = 
  | "WATER" 
  | "MESS" 
  | "INTERNET" 
  | "CLEANING" 
  | "TRANSPORT";

export type ComplaintStatus = 
  | "CREATED" 
  | "REVIEWED" 
  | "ASSIGNED" 
  | "WORK_IN_PROGRESS" 
  | "RESOLVED" 
  | "ARCHIVED" 
  | "CANCELED" 
  | "DELETED";

export type NotificationType = 
  | "ALERT" 
  | "UPDATE" 
  | "ANNOUNCEMENT";

export type UserStatus = 
  | "ACTIVE" 
  | "VIEW_ONLY" 
  | "DEACTIVATED" 
  | "DELETED";

export interface UserRef {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface User extends UserRef {
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Complaint {
  id: string;
  subject: string;
  description: string;
  domain: Domain;
  status: ComplaintStatus;
  anonymous: boolean;
  mediaLink?: string;
  createdBy: UserRef;
  complainer?: {
    name?: string;
    email?: string;
    role?: Role;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Response {
  id: string;
  content: string;
  mediaLink?: string;
  isVisible: boolean;
  complaintId: string;
  responder: UserRef;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  domain?: Domain;
  type: NotificationType;
  mediaLink?: string;
  createdBy: UserRef;
  createdAt: string;
  updatedAt: string;
}

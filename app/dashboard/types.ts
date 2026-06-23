export interface Task {
  id: string;
  name: string;
  description: string | null;
  dueDate: string | Date | null;
  priority: string;
  status: string;
  userId: string;
  listId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Anniversary {
  id: string;
  name: string;
  description: string | null;
  date: string | Date;
  isImportant: boolean;
  reminderTime: string; // "12 AM" or "8 AM"
  userId: string;
  listId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface List {
  id: string;
  name: string;
  userId: string;
  tasks: Task[];
  anniversaries?: Anniversary[];
  type: string; // "regular" or "anniversary"
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  emailRemindersEnabled: boolean;
}

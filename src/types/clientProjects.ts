export type ClientProjectStatus = 'planning' | 'in_progress' | 'delayed' | 'completed' | 'on_hold';
export type ClientMilestoneStatus = 'completed' | 'in_progress' | 'blocked' | 'upcoming' | 'delayed';
export type ClientTaskStatus = 'todo' | 'in_progress' | 'blocked' | 'completed';
export type ClientApprovalStatus = 'pending' | 'approved' | 'changes_requested' | 'withdrawn';

export interface ClientProjectSummary {
  id: string;
  name: string;
  description: string;
  status: ClientProjectStatus;
  completionPercentage: number;
  originalDeadline: string;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
}
export interface ClientCompanyOverview {
  companyId: string;
  companyName: string;
  projects: ClientProjectSummary[];
  unreadNotificationCount: number;
  latestUpdateAt?: string;
}
export interface ClientProjectTimeline {
  startDate: string;
  originalDeadline: string;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
}
export interface ClientProjectMilestone {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  completedAt?: string;
  weight: number;
  completionPercentage: number;
  status: ClientMilestoneStatus;
  taskIds: string[];
}
export interface ClientProjectTask {
  id: string;
  milestoneId: string;
  title: string;
  status: ClientTaskStatus;
  dueDate?: string;
  dependencyIds: string[];
}
export interface ClientProjectProgressPoint {
  date: string;
  plannedPercentage?: number;
  actualPercentage: number;
}
export interface ClientProjectProgressChart {
  overallPercentage: number;
  phases: Array<{ milestoneId: string; label: string; completionPercentage: number }>;
  history: ClientProjectProgressPoint[];
}
export interface ClientProjectDocument {
  id: string;
  documentId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}
export interface ClientProjectScreenshot extends ClientProjectDocument { caption?: string }
export interface ClientProjectFeedback {
  id: string;
  authorDisplayName: string;
  message: string;
  createdAt: string;
}
export interface ClientProjectApproval {
  id: string;
  milestoneId: string;
  status: ClientApprovalStatus;
  requestedAt: string;
  resolvedAt?: string;
  clientComment?: string;
}
export interface ClientProjectMessage {
  id: string;
  authorDisplayName: string;
  body: string;
  createdAt: string;
  attachmentIds: string[];
}
export interface ClientProjectUpdate {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  authorDisplayName: string;
}
export interface ClientProjectNotification {
  id: string;
  type: 'milestone' | 'message' | 'approval' | 'document' | 'project_update';
  title: string;
  createdAt: string;
  readAt?: string;
}
export interface ClientProjectForecastInputs {
  remainingWorkPercentage: number;
  availableCapacityPerWeek: number;
  dependencyDelayDays: number;
  knownRiskBufferDays: number;
}
export interface ClientProject {
  id: string;
  companyId: string;
  name: string;
  description: string;
  status: ClientProjectStatus;
  timeline: ClientProjectTimeline;
  progress: ClientProjectProgressChart;
  milestones: ClientProjectMilestone[];
  tasks: ClientProjectTask[];
  documents: ClientProjectDocument[];
  screenshots: ClientProjectScreenshot[];
  feedback: ClientProjectFeedback[];
  approvals: ClientProjectApproval[];
  messages: ClientProjectMessage[];
  updates: ClientProjectUpdate[];
  notifications: ClientProjectNotification[];
}

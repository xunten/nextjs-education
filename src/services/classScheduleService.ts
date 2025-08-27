// services/classService.ts
import apiClient from '@/lib/axios';
import { ClassItem } from '@/types/classes';

export interface ClassSchedulePatternCreateDTO {
  classId: number;
  startDate: string;
  endDate: string;
  slots: {
    dayOfWeek: string;
    startPeriod: number;
    endPeriod: number;
    locationId: number;
  }[];
}

export const createClassSchedule = async (data: ClassSchedulePatternCreateDTO) => {
  try {
    const response = await apiClient.post("/auth/class-schedule-patterns", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getAllLocations = async () => {
  try {
    const response = await apiClient.get("/auth/locations");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getClassWithSessions = async (classId: string) => {
  const response = await apiClient.get(`/auth/sessions/class/${classId}`);
  return response.data; // Should include sessions array
};
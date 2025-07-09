export interface ScheduleEntry {
  date: string;
  location: string;
  director: string;
  staff: string[];
}

export interface PersonSchedule {
  [person: string]: {
    [date: string]: string;
  };
}

export interface ScheduleViewProps {
  month: string;
  year: number;
}
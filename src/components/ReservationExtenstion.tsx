import { ReservationPublic } from "../client";

// todo: use ReservationPublic and refactor extra date objects
export type ReservationExtenstion = ReservationPublic & {
    startDay: string;
    endDay: string;
    startTime?: string;
    endTime?: string;
    rawStartTime: string;
    rawEndTime: string;
    startsInSecondHalf: boolean;
    endsInFirstHalf: boolean;
    selectedTimeOfDay?: 'AM' | 'PM';
    displayTime?: string;
    startDateObj: Date;
    endDateObj: Date;
    startsInSecondHalfLocal: boolean;
    endsInFirstHalfLocal: boolean;
    startsBefore?: boolean;
    endsAfter?: boolean;
    effectiveStartDate?: Date;
    effectiveEndDate?: Date;
  }

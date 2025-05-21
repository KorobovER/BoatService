export const SERVICE_FEE_PERCENTAGE = 0.075; // 7.5% service fee

import { ReservationPublic } from "./client";

export type BookingStatus = 'Past booking' | 'Active booking' | 'Upcoming booking';

export const getBookingStatusText = (admin_status: string): BookingStatus => {
    switch (admin_status) {
        case 'completed':
            return 'Past booking';
        case 'require_action':
            return 'Active booking';
        default:
            return 'Upcoming booking';
    }
};

export const getBookingStatusTextColor = (status: BookingStatus): string => {
    switch (status) {
        case 'Past booking':
            return 'basic.grey300';
        case 'Active booking':
            return 'brand.secondaryBlue';
        case 'Upcoming booking':
            return 'brand.primaryOrange';
        default:
            return 'brand.secondaryBlue';
    }
};

export const getCellColor = (reservation: ReservationPublic): { bg: string; textColor: string } => {
    const status = getBookingStatusText(reservation.admin_status);
    switch (status) {
        case 'Active booking':
            return { bg: "#A85555", textColor: "white" };
        case 'Upcoming booking':
            return { bg: "#FEA02F", textColor: "basic.grey900" };
        case 'Past booking':
            return { bg: "#E5F2F2", textColor: "basic.grey700" };
        default:
            return { bg: "#007A7B", textColor: "white" };
    }
};

export const SERVICE_FEE_PERCENTAGE = 0.075; // 7.5% service fee

import { ReservationPublic } from "./client";

export type BookingStatus = 'Past booking' | 'Active booking' | 'Upcoming booking' | 'Away from mooring';

export const getBookingStatusText = (admin_status: string): BookingStatus => {
    switch (admin_status) {
        case 'completed':
            return 'Past booking';
        case 'require_action':
            return 'Active booking';
        case 'checked_in_locked':
        case 'checked_in_locked_require_action':
            return 'Away from mooring';
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
    
    // Handle checked_in_locked statuses with actual admin_status for more precise control
    if (reservation.admin_status === 'checked_in_locked_require_action') {
        return { 
            bg: `url('/assets/images/icons/reservations-bg/red-stripped.svg')`,
            textColor: 'white' 
        };
    } else if (reservation.admin_status === 'checked_in_locked') {
        return { 
            bg: `url('/assets/images/icons/reservations-bg/green-stripped.svg')`,
            textColor: 'basic.grey900' 
        };
    }

    switch (status) {
        case 'Active booking':
            return { bg: "#A85555", textColor: "white" };
        case 'Upcoming booking':
            return { bg: "#FEA02F", textColor: "basic.grey900" };
        case 'Past booking':
            return { bg: "#E5F2F2", textColor: "basic.grey700" };
        case 'Away from mooring':
            // Fallback in case we get here directly with 'Away from mooring' status
            return { bg: "#A8E6A8", textColor: "basic.grey900" };
        default:
            return { bg: "#007A7B", textColor: "white" };
    }
};

/**
 * Returns the appropriate boat image properties based on vessel type
 * @param vesselType - The type of vessel ('power', 'catamaran', 'monohull', etc.)
 * @param boatName - The name of the boat (used for alt text and fallback)
 * @param textColor - Optional text color for filter (if 'white', will invert the image)
 * @returns Object with image properties or text fallback properties
 */
export const getBoatImageProps = (vesselType: string, boatName: string, textColor?: string) => {
    // Map of vessel types to their image paths
    const vesselImageMap: Record<string, string> = {
        'power': '/assets/images/icons/boats/power-boat.svg',
        'catamaran': '/assets/images/icons/boats/catamaran-boat.svg',
        'monohull': '/assets/images/icons/boats/monohul-boat.svg'
    };

    // If vessel type has a corresponding image
    if (vesselType in vesselImageMap) {
        return {
            isImage: true,
            src: vesselImageMap[vesselType],
            alt: boatName,
            width: "22px",
            height: "22px",
            objectFit: "cover" as const, // Type assertion to match Chakra UI's expected type
            borderRadius: "4px",
            filter: textColor === "white" ? "brightness(0) invert(1)" : "brightness(0)"
        };
    }
    
    // Fallback to text representation
    return {
        isImage: false,
        text: boatName[0], // First letter of boat name
        color: textColor || "basic.grey900",
        fontSize: "14px",
        fontWeight: "400"
    };
};

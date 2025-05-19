export const SERVICE_FEE_PERCENTAGE = 0.075; // 7.5% service fee

import { ReservationPublic } from "./client";

export const getCellColor = (reservation: ReservationPublic): { bg: string; textColor: string } => {
    if (reservation.admin_status === 'require_action') {
        // todo: use calendar colors but this breaks svg colors
        // return { bg: "calendar.bgRed", textColor: "white" };
        return { bg: "#A85555", textColor: "white" };
    }

    if (reservation.admin_status === 'future_action') {
        // return { bg: "calendar.bgYellow", textColor: "basic.grey900" };
        return { bg: "#FEA02F", textColor: "basic.grey900" };
    }

    if (reservation.admin_status === 'completed') {
        // return { bg: "calendar.bgLightGreen", textColor: "basic.grey700" };
        return { bg: "#E5F2F2", textColor: "basic.grey700" };
    }

    // return { bg: "calendar.bgGreen", textColor: "white" };
    return { bg: "#007A7B", textColor: "white" };
};

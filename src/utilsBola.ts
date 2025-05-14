import { ReservationPublic } from "./client";

export const getCellColor = (reservation: ReservationPublic): { bg: string; textColor: string } => {
    if (reservation.admin_status === 'require_action') {
        return { bg: "calendar.BgRed", textColor: "white" };
    }

    if (reservation.admin_status === 'future_action') {
        return { bg: "calendar.BgYellow", textColor: "basic.grey900" };
    }

    if (reservation.admin_status === 'completed') {
        return { bg: "calendar.BgLightGreen", textColor: "basic.grey700" };
    }

    return { bg: "calendar.BgGreen", textColor: "white" };
};

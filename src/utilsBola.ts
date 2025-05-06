import { ReservationPublic } from "./client";

export const getCellColor = (reservation: ReservationPublic): { bg: string; textColor: string } => {
    if (reservation.admin_status === 'require_action') {
        return { bg: "system-error", textColor: "white" };
    }

    if (reservation.admin_status === 'future_action') {
        return { bg: "system.warningYellow", textColor: "white" };
    }

    if (reservation.admin_status === 'completed') {
        return { bg: "bg.success", textColor: "basic.grey700" };
    }

    return { bg: "system.successGreen", textColor: "white" };
};

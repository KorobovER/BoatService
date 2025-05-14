import { ReservationPublic } from "./client";

export const getCellColor = (reservation: ReservationPublic): { bg: string; textColor: string } => {
    if (reservation.admin_status === 'require_action') {
        return { bg: "system-error", textColor: "white" };
    }

    if (reservation.admin_status === 'future_action') {
        return { bg: "#FEA02F", textColor: "white" };
    }

    if (reservation.admin_status === 'completed') {
        return { bg: "#E5F2F2", textColor: "basic.grey700" };
    }

    return { bg: "#007A7B", textColor: "white" };
};

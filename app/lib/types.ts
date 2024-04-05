export interface ApiDataUser {
    errorCode?: boolean;
    token: string;
    credentials: string;
    user: {
        externalId: string,
        centerId: number,
        firstName: string,
        lastName: string,
        userId: number,
    };
}

export type User = ApiDataUser["user"];

export interface ApiDataActivities {
    [key: string]: Array<{
        id: number;
        bookingId: number;
        centerId: number;
        personCenterId: number;
        personId: number;
        booking: Booking;
        state: UserBooking;
        reschedule: boolean
    }>;
}

export type UserBooking = "PARTICIPATION" | "BOOKED" | "SCHEDULED" | "RE-SCHEDULING";

export type UserActivity = Omit<ApiDataActivities[string][number], "booking">;

export type Booking = {
    id: number;
    centerId: number;
    name: string;
    date: string;
    startTime: string;
    endTime: string;
    activity: {
        id: number;
        name: string;
    };
    bookedCount: number;
    classCapacity: number;
    bookingProgramId: number;
};

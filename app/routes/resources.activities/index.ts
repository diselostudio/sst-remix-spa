import { search } from "#/api/search";
import { ClientActionFunctionArgs } from "@remix-run/react";
import { toast } from "sonner";
import { ApiDataActivities } from "~/lib/types";

export async function clientLoader({ request }: ClientActionFunctionArgs) {

    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('accessToken') as string;
    const selectedUserId = searchParams.get('selectedUserId') as string;
    const selectedUserCenterId = searchParams.get('selectedUserCenterId') as string;

    const result: [ApiDataActivities[string], ApiDataActivities[string]] = await Promise.all([
        fetch(import.meta.env.VITE_EP_RETRIEVE).then((res) => res.json()),
        search(accessToken, selectedUserId, selectedUserCenterId, selectedUserCenterId),
    ]).catch((e) => {
        console.error(e);
        toast.error("Something wrong happened");
        throw new Error(e);
    })

    const [scheduledActivities, activities] = result;

    const scheduledActivitiesIds: number[] = scheduledActivities.map(({ bookingId }) => bookingId);

    activities.forEach((activity) => {
        const isScheduled = scheduledActivitiesIds.some((id: number) => activity.booking.id === id);

        if (isScheduled) {
            activity.state = "SCHEDULED";
            const sActivity = scheduledActivities.find((sacti) => sacti.bookingId === activity.booking.id);
            if (sActivity?.reschedule) {
                activity.state = "RE-SCHEDULING";
            }
        }
    });

    return Object.groupBy(activities, (item) => item?.booking?.date);
}

import { createBooking } from "#/api/create-booking"
import { toast } from "sonner";
import { ClientActionFunctionArgs } from "@remix-run/react";

export async function clientAction({ request }: ClientActionFunctionArgs) {

  const { accessToken, credentials, dateTime: notNormalizedDateTime, ...data } = await request.json();

  try {

    const booking = await createBooking(accessToken, data);
    toast.success('Your class was succesfully scheduled');
    return booking;

  } catch (e) {

    const { message } = e as Error;

    if (message.includes("tooEarlyToBookParticipant")) {
      toast.info('It is too early to book the selected class, we will schedule it for you');
    }

    if (message.includes("listsFull")) {
      toast.warning('This class is already full, we will retry recurrently until we get a spot for you');
      data.reschedule = true;
    }

    const dateTime = new Date(notNormalizedDateTime).toISOString();

    await fetch(import.meta.env.VITE_EP_SCHEDULE, {
      method: 'POST',
      body: JSON.stringify({ credentials, dateTime, ...data })
    }).catch((e) => {
      console.error(e);
      toast.error('Something went wrong, refresh and try again')
    });

    toast('Class is ready to be booked when available, come later to verify that');

    return { ok: true };
  }
}

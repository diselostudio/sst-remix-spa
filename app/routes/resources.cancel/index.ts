import { cancelBooking } from "#/api/cancel-booking"
import { toast } from "sonner";
import { ClientActionFunctionArgs } from "@remix-run/react";

export async function clientAction({ request }: ClientActionFunctionArgs) {

  const { accessToken, state, ...data } = await request.json();

  if (state === "BOOKED") {

    try {
      const booking = await cancelBooking(accessToken, data);
      toast('Your class was succesfully canceled');
      return booking;

    } catch (e) {
      console.error(e);
      toast.error('Something went wrong');
      return { error: true };
    }
  } else {

    await fetch(import.meta.env.VITE_EP_REMOVE, {
      body: JSON.stringify(data),
      method: "DELETE"
    }).then(res => {
      if (!res.ok) {
        toast.error('Something went wrong');
        return { error: true };
      }
      toast('Your class was succesfully canceled');
    });
    return { error: false };
  }
}

import { auth } from "#/api/auth";
import { ClientActionFunctionArgs } from "@remix-run/react";

export async function clientAction({ request }: ClientActionFunctionArgs) {
  const body = await request.formData();
  const email = body.get("email") as string;
  const password = body.get("password") as string;
  const credentials = btoa(`${email}|${password}`);

  try {
    const data = await auth(email, password);
    return { ...data, credentials };
  } catch (e) {
    return { error: true };
  }
}

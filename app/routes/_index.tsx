import { MetaFunction, useFetcher } from "@remix-run/react";
import { useEffect, useState, useContext, createContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  CardTitle,
  CardDescription,
  CardContent,
  Card,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";

import {
  User,
  ApiDataUser,
  ApiDataActivities,
  UserActivity,
  Booking,
} from "~/lib/types";
import { UserRoundIcon } from "lucide-react";

const WEEKDAYS: string[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

type OnLoginFnType = (
  accessToken: string,
  credentials: string,
  user: User
) => void;

const UserContext = createContext({
  accessToken: "",
  credentials: "",
  user: null as unknown as User,
});

export const meta: MetaFunction = () => {
  return [{ title: "Gym gym gym !!!" }];
};

export default function Index() {
  const [accessToken, _setAccessToken] = useState<string>("");
  const [credentials, _setCredentials] = useState<string>("");
  const [user, _setUser] = useState<User>(null as unknown as User);

  const onLogin: OnLoginFnType = (accessToken, credentials, user) => {
    _setAccessToken(accessToken);
    _setCredentials(credentials);
    _setUser(user);
  };

  return (
    <UserContext.Provider
      value={{
        accessToken,
        credentials,
        user,
      }}
    >
      <LoginDialog open={!accessToken} onLogin={onLogin} />
      <ActivityPanel />
    </UserContext.Provider>
  );
}

function LoginDialog({
  onLogin,
  open,
}: {
  onLogin: OnLoginFnType;
  open: boolean;
}): JSX.Element {
  const fetcher = useFetcher<ApiDataUser>();

  useEffect(() => {
    const data = (fetcher.data as ApiDataUser) || {};
    if (data.errorCode) {
      toast.error("Wrong email or password...");
    } else if (data.token) {
      toast.success("You were succesfully loged in!");
      onLogin(data.token, data.credentials, data.user);
    }
  }, [fetcher.data]);

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gym&apos;s online platform!</DialogTitle>
          <DialogDescription>
            To access your class schedules and manage your gym activities,
            please log in to your account. Once logged in, you&apos;ll be able
            to explore and reserve classes.
          </DialogDescription>
        </DialogHeader>
        <fetcher.Form
          method="POST"
          action="/resources/login"
          className="grid items-start gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input name="email" type="email" placeholder="Email" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Password</Label>
            <Input name="password" type="password" placeholder="Password" />
          </div>
          <Button type="submit" disabled={fetcher.state !== "idle"}>
            {fetcher.state === "idle" ? "Submit" : "Please wait"}
          </Button>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

function ActivityPanel() {
  const { accessToken, user } = useContext(UserContext);
  const fetcher = useFetcher<ApiDataActivities>({ key: "activities" });

  useEffect(() => {
    if (accessToken) {
      fetcher.load(
        `/resources/activities?accessToken=${accessToken}&selectedUserId=${user.userId}&selectedUserCenterId=${user.centerId}`
      );
    }
  }, [accessToken]);

  if (!fetcher.data) {
    return <Layout>{null}</Layout>;
  }

  return (
    <Layout>
      <div className="activity-panel-animation grid grid-cols-base gap-x-8 p-10 px-[18vw] max-md:px-[5vw] pt-0 w-fit">
        {Object.keys(fetcher.data).map((date) => {
          return (
            <Card key={date} className="w-[300px]">
              <CardContent className="px-4 py-2">
                <CardTitle className="text-base flex justify-between whitespace-nowrap">
                  <span>{WEEKDAYS[new Date(date).getDay()]}</span>
                  <span>{date}</span>
                </CardTitle>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="activity-panel-animation grid grid-cols-base gap-x-8 p-10 px-[18vw] max-md:px-[5vw] pt-0 w-fit">
        {Object.entries(fetcher.data).map(([_, activities]) => {
          return (
            <div key={`_${_}`} className="snap-start w-[300px] space-y-4">
              {activities.map(({ booking, ...user }) => {
                return (
                  <ClassItem
                    booking={booking}
                    user={user}
                    key={`${booking.date}${booking.name}${booking.startTime}`}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </Layout>
  );
}

function ClassItem({
  booking,
  user,
}: {
  booking: Booking;
  user: UserActivity;
}) {
  const { accessToken, credentials } = useContext(UserContext);

  const schedule = useFetcher();
  const cancel = useFetcher();

  const submitting = schedule.state === "submitting";
  const canceling = cancel.state === "submitting";

  const { state } = user;

  function bookAClass() {
    schedule.submit(
      {
        bookingCenterId: user.centerId,
        bookingId: booking.id,
        selectedUserCenterId: user.personCenterId,
        selectedUserId: user.personId,
        accessToken,
        credentials,
        dateTime: `${booking.date} ${booking.startTime}`,
      },
      {
        method: "POST",
        action: "/resources/schedule",
        encType: "application/json",
        navigate: false,
      }
    );
  }

  function cancelAClass() {
    cancel.submit(
      {
        selectedUserCenterId: user.personCenterId,
        selectedUserId: user.personId,
        participationCenterId: user.personCenterId,
        participationId: user.id,
        bookingId: booking.id,
        accessToken,
        credentials,
        state,
      },
      {
        method: "DELETE",
        action: "/resources/cancel",
        encType: "application/json",
        navigate: false,
      }
    );
  }

  const BadgeStatus = () => {
    if (state === "BOOKED") {
      return (
        <Badge className="mt-4 bg-teal-200 text-teal-900 border-teal-300 border-2">
          Ready to go!
        </Badge>
      );
    }

    if (state === "SCHEDULED") {
      return (
        <Badge className="mt-4 bg-blue-200 text-blue-900 border-blue-300 border-2">
          Await booking
        </Badge>
      );
    }

    if (state === "RE-SCHEDULING") {
      return (
        <Badge className="mt-4 bg-orange-200 text-orange-900 border-orange-300 border-2">
          Trying again
        </Badge>
      );
    }

    if (state === "PARTICIPATION") {
      return <Badge className="mt-4">You did it!</Badge>;
    }

    return null;
  };

  const ActionButton = () => {
    if (
      state === "BOOKED" ||
      state === "SCHEDULED" ||
      state === "RE-SCHEDULING"
    ) {
      return (
        <Button disabled={canceling} size="sm" onClick={cancelAClass}>
          {submitting ? "Canceling" : "Cancel"}
        </Button>
      );
    }

    if (state === "PARTICIPATION") {
      return null;
    }

    return (
      <Button
        disabled={submitting}
        size="sm"
        variant="outline"
        onClick={bookAClass}
        className="flex-end"
      >
        {submitting ? "Requesting" : "Schedule"}
      </Button>
    );
  };

  const byStateCss =
    state === "BOOKED"
      ? "border-teal-300 bg-teal-50"
      : state === "PARTICIPATION"
      ? "border-black"
      : state === "SCHEDULED"
      ? "border-blue-300 bg-blue-50"
      : state === "RE-SCHEDULING"
      ? "border-orange-300 bg-orange-50"
      : "";

  return (
    <Card className={byStateCss}>
      <CardContent className="p-4 flex justify-between space-x-10">
        <div className="flex items-center">
          <div className="">
            <CardTitle className="text-base whitespace-nowrap">
              {booking.name}
            </CardTitle>
            <CardDescription className="text-sm">
              {booking.startTime} - {booking.endTime}
            </CardDescription>
            <BadgeStatus />
          </div>
        </div>
        <div className="flex flex-col items-end space-x-2 justify-between">
          <small className="text-xs font-medium leading-none text-muted-foreground pt-1 pb-4">
            {booking.bookedCount} / {booking.classCapacity}
          </small>
          <ActionButton />
        </div>
      </CardContent>
    </Card>
  );
}

function Layout({
  children,
}: {
  children: JSX.Element | JSX.Element[] | null;
}) {
  const { user } = useContext(UserContext);
  return (
    <>
      <main className="min-h-svh overflow-x-hidden flex flex-col">
        <section className="w-100 py-32 flex flex-col items-center relative border-solid border-b-2 border-gray-100 pl-[calc(100vw-100%)]">
          <EffectLayer />
          <div className="text-center max-w-[1512px] w-full flex flex-col items-center relative">
            {user && user.userId && (
              <div className="flex absolute top-[-100px] mr-3 right-0 z-10 px-3 py-1 space-x-2 items-center">
                <UserRoundIcon size={18} />
                <span className="text-sm font-semibold">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-sm text-gray-400">{user.userId}</span>
              </div>
            )}
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              Gym re-scheduler
            </h1>
            <h2 className="max-w-[625px] text-balance scroll-m-20 mt-8 pb-2 text-lg font-normal first:mt-0 text-gray-500 text-center">
              Simply browse through the available time slots and classes offered
              by your gym, and book the ones that suit your schedule with just a
              few taps
            </h2>
            <Badge
              variant="outline"
              className="mt-5 bg-yellow-200 text-green-600 border border-green-700 p-2 px-4"
            >
              Beware this is an unstable prototype
            </Badge>
          </div>
        </section>
        <section className="overflow-auto bg-white pt-12 flex-1">
          {children}
        </section>
      </main>
    </>
  );
}

export function ErrorBoundary() {
  return <h1>Unknown Error</h1>;
}

function EffectLayer() {
  return (
    <div className="effect-layer absolute py-32">
      <div className="effect-layer-1"></div>
      <div className="effect-layer-2"></div>
    </div>
  );
}

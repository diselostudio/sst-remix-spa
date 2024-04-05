import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import { createBooking } from "#/api/create-booking";
import { auth } from "#/api/auth";

const dynamoBareBonesClient = new DynamoDBClient({});
const client = DynamoDBDocumentClient.from(dynamoBareBonesClient);

const loginPromise: any = {};

export async function handler(event) {

    const TableName = Resource.GymActivityTable.name;
    const command = new ScanCommand({ TableName })
    const response = await client.send(command).catch((e) => {
        throw new Error(e);
    })
    const activities = response.Items || [];

    const queue = activities.map(async function (activity) {
        const { reschedule: isReschedule } = activity;

        if (isReschedule) {
            await retrySchedule(activity);
        } else {
            await onTimeSchedule(activity);
        }

        await checkExpiredActivity(activity)
    })

    await Promise.all(queue);

    return;
}

async function onTimeSchedule(activity: any) {

    const fiveMinutesInSeconds = 5 * 60;
    // const fiveMinutesInSeconds = 1 * 60;

    const now = new Date();
    const activityTime = new Date(activity.dateTime);

    const diffInMs = Math.abs(activityTime.getTime() - now.getTime());
    const diffInSeconds = diffInMs / 1000;
    const diffWithoutADay = diffInSeconds - (24 * 60 * 60);



    if (diffWithoutADay < fiveMinutesInSeconds) {
        const { credentials } = activity;
        const accessToken = await doLogin(credentials);

        await delay(diffWithoutADay * 1000);

        try {
            const { bookingCenterId, bookingId, selectedUserCenterId, selectedUserId } = activity;

            await createBooking(accessToken, {
                bookingCenterId,
                bookingId,
                selectedUserCenterId,
                selectedUserId
            })
            await removeActiviy(bookingId, selectedUserId)

        } catch (e) {
            console.log(new Date().toISOString());
            const TableName = Resource.GymActivityTable.name;
            const command = new PutCommand({
                TableName,
                Item: {
                    ...activity,
                    reschedule: true
                }
            })
            await client.send(command).catch((e) => {
                throw new Error(e);
            })
        }
    }
}

async function retrySchedule(activity: any) {

    const { credentials } = activity;
    const accessToken = await doLogin(credentials);
    const { bookingCenterId, bookingId, selectedUserCenterId, selectedUserId } = activity;
    try {
        await createBooking(accessToken, {
            bookingCenterId,
            bookingId,
            selectedUserCenterId,
            selectedUserId
        })
        await removeActiviy(bookingId, selectedUserId)
    } catch (e) {
        console.error('retrySchedule', e);
    }
}

async function doLogin(credentials: string): Promise<string> {
    const [em, pwd] = atob(credentials).split('|');
    const thelogin = loginPromise[credentials];

    if (thelogin) {
        const { token } = await thelogin;
        return token;
    }

    try {
        const promise = auth(em, pwd);
        loginPromise[credentials] = promise;
        const { token } = await promise as any;
        return token;

    } catch (e) {
        console.error(e, "doLogin");
        throw new Error(e as string);
    }
}

async function removeActiviy(bookingId: number, selectedUserId: number) {
    const TableName = Resource.GymActivityTable.name;
    const command = new DeleteCommand({
        TableName,
        Key: {
            bookingId: bookingId,
            selectedUserId: selectedUserId
        }
    })
    const response = await client.send(command).catch((e) => {
        throw new Error(e);
    })
    return response;
}

async function checkExpiredActivity(activity: any) {
    const { dateTime } = activity;
    const activityDate = new Date(dateTime)
    const now = new Date();
    if (activityDate < now) {
        await removeActiviy(activity.bookingId, activity.selectedUserId);
    }
}

function delay(t: number) {
    return new Promise(resolve => setTimeout(resolve, t));
}
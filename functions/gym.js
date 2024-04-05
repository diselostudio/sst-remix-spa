import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";

const dynamoBareBonesClient = new DynamoDBClient({});
const client = DynamoDBDocumentClient.from(dynamoBareBonesClient);

export async function schedule(event) {

    const headers = event.headers;
    const body = JSON.parse(event.body);

    if (event.requestContext.http.method !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }

    // Check if the request is coming from localhost SET IN ENV
    // if (headers.origin !== '') {
    //     return {
    //         statusCode: 403,
    //         body: JSON.stringify({ message: 'Forbidden' })
    //     };
    // }

    const TableName = Resource.GymActivityTable.name;
    const command = new PutCommand({
        TableName,
        Item: body
    })
    const response = await client.send(command).catch((e) => {
        throw new Error(e);
    })
    return response;
}

export async function retrieve(event) {

    if (event.requestContext.http.method !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }

    // Check if the request is coming from localhost SET IN ENV
    // if (headers.origin !== '') {
    //     return {
    //         statusCode: 403,
    //         body: JSON.stringify({ message: 'Forbidden' })
    //     };
    // }

    const TableName = Resource.GymActivityTable.name;
    const command = new ScanCommand({ TableName })
    const response = await client.send(command).catch((e) => {
        throw new Error(e);
    })
    return response.Items || [];
}

export async function remove(event) {

    const headers = event.headers;
    const body = JSON.parse(event.body);

    if (event.requestContext.http.method !== 'DELETE') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }

    // Check if the request is coming from localhost SET IN ENV
    // if (headers.origin !== '') {
    //     return {
    //         statusCode: 403,
    //         body: JSON.stringify({ message: 'Forbidden' })
    //     };
    // }

    const TableName = Resource.GymActivityTable.name;
    const command = new DeleteCommand({
        TableName,
        Key: {
            bookingId: body.bookingId,
            selectedUserId: body.selectedUserId
        }
    })
    const response = await client.send(command).catch((e) => {
        throw new Error(e);
    })
    return response.Items || [];
}
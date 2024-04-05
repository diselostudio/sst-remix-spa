/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "sst-remix-spa",
      removal: "remove",
      home: "aws",
      providers: {
        aws: {
          region: "eu-west-3",
          profile: "sst-gym"
        }
      }
    };
  },
  async run() {

    const dynamo = new sst.aws.Dynamo("GymActivityTable", {
      fields: {
        bookingId: "number",
        selectedUserId: "number"
      },
      primaryIndex: { hashKey: "bookingId", rangeKey: "selectedUserId" }
    });

    const schedule = new sst.aws.Function("GymSchedule", {
      handler: "functions/gym.schedule",
      url: true,
      link: [dynamo],
      streaming: false
    });

    const retrieve = new sst.aws.Function("GymRetrieveActivities", {
      handler: "functions/gym.retrieve",
      url: true,
      link: [dynamo],
      streaming: false
    });

    const remove = new sst.aws.Function("GymRemoveActivity", {
      handler: "functions/gym.remove",
      url: true,
      link: [dynamo],
      streaming: false
    });

    new sst.aws.Cron("GymCronJob", {
      job: {
        handler: "functions/cron.handler",
        link: [dynamo],
        timeout: "6 minutes"
      },
      schedule: "rate(5 minutes)",
      // schedule: "rate(1 minute)",
    });

    new sst.aws.StaticSite("SPA", {
      build: {
        command: "npm run build",
        output: "build/client"
      },
      environment: {
        VITE_EP_SCHEDULE: schedule.url,
        VITE_EP_RETRIEVE: retrieve.url,
        VITE_EP_REMOVE: remove.url
      },
    });
  },
});

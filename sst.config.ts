/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "sst-remix-spa",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {

    const { url } = new sst.aws.Function("ExampleLambda", {
      // Replace path & handler with your function's dir
      handler: "<path>/<handler>",
      url: true,
      streaming: false
    });

    new sst.aws.StaticSite("RemixSPA", {
      build: {
        command: "npm run build",
        output: "build/client"
      },
      environment: {
        VITE_LAMBDA_RUL: url,
      },
    });
  },
});

import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";

const _importDynamic = new Function("modulePath", "return import(modulePath)");

const fetch = async function (...args: any): Promise<Response> {
  const { default: fetch } = await _importDynamic("node-fetch");
  return fetch(...args);
};

export const handler: Handler = async (event: APIGatewayProxyEvent) => {
  const response: APIGatewayProxyResult = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Methods": "*",
    },
    body: ``,
  };

  const method = event.httpMethod;

  // Handle CORS preflight
  if (method === "OPTIONS") {
    return response;
  }

  const forwardPath =
    (event.pathParameters?.forwardPath as string | undefined) || "";
  const bodyJson = event.body;
  const isBase64 = event.isBase64Encoded || false;
  const incomingContentType =
    event.headers?.["Content-Type"] ||
    event.headers?.["content-type"] ||
    "application/json";
  const multiParams = (event.multiValueQueryStringParameters || {}) as {
    [key: string]: string[];
  };
  const paramKeys = Object.keys(multiParams);

  try {
    const queryString = paramKeys
      .flatMap((key) => multiParams[key].map((val) => `${key}=${val}`))
      .join("&");
    const url = `${process.env.API_URL}/${forwardPath.split("__").join("/")}${queryString ? `?${queryString}` : ""}`;

    // Build request body — decode base64 for binary uploads
    let requestBody: any = null;
    const isBinaryContent =
      /^multipart\/form-data/i.test(incomingContentType) ||
      /^image\//i.test(incomingContentType) ||
      /^application\/octet-stream/i.test(incomingContentType);

    if (bodyJson) {
      if (isBase64) {
        requestBody = Buffer.from(bodyJson, "base64");
      } else if (isBinaryContent) {
        // API Gateway may pass binary as latin1 string when not base64-encoded
        requestBody = Buffer.from(bodyJson, "latin1");
      } else {
        requestBody = bodyJson;
      }
    }

    const apiResponse = await fetch(url, {
      method,
      body: requestBody,
      headers: {
        Accept: "application/json",
        "Content-Type": incomingContentType,
      },
    });

    if (apiResponse.status === 204) {
      return response;
    }

    const json = await apiResponse.json();

    if (json && typeof json === "object") response.body = JSON.stringify(json);
    return response;
  } catch (err: unknown) {
    console.log(`<--- --- --->`);
    console.log(`Unexpected Typescript Error:`);
    response.statusCode = 500;
    response.body = JSON.stringify({
      success: false,
      error: `Unkown Error: ${err}`,
    });
    if (!(err instanceof Error)) {
      console.log(`<--- --- --->`);
      return response;
    }
    response.body = JSON.stringify({ success: false, error: err.message });
    console.log(err.message);
    console.log(`<--- --- --->`);
  }

  return response;
};

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
    },
    body: ``,
  };

  const method = event.httpMethod;
  const forwardPath =
    (event.pathParameters?.forwardPath as string | undefined) || "";
  const bodyJson = event.body;
  const params = (event.queryStringParameters || {}) as {
    [key: string]: string;
  };
  const paramKeys = Object.keys(params);

  try {
    const url = `${process.env.API_URL}/${forwardPath.split("__").join("/")}${paramKeys.length > 0 ? `?${paramKeys.map((key, i, arr) => `${key}=${params[key]}${arr.length - 1 > i ? "&" : ""}`).join("")}` : ""}`;

    const apiResponse = await fetch(url, {
      method,
      body: bodyJson,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
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

import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";

// AWS SDK v3 is available in the nodejs20.x Lambda runtime
import {
  EC2Client,
  StartInstancesCommand,
  StopInstancesCommand,
  DescribeInstancesCommand,
} from "@aws-sdk/client-ec2";

const ec2 = new EC2Client({ region: process.env.EC2_REGION || process.env.AWS_REGION || "us-east-1" });
const INSTANCE_ID = process.env.EC2_INSTANCE_ID!;

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const handler: Handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const action = event.pathParameters?.action;

  try {
    if (action === "status") {
      const result = await ec2.send(
        new DescribeInstancesCommand({ InstanceIds: [INSTANCE_ID] })
      );
      const instance = result.Reservations?.[0]?.Instances?.[0];
      const state = instance?.State?.Name || "unknown";
      const publicIp = instance?.PublicIpAddress || null;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: state, publicIp }),
      };
    }

    if (action === "start") {
      await ec2.send(
        new StartInstancesCommand({ InstanceIds: [INSTANCE_ID] })
      );
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "EC2 instance starting..." }),
      };
    }

    if (action === "stop") {
      await ec2.send(
        new StopInstancesCommand({ InstanceIds: [INSTANCE_ID] })
      );
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "EC2 instance stopping..." }),
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid action. Use: status, start, stop" }),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("EC2 Control Error:", message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: message }),
    };
  }
};

import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  CognitoIdentityProviderServiceException,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextApiRequest, NextApiResponse } from "next";

const { COGNITO_REGION, COGNITO_APP_CLIENT_ID, COGNITO_USER_POOL_ID } =
  process.env;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).send({ error: "Invalid method" });

  const params = {
    AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
    ClientId: COGNITO_APP_CLIENT_ID,
    UserPoolId: COGNITO_USER_POOL_ID,
    AuthParameters: {
      USERNAME: req.body.username,
      PASSWORD: req.body.password,
    },
  };

  const cognitoClient = new CognitoIdentityProviderClient({
    region: COGNITO_REGION,
  });
  const adminInitiateAuthCommand = new AdminInitiateAuthCommand(params);

  try {
    const response = await cognitoClient.send(adminInitiateAuthCommand);
    console.log(response);
    return res.status(response["$metadata"].httpStatusCode!).json({
      ...response.AuthenticationResult,
    });
  } catch (err) {
    console.log(err);
    if (err instanceof CognitoIdentityProviderServiceException) {
      return res
        .status(err.$metadata.httpStatusCode!)
        .send({ message: err.toString() });
    }
  }
}

import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InvalidPasswordException,
  CognitoIdentityProviderServiceException,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextApiRequest, NextApiResponse } from "next";

const { COGNITO_REGION, COGNITO_APP_CLIENT_ID } = process.env;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).send({ error: "Invalid method" });

  const params = {
    ClientId: COGNITO_APP_CLIENT_ID,
    Password: req.body.password,
    Username: req.body.username,
    UserAttributes: [
      {
        Name: "email",
        Value: req.body.email,
      },
    ],
  };

  const cognitoClient = new CognitoIdentityProviderClient({
    region: COGNITO_REGION,
  });
  const signUpCommand = new SignUpCommand(params);

  try {
    const response = await cognitoClient.send(signUpCommand);
    return res
      .status(response["$metadata"].httpStatusCode!)
      .send({ message: "Success" });
  } catch (err) {
    console.log(err);
    if (err instanceof CognitoIdentityProviderServiceException) {
      return res
        .status(err.$metadata.httpStatusCode!)
        .send({ message: err.toString() });
    }
  }
}

import { Stack, StackProps, Fn } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LambdaIntegration, RestApi, Cors, IRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Function } from 'aws-cdk-lib/aws-lambda';

export interface ApiStackProps extends StackProps {
  authHandlerArn: string;
  authCallbackHandlerArn: string;
  registrationArn: string;
  loginArn: string;
  verifyEmailArn: string;
  openAIListingUpdaterArn: string;
}

export class ApiStack extends Stack {
  public readonly api: IRestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Create the API Gateway REST API with CORS enabled
    this.api = new RestApi(this, 'Endpoint', {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
    });

    // Import Lambda function constructs from the provided ARNs without modifying permissions
    const importLambda = (id: string, arn: string) => {
      return Function.fromFunctionAttributes(this, id, {
        functionArn: arn,
        skipPermissions: true, // The permissions are assumed to be set up in the Lambda stack
      });
    };

    // Import the Lambda functions
    const authHandler = importLambda('AuthHandler', props.authHandlerArn);
    const authCallbackHandler = importLambda('AuthCallbackHandler', props.authCallbackHandlerArn);
    const registrationHandler = importLambda('RegistrationHandler', props.registrationArn);
    const loginHandler = importLambda('LoginHandler', props.loginArn);
    const verifyHandler = importLambda('VerifyHandler', props.verifyEmailArn);
    const openAIListingUpdater = importLambda('openAIListingUpdater', props.openAIListingUpdaterArn);

    // Add the methods to the corresponding resources
    const authResource = this.api.root.addResource('auth');
    authResource.addMethod('POST', new LambdaIntegration(authHandler));

    const callbackResource = authResource.addResource('callback');
    callbackResource.addMethod('GET', new LambdaIntegration(authCallbackHandler));

    const registrationResource = this.api.root.addResource('register');
    registrationResource.addMethod('POST', new LambdaIntegration(registrationHandler));

    const loginResource = this.api.root.addResource('login');
    loginResource.addMethod('POST', new LambdaIntegration(loginHandler));

    const verifyEmailResource = this.api.root.addResource('verify-email');
    verifyEmailResource.addMethod('POST', new LambdaIntegration(verifyHandler));

    const openAIListingUpdaterResource = this.api.root.addResource('update-listing');
    openAIListingUpdaterResource.addMethod('GET', new LambdaIntegration(openAIListingUpdater));
  }
}

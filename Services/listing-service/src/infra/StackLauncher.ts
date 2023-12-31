import { App } from 'aws-cdk-lib';
import { ListingServiceLambdaStack } from '../infra/stacks/LambdaStack';
import * as path from 'path';

const lambdasPath = path.join(__dirname, '..', 'lambdas');


const app = new App();

new ListingServiceLambdaStack(app, 'ListingServiceLambdaStack', {
    lambdaCodePath: lambdasPath,
    env: {
        account: '437592400700',
        region: 'eu-west-2',
    },
});


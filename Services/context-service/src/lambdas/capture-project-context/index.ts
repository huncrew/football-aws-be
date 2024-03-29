import { ProjectContext, validateProjectContext } from './schema/context';
import { putContextData } from './repository/storeContext';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { z } from 'zod';


export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Parse the incoming event body
    const body = event.body ? JSON.parse(event.body) : {};

    // Validate the event body with the schema and infer the TypeScript type
    const validatedData: ProjectContext = validateProjectContext(body);

    // Store the project context data in DynamoDB
    await putContextData(validatedData);

    // return a success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Project context saved successfully' }),
    };
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Validation failed', details: error.errors }),
      };
    }

    // Handle other errors
    console.error('Error handling the request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

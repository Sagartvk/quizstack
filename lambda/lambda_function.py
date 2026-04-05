"""
QuizStack 2026 — AWS Lambda Function
File:    lambda_function.py
Runtime: Python 3.12
Role:    QuizLambdaRole (AmazonDynamoDBFullAccess + AWSLambdaBasicExecutionRole)
Table:   QuizResults  (Partition key: submissionId — String)

Deploy steps:
  1. Go to AWS Console → Lambda → Create Function
  2. Function name : QuizSubmitHandler
  3. Runtime       : Python 3.12
  4. Architecture  : x86_64
  5. Execution role: Use existing role → QuizLambdaRole
  6. Paste this entire file into the inline code editor
  7. Click "Deploy"
  8. Test with the sample payload below using the "Test" tab:
     {
       "body": "{\"name\":\"Sagar Ibrahim\",\"email\":\"sagar@test.com\",\"phone\":\"+91 98765 43210\",\"score\":38,\"totalAttempted\":45}"
     }
"""

import json
import boto3
import uuid
from datetime import datetime

# DynamoDB resource
dynamodb = boto3.resource("dynamodb")
table    = dynamodb.Table("QuizResults")


def lambda_handler(event, context):
    """
    Receives a POST request from API Gateway.
    Parses the quiz result payload and saves it to DynamoDB.
    Returns the saved submissionId on success.
    """
    try:
        # Parse request body (API Gateway sends body as a JSON string)
        body = json.loads(event.get("body", "{}"))

        # Build the DynamoDB item
        item = {
            "submissionId":   str(uuid.uuid4()),           # Unique primary key
            "name":           body.get("name", ""),
            "email":          body.get("email", ""),
            "phone":          body.get("phone", ""),
            "score":          body.get("score", 0),
            "totalAttempted": body.get("totalAttempted", 0),
            "submittedAt":    datetime.utcnow().isoformat() + "Z"
        }

        # Write to DynamoDB
        table.put_item(Item=item)

        # Success response — CORS header included
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin":  "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS"
            },
            "body": json.dumps({
                "message": "Quiz result saved successfully!",
                "id":      item["submissionId"]
            })
        }

    except KeyError as e:
        # Missing required field in the request body
        return {
            "statusCode": 400,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": f"Missing field: {str(e)}"})
        }

    except Exception as e:
        # Catch-all for unexpected errors (logged to CloudWatch)
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": str(e)})
        }

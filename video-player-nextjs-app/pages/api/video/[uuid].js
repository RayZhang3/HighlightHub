// pages/api/videos/[uuid].js
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";

export default async function handler(req, res) {
  console.log("req", req.query)
  const { uuid } = req.query;
  const dynamodbClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  
  const dynamodbParams = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      fileId: { S: uuid }
    },
  };

  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    const data = await dynamodbClient.send(new GetItemCommand(dynamodbParams));
    if (!data.Item) {
      return res.status(404).json({ error: 'Video not found' });
    }
    if (!data.Item.s3Path) {
      return res.status(500).json({ error: 'Video data is missing' });
    }
    if (!data.Item.s3JsonPath) {
      return res.status(500).json({ error: 'JSON data is missing' });
    }
    console.log("data", data)
    // Return s3 file path and json file path
    res.status(200).json({
      videoUrl: `https://highlighthub.s3.amazonaws.com/${data.Item.s3Path.S}`,
      jsonUrl: `https://highlighthub.s3.amazonaws.com/${data.Item.s3JsonPath.S}`,
    });
  } catch (error) {
    console.error('Error retrieving video data', error);
    res.status(500).json({ error: 'Error retrieving video data' });
  }
}
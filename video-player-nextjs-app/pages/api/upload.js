// pages/api/upload.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.S3_BUCKET) {
    throw new Error('S3 bucket name is not defined in environment variables.');
  }
  const s3Client = new S3Client(
    { region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      Bucket: process.env.S3_BUCKET,
  }
);
const dynamodbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});


  const { filename, contentType } = req.body;

  // The key could include a user-specific identifier to prevent collisions
  const key = `videos/${filename}`;
  const jsonKey = `output/${filename}.json`;

  const dynamodbParams = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      fileId: { S: filename }, 
      filename: { S: filename }, // 根据实际情况调整
      s3Path: { S: process.env.S3_BUCKET + key},
      s3JsonPath: { S: process.env.S3_BUCKET + jsonKey},
      videoInfo: { S: "" },
    },
  };
  
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    // Set the expiry time of the presigned URL (e.g., 15 minutes)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    // Write file information to DynamoDB
    await dynamodbClient.send(new PutItemCommand(dynamodbParams));
    return res.status(200).json({
      signedUrl: signedUrl,
      key: key,
    });
  } catch (err) {
    console.error('Error creating signed URL', err);
    return res.status(500).json({ error: 'Error creating signed URL' });
  }
}
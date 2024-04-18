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
      }
  }
);
const dynamodbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});


  const { fileId, s3filename, contentType, originFileName} = req.body;

  // The key could include a user-specific identifier to prevent collisions
  const key = `videos/${s3filename}`;
  const jsonKey = `output/${s3filename}.json`;

  const dynamodbParams = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      fileId: { S: fileId }, 
      filename: { S: s3filename}, // 根据实际情况调整
      s3Path: { S: key},
      s3JsonPath: { S: jsonKey},
      videoInfo: { S: originFileName },
    },
  };
  
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });
    console.log('Uploading file to S3:', key);
    console.log('DynamoDB params:', dynamodbParams);
    console.log('S3 command:', command);
    // Set the expiry time of the presigned URL (e.g., 15 minutes)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 9000 });
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
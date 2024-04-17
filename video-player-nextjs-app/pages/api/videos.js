import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const dynamodbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE
  };

  try {
    const data = await dynamodbClient.send(new ScanCommand(params));
    const items = data.Items.map(item => ({
      id: item.fileId.S,
      title: item.videoInfo.S,
      url: `/${item.fileId.S}`,
      imageUrl: item.imageUrl.S,
    }));
    console.log('Fetched videos:', items);
    res.status(200).json(items);
  } catch (err) {
    console.error('Error fetching videos from DynamoDB', err);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
}

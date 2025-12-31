import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class RestaurantsService {
  private docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

  async list() {
    const tableName = process.env.restaurants_table!;
    const limit = Number(process.env.default_results || 8);

    const res = await this.docClient.send(
      new ScanCommand({
        TableName: tableName,
        Limit: limit,
      }),
    );

    return res.Items ?? [];
  }
}

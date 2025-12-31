const path = require('path');
const { Stack, Duration } = require('aws-cdk-lib');
const { Runtime } = require('aws-cdk-lib/aws-lambda');
const { RestApi, LambdaIntegration } = require('aws-cdk-lib/aws-apigateway');
const { NodejsFunction } = require('aws-cdk-lib/aws-lambda-nodejs');

class ApiStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const api = new RestApi(this, `${props.stageName}-MyApi`, {
      deployOptions: { stageName: props.stageName },
    });

    // Nest Lambda (your file: src/lambdas.ts)
    const nestApiFunction = new NodejsFunction(this, 'NestApi', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../src/lambdas.ts'),
      memorySize: 1024,
      timeout: Duration.seconds(30),

      environment: {
        default_results: '8',
        restaurants_table: props.restaurantsTable.tableName,
      },

      bundling: {
        externalModules: [
          'aws-sdk',
          '@nestjs/platform-socket.io',
          '@grpc/grpc-js',
          '@grpc/proto-loader',
          'kafkajs',
          'mqtt',
          'nats',
          'ioredis',
          'amqplib',
          'amqp-connection-manager',
          'redis',
          'cache-manager',
        ],

        commandHooks: {
          afterBundling(inputDir, outputDir) {
            const src = path.join(process.cwd(), 'src', 'static', 'index.html');
            const destDir = path.join(outputDir, 'static');
            const dest = path.join(destDir, 'index.html');

            const s = src.replace(/\\/g, '\\\\');
            const dDir = destDir.replace(/\\/g, '\\\\');
            const d = dest.replace(/\\/g, '\\\\');

            return [
              `node -e "const fs=require('fs'); fs.mkdirSync('${dDir}',{recursive:true}); fs.copyFileSync('${s}','${d}'); console.log('Copied static:', '${s}', '->', '${d}');"`,
            ];
          },
          beforeBundling() {
            return [];
          },
          beforeInstall() {
            return [];
          },
        },
      },
    });

    props.restaurantsTable.grantReadData(nestApiFunction);

    const integration = new LambdaIntegration(nestApiFunction);

    // Same routes as you had before
    api.root.addMethod('GET', integration);
    api.root.addResource('restaurants').addMethod('GET', integration);

    // (Optional) if later you add more endpoints in Nest:
    // api.root.addProxy({ defaultIntegration: integration, anyMethod: true })
  }
}

module.exports = { ApiStack };

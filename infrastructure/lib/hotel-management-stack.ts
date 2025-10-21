import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns'
import * as logs from 'aws-cdk-lib/aws-logs'
import { Construct } from 'constructs'

export class HotelManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // VPC
    const vpc = new ec2.Vpc(this, 'HotelManagementVpc', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 24,
          name: 'isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    })

    // Database Security Group
    const dbSecurityGroup = new ec2.SecurityGroup(
      this,
      'DatabaseSecurityGroup',
      {
        vpc,
        description: 'Security group for RDS database',
        allowAllOutbound: false,
      }
    )

    // RDS PostgreSQL Database
    const database = new rds.DatabaseInstance(this, 'HotelDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [dbSecurityGroup],
      databaseName: 'hotel_management',
      credentials: rds.Credentials.fromGeneratedSecret('postgres', {
        secretName: 'hotel-management-db-credentials',
      }),
      backupRetention: cdk.Duration.days(7),
      deleteAutomatedBackups: false,
      deletionProtection: false, // Set to true for production
      allocatedStorage: 20,
      allowMajorVersionUpgrade: false,
      autoMinorVersionUpgrade: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change to RETAIN for production
    })

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'HotelManagementCluster', {
      vpc,
      containerInsights: true,
    })

    // Application Security Group
    const appSecurityGroup = new ec2.SecurityGroup(this, 'AppSecurityGroup', {
      vpc,
      description: 'Security group for the application',
    })

    // Allow app to connect to database
    dbSecurityGroup.addIngressRule(
      appSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow application to connect to database'
    )

    // Fargate Service
    const fargateService =
      new ecsPatterns.ApplicationLoadBalancedFargateService(
        this,
        'HotelManagementService',
        {
          cluster,
          memoryLimitMiB: 512,
          cpu: 256,
          desiredCount: 1,
          taskImageOptions: {
            image: ecs.ContainerImage.fromRegistry('nginx'), // Replace with your app image
            containerPort: 3000,
            environment: {
              NODE_ENV: 'production',
            },
            secrets: {
              DATABASE_URL: ecs.Secret.fromSecretsManager(
                database.secret!,
                'dsn'
              ),
            },
            logDriver: ecs.LogDrivers.awsLogs({
              streamPrefix: 'hotel-management',
              logRetention: logs.RetentionDays.ONE_WEEK,
            }),
          },
          publicLoadBalancer: true,
          listenerPort: 80,
          securityGroups: [appSecurityGroup],
        }
      )

    // Output the load balancer URL
    new cdk.CfnOutput(this, 'LoadBalancerURL', {
      value: fargateService.loadBalancer.loadBalancerDnsName,
      description: 'Load Balancer URL',
    })

    // Output the database endpoint
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: database.instanceEndpoint.hostname,
      description: 'Database endpoint',
    })
  }
}

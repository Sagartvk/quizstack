/* ============================================================
   QuizStack 2026 — Question Bank (questions.js)
   50 AWS Questions across 10 categories
   ============================================================ */

'use strict';

const QUESTIONS = [
  /* ── EC2 ── */
  { cat:'EC2',        q:'What does EC2 stand for?',
    opts:['Elastic Cloud Compute','Elastic Compute Cloud','Elastic Container Cluster','Extended Compute Cloud'], ans:1 },
  { cat:'EC2',        q:'Which EC2 instance type is best for memory-intensive applications?',
    opts:['C-series','T-series','R-series','G-series'], ans:2 },
  { cat:'EC2',        q:'What is an Amazon Machine Image (AMI)?',
    opts:['A virtual network interface','A pre-configured template for EC2 instances','An auto-scaling policy','A storage snapshot only'], ans:1 },
  { cat:'EC2',        q:'Which EC2 purchasing option offers the greatest cost savings for predictable workloads?',
    opts:['On-Demand','Spot Instances','Reserved Instances','Dedicated Hosts'], ans:2 },
  { cat:'EC2',        q:'What port does SSH use by default?',
    opts:['21','80','443','22'], ans:3 },

  /* ── S3 ── */
  { cat:'S3',         q:'What type of storage does Amazon S3 provide?',
    opts:['Block storage','File storage','Object storage','In-memory storage'], ans:2 },
  { cat:'S3',         q:'What is the maximum size of a single object in S3?',
    opts:['5 GB','5 TB','1 TB','100 GB'], ans:1 },
  { cat:'S3',         q:'Which S3 storage class is best for infrequently accessed data?',
    opts:['S3 Standard','S3 Standard-IA','S3 Glacier','S3 One Zone-IA'], ans:1 },
  { cat:'S3',         q:'What S3 feature serves static websites?',
    opts:['S3 Transfer Acceleration','S3 Static Website Hosting','S3 Cross-Region Replication','S3 Versioning'], ans:1 },
  { cat:'S3',         q:'Which S3 feature protects against accidental deletion?',
    opts:['Lifecycle policies','Replication','Versioning','Encryption'], ans:2 },

  /* ── Lambda ── */
  { cat:'Lambda',     q:'AWS Lambda is an example of which cloud computing model?',
    opts:['IaaS','PaaS','FaaS (Serverless)','CaaS'], ans:2 },
  { cat:'Lambda',     q:'What is the maximum execution timeout for a Lambda function?',
    opts:['5 minutes','10 minutes','15 minutes','30 minutes'], ans:2 },
  { cat:'Lambda',     q:'Lambda functions are triggered by which of the following?',
    opts:['Cron jobs only','Events from AWS services','Manual SSH commands','EC2 health checks'], ans:1 },
  { cat:'Lambda',     q:'What language is NOT natively supported by AWS Lambda?',
    opts:['Python','Node.js','COBOL','Java'], ans:2 },
  { cat:'Lambda',     q:'What is a Lambda "cold start"?',
    opts:['Lambda running in a cold region','Latency when initializing a new function container','Lambda timeout error','Memory allocation failure'], ans:1 },

  /* ── DynamoDB ── */
  { cat:'DynamoDB',   q:'What type of database is Amazon DynamoDB?',
    opts:['Relational SQL database','Graph database','NoSQL key-value/document database','Time-series database'], ans:2 },
  { cat:'DynamoDB',   q:'What is the primary key in DynamoDB?',
    opts:['Only a sort key','A partition key or partition + sort key','A foreign key','An auto-incremented integer'], ans:1 },
  { cat:'DynamoDB',   q:'Which DynamoDB capacity mode charges per request?',
    opts:['Provisioned','Reserved','On-Demand','Free Tier'], ans:2 },
  { cat:'DynamoDB',   q:'DynamoDB Streams captures which events?',
    opts:['Only INSERT events','Only DELETE events','INSERT, MODIFY, and REMOVE events','Only QUERY operations'], ans:2 },
  { cat:'DynamoDB',   q:'What is DynamoDB Global Tables used for?',
    opts:['Storing large files','Multi-region active-active replication','Joining tables with SQL','Scheduled backups only'], ans:1 },

  /* ── API Gateway ── */
  { cat:'API Gateway',q:'What does API Gateway primarily do?',
    opts:['Hosts static websites','Creates and manages APIs at any scale','Stores files in the cloud','Monitors EC2 instances'], ans:1 },
  { cat:'API Gateway',q:'What does CORS stand for?',
    opts:['Cross-Origin Resource Sharing','Cross-Object Routing Service','Cloud Origin Replication System','Content Origin Resolution Standard'], ans:0 },
  { cat:'API Gateway',q:'Which API Gateway type has lower latency and is simpler to configure?',
    opts:['REST API','WebSocket API','HTTP API','GraphQL API'], ans:2 },
  { cat:'API Gateway',q:'What is an API Gateway Stage?',
    opts:['A deployment environment like dev/prod','A pricing tier','An IAM permission level','A cache configuration'], ans:0 },
  { cat:'API Gateway',q:'Which HTTP method is used to create/submit data via API Gateway?',
    opts:['GET','DELETE','PUT','POST'], ans:3 },

  /* ── IAM ── */
  { cat:'IAM',        q:'What does IAM stand for?',
    opts:['Internet Access Manager','Identity and Access Management','Instance Auto Management','Integrated API Module'], ans:1 },
  { cat:'IAM',        q:'What is the principle of least privilege?',
    opts:['Give all users admin access','Grant only the minimum permissions needed','Deny all access by default','Allow root access to all services'], ans:1 },
  { cat:'IAM',        q:'Which IAM entity grants permissions to AWS services (like Lambda)?',
    opts:['IAM User','IAM Group','IAM Role','IAM Policy alone'], ans:2 },
  { cat:'IAM',        q:'IAM policies are written in which format?',
    opts:['XML','YAML','JSON','CSV'], ans:2 },
  { cat:'IAM',        q:'Which AWS credential should NOT be used in application code?',
    opts:['IAM Role credentials','Temporary session tokens','Root account access keys','Instance profile credentials'], ans:2 },

  /* ── CloudFront ── */
  { cat:'CloudFront', q:'What is Amazon CloudFront?',
    opts:['A DNS service','A Content Delivery Network (CDN)','A firewall service','A load balancer'], ans:1 },
  { cat:'CloudFront', q:'CloudFront distributes content via which locations?',
    opts:['Availability Zones','Edge Locations','Data Warehouses','VPC endpoints'], ans:1 },
  { cat:'CloudFront', q:'What is a CloudFront distribution?',
    opts:['A software package manager','A configuration that defines how content is delivered','A billing unit','An IAM permission set'], ans:1 },
  { cat:'CloudFront', q:'What does CloudFront cache invalidation do?',
    opts:['Deletes files from S3','Clears cached content at edge locations','Stops the distribution','Resets IAM roles'], ans:1 },
  { cat:'CloudFront', q:'CloudFront can serve content from which origins?',
    opts:['Only S3','Only EC2','S3, EC2, ALB, and custom HTTP servers','Only Lambda'], ans:2 },

  /* ── VPC ── */
  { cat:'VPC',        q:'What does VPC stand for?',
    opts:['Virtual Private Cloud','Virtual Public Cluster','Verified Private Connection','Virtual Protocol Container'], ans:0 },
  { cat:'VPC',        q:'A Security Group in AWS acts as a:',
    opts:['Firewall at the subnet level','Virtual firewall at the instance level','DNS resolver','Load balancer'], ans:1 },
  { cat:'VPC',        q:'What is a CIDR block used for?',
    opts:['Defining IAM policies','Specifying IP address ranges for VPCs/subnets','Encrypting S3 data','Setting Lambda timeouts'], ans:1 },
  { cat:'VPC',        q:'Which AWS service provides DNS resolution?',
    opts:['AWS CloudFront','Amazon Route 53','AWS Shield','Amazon VPC'], ans:1 },
  { cat:'VPC',        q:'An Internet Gateway allows:',
    opts:['Private subnets to access the internet','Instances in a VPC to communicate with the internet','VPCs to peer with each other','Lambda to access DynamoDB'], ans:1 },

  /* ── CloudWatch / DevOps ── */
  { cat:'CloudWatch', q:'Amazon CloudWatch is used for:',
    opts:['Object storage','Monitoring metrics and logs','DNS management','Container orchestration'], ans:1 },
  { cat:'CloudWatch', q:'What is a CloudWatch Alarm?',
    opts:['An SNS topic','A notification triggered when a metric crosses a threshold','A billing alert only','A Lambda function trigger'], ans:1 },
  { cat:'DevOps',     q:'What does CI/CD stand for?',
    opts:['Cloud Infrastructure / Cloud Deployment','Continuous Integration / Continuous Deployment','Container Integration / Container Delivery','Code Inspection / Code Distribution'], ans:1 },
  { cat:'DevOps',     q:'Which AWS service provides managed CI/CD pipelines?',
    opts:['AWS Batch','AWS CodePipeline','Amazon ECS','AWS Glue'], ans:1 },
  { cat:'DevOps',     q:'What is Infrastructure as Code (IaC)?',
    opts:['Writing code to manage infrastructure via config files','Using a console to create resources manually','Billing your infrastructure monthly','A type of serverless computing'], ans:0 },

  /* ── AWS Core ── */
  { cat:'AWS Core',   q:'What is an AWS Availability Zone?',
    opts:['A global content distribution point','An isolated data center within a region','A pricing tier for AWS services','A type of EC2 instance'], ans:1 },
  { cat:'AWS Core',   q:'Which AWS service is used for sending emails or SMS notifications?',
    opts:['Amazon SES','Amazon SNS','Amazon SQS','Amazon Pinpoint'], ans:1 },
  { cat:'AWS Core',   q:'What is Amazon SQS used for?',
    opts:['Video transcoding','Message queue service for decoupling applications','Real-time chat','File storage'], ans:1 },
  { cat:'AWS Core',   q:'Which AWS service offers managed Kubernetes?',
    opts:['AWS Lambda','Amazon ECS','Amazon EKS','AWS Fargate'], ans:2 },
  { cat:'AWS Core',   q:'What is the AWS Free Tier?',
    opts:['A special EC2 instance type','A set of AWS services available at no charge for 12 months (with limits)','A dedicated support plan','An IAM policy template'], ans:1 },
];

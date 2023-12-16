## IAM role creation

1. IAM > roles > create role
2. custom trust policy > copy + paste

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Service": "ecs-tasks.amazonaws.com"},
      "Action": "sts:AssumeRole"
  }]
}
```

3. Add permission > Create Policy
4. JSON > replace YOUR_REGION_HERE & YOUR_ACCOUNT_ID_HERE & CLUSTER_NAME > copy + paste
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "ssmmessages:CreateControlChannel",
      "ssmmessages:CreateDataChannel",
      "ssmmessages:OpenControlChannel",
      "ssmmessages:OpenDataChannel"
    ],
    "Resource": "*"
  },
    {
      "Effect": "Allow",
      "Action": [
        "logs:DescribeLogGroups"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:DescribeLogStreams",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:YOUR_REGION_HERE:YOUR_ACCOUNT_ID_HERE:log-group:/aws/ecs/CLUSTER_NAME:*"
    }
  ]
}
```

5. Give it a name
6. go back to Add permissions > search by name > check > Next
7. Give a role name > create role


## ECS new task

1. go back to ECS > go to task definition and create a new revision
2. select your new role for "Task role" (different than "Task execution role") > update Task definition
3. go to your service > update > ensure revision is set to latest > finish update of the service
4. current task and it should auto provision your new task with its new role.
5. try again

## Commands I used to exec in

#### Option1

enables execute command

```
CLUSTER_NAME=node-red
REGION=cn-north-1
SERVICE_NAME=service-nodered
CONTAINER=nodered

aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --region $REGION --enable-execute-command --force-new-deployment
```

adds ARN to environment for easier cli. Does assume only 1 task running for the service, otherwise just manually go to ECS and grab arn and set them for your cli

`TASK_ARN=$(aws ecs list-tasks --cluster CLUSTER_NAME --service SERVICE_NAME --region REGION --output text --query 'taskArns[0]')`

TASK_ARN=arn:aws-cn:ecs:cn-north-1:777702137755:task/node-red/417a6af0a8c447f9a57d8e49ba7cc84c

adds ARN to environment for easier cli. Does assume only 1 task running for the service, otherwise just manually go to ECS and grab arn and set them for your cli

`aws ecs describe-tasks --cluster CLUSTER_NAME --region REGION --tasks $TASK_ARN`

exec in
`aws ecs execute-command --region $REGION --cluster $CLUSTER_NAME --task $TASK_ARN --container $CONTAINER --command "sh" --interactive`


#### Option2

if you are using Jetbrains IDE, install plugin https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html

this plugin will help you to enables execute command and exec in


## 参考

https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-exec.html

https://github.com/aws/aws-cli/issues/6242#issuecomment-1079214960

https://issuecloser.com/blog/debugging-node-js-applications-running-on-ecs-fargate

https://zhuanlan.zhihu.com/p/367127434

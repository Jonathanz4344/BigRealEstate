# EC2 Control Lambda
# Provides API endpoints to start/stop/check EC2 instance status from the frontend dashboard

# Build the Lambda source
resource "terraform_data" "ec2_control_bootstrap" {
  triggers_replace = [
    local.ec2_control_lambda_md5
  ]

  provisioner "local-exec" {
    command     = "npm run build"
    working_dir = "${path.module}/lambda/ec2-control"
    interpreter = [local.os == "Windows" ? "PowerShell" : "bash", "-c"]
  }
}

locals {
  ec2_control_lambda_md5 = filemd5("${path.module}/lambda/ec2-control/index.ts")
}

data "archive_file" "ec2_control_zip" {
  type             = "zip"
  source_dir       = "${path.module}/lambda/ec2-control/dist"
  output_file_mode = "0666"
  output_path      = "${path.module}/tmp/lambda/ec2-control.zip"

  depends_on = [terraform_data.ec2_control_bootstrap]
}

# IAM Policy: Allow Lambda to control EC2
data "aws_iam_policy_document" "ec2_control_policy_doc" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ec2_control_lambda_role" {
  name               = "ZLA-EC2-Control-Lambda-Role"
  assume_role_policy = data.aws_iam_policy_document.ec2_control_policy_doc.json
}

resource "aws_iam_role_policy_attachment" "ec2_control_lambda_exec" {
  policy_arn = var.lambda_exec_policy
  role       = aws_iam_role.ec2_control_lambda_role.name
}

resource "aws_iam_role_policy_attachment" "ec2_control_logging" {
  policy_arn = var.cloudwatch_exec_policy
  role       = aws_iam_role.ec2_control_lambda_role.name
}

# Inline policy for EC2 start/stop/describe
resource "aws_iam_role_policy" "ec2_control_permissions" {
  name = "ec2-control-permissions"
  role = aws_iam_role.ec2_control_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:StartInstances",
          "ec2:StopInstances",
          "ec2:DescribeInstances"
        ]
        Resource = "*"
      }
    ]
  })
}

# Lambda Function
resource "aws_lambda_function" "ec2_control_handler" {
  role = aws_iam_role.ec2_control_lambda_role.arn

  function_name    = "ZLAEc2ControlHandler"
  filename         = data.archive_file.ec2_control_zip.output_path
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  timeout          = 15
  source_code_hash = data.archive_file.ec2_control_zip.output_base64sha256

  environment {
    variables = {
      EC2_INSTANCE_ID = aws_instance.backend_server.id
      EC2_REGION      = var.aws_region
    }
  }

  depends_on = [aws_instance.backend_server]
}

# API Gateway Resources - reuse existing API Gateway

resource "aws_api_gateway_resource" "ec2_control_parent" {
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "ec2"
  rest_api_id = aws_api_gateway_rest_api.api.id
}

resource "aws_api_gateway_resource" "ec2_control_action" {
  parent_id   = aws_api_gateway_resource.ec2_control_parent.id
  path_part   = "{action}"
  rest_api_id = aws_api_gateway_rest_api.api.id
}

# OPTIONS method for CORS
resource "aws_api_gateway_method" "ec2_control_cors" {
  authorization = "NONE"
  http_method   = "OPTIONS"
  resource_id   = aws_api_gateway_resource.ec2_control_action.id
  rest_api_id   = aws_api_gateway_rest_api.api.id
}

resource "aws_api_gateway_integration" "ec2_control_cors_integration" {
  resource_id = aws_api_gateway_resource.ec2_control_action.id
  rest_api_id = aws_api_gateway_rest_api.api.id
  http_method = aws_api_gateway_method.ec2_control_cors.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = jsonencode({ statusCode = 200 })
  }

  depends_on = [aws_api_gateway_method.ec2_control_cors]
}

resource "aws_api_gateway_method_response" "ec2_control_cors_200" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.ec2_control_action.id
  http_method = aws_api_gateway_method.ec2_control_cors.http_method

  status_code = 200
  response_models = {
    "application/json" = "Empty"
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }

  depends_on = [aws_api_gateway_method.ec2_control_cors]
}

resource "aws_api_gateway_integration_response" "ec2_control_cors_response" {
  http_method = aws_api_gateway_integration.ec2_control_cors_integration.http_method
  resource_id = aws_api_gateway_resource.ec2_control_action.id
  rest_api_id = aws_api_gateway_rest_api.api.id

  status_code = aws_api_gateway_method_response.ec2_control_cors_200.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [aws_api_gateway_integration.ec2_control_cors_integration, aws_api_gateway_method_response.ec2_control_cors_200]
}

# POST method for controlling EC2
resource "aws_api_gateway_method" "ec2_control_post" {
  authorization = "NONE"
  http_method   = "POST"
  resource_id   = aws_api_gateway_resource.ec2_control_action.id
  rest_api_id   = aws_api_gateway_rest_api.api.id
}

resource "aws_api_gateway_integration" "ec2_control_post_integration" {
  http_method = aws_api_gateway_method.ec2_control_post.http_method
  resource_id = aws_api_gateway_resource.ec2_control_action.id
  rest_api_id = aws_api_gateway_rest_api.api.id

  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_function.ec2_control_handler.invoke_arn

  depends_on = [aws_lambda_function.ec2_control_handler]
}

# GET method for status checks
resource "aws_api_gateway_method" "ec2_control_get" {
  authorization = "NONE"
  http_method   = "GET"
  resource_id   = aws_api_gateway_resource.ec2_control_action.id
  rest_api_id   = aws_api_gateway_rest_api.api.id
}

resource "aws_api_gateway_integration" "ec2_control_get_integration" {
  http_method = aws_api_gateway_method.ec2_control_get.http_method
  resource_id = aws_api_gateway_resource.ec2_control_action.id
  rest_api_id = aws_api_gateway_rest_api.api.id

  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_function.ec2_control_handler.invoke_arn

  depends_on = [aws_lambda_function.ec2_control_handler]
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "ec2_control_permission" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ec2_control_handler.function_name
  principal     = "apigateway.amazonaws.com"
  statement_id  = "AllowEC2ControlExecution"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

# Output the EC2 control endpoint
output "EC2_CONTROL_URL" {
  value = "${aws_api_gateway_deployment.api_deployment.invoke_url}${aws_api_gateway_stage.api_stage.stage_name}/ec2"
}

data "aws_iam_policy_document" "amplify_policy_doc" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["amplify.${var.aws_region}.amazonaws.com", "amplify.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "iam_role" {
  name               = "ZLA-Amplify-Role"
  assume_role_policy = data.aws_iam_policy_document.amplify_policy_doc.json
}

resource "aws_iam_role_policy_attachment" "admin_policy" {
  policy_arn = var.admin_policy
  role       = aws_iam_role.iam_role.name
}

resource "aws_iam_role_policy_attachment" "backend_policy" {
  policy_arn = var.backend_policy
  role       = aws_iam_role.iam_role.name
}

resource "aws_amplify_app" "amplify_app" {
  name         = var.app_name
  repository   = var.repository
  access_token = var.github_token

  build_spec   = file("./build.yml")

  platform                    = "WEB"
  enable_auto_branch_creation = true
  enable_branch_auto_build    = true

  iam_service_role_arn = aws_iam_role.iam_role.arn

  auto_branch_creation_patterns = [
    "*",
    "*/**",
  ]
  environment_variables = {
    Name                      = var.app_name
    Provisioned_by            = "Terraform"
    AMPLIFY_DIFF_DEPLOY       = false
    AMPLIFY_MONOREPO_APP_ROOT = var.app_root

    REACT_APP_ENV              = "PRODUCTION"
    VITE_ENV = "PRODUCTION"


    VITE_API_URL     = "http://${aws_eip.backend_ip.public_ip}:8000"
    VITE_PROXY_API_URL = "${aws_api_gateway_deployment.api_deployment.invoke_url}${aws_api_gateway_stage.api_stage.stage_name}/${aws_api_gateway_resource.api_parent_resource.path_part}"
    VITE_GOOGLE_MAPS_KEY     = var.google_api_key
    VITE_GOOGLE_CLIENT_ID     = var.google_oauth_client_id
    VITE_GOOGLE_REDIRECT_URI     = "postmessage"
    VITE_GOOGLE_SCOPES     = "openid email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.settings.basic"

    VITE_ADMIN_USERNAME    = var.admin_dashboard_username
    VITE_ADMIN_PASSWORD    = var.admin_dashboard_password
    VITE_EC2_CONTROL_URL   = "${aws_api_gateway_deployment.api_deployment.invoke_url}${aws_api_gateway_stage.api_stage.stage_name}/ec2"

  }

  custom_rule {
    source = "</^[^.]+$|\\.(?!(css|gif|ico|jpg|jpeg|js|png|txt|svg|woff|ttf|map|json|pdf)$)([^.]+$)/>"
    status = "200"
    target = "/index.html"
  }
  custom_rule {
    source = "/<*>"
    status = "404"
    target = "/index.html"
  }

  depends_on = [aws_eip.backend_ip, aws_api_gateway_deployment.api_deployment]
}

resource "aws_amplify_branch" "dev_branch" {
  app_id      = aws_amplify_app.amplify_app.id
  branch_name = var.branch_name

  enable_auto_build = true
  framework         = "React"
  stage             = "PRODUCTION"

  depends_on = [aws_amplify_app.amplify_app]
}

resource "null_resource" "trigger_amplify_deployment" {
  depends_on = [aws_amplify_branch.dev_branch]

  # Force this command to be triggered every time this terraform file is ran
  triggers = {
    always_run = "${timestamp()}"
  }

  # The command to be ran
  provisioner "local-exec" {
    command = "aws amplify start-job --app-id ${aws_amplify_app.amplify_app.id} --branch-name ${aws_amplify_branch.dev_branch.branch_name} --job-type RELEASE"
    interpreter = [local.os == "Windows" ? "PowerShell" : "bash", "-c" ]
  }
}

# resource "aws_amplify_domain_association" "domain_name" {
#   app_id                = aws_amplify_app.amplify_app.id
#   domain_name           = var.domain_name
#   wait_for_verification = false

#   sub_domain {
#     branch_name = aws_amplify_branch.dev_branch.branch_name
#     prefix      = ""
#   }

#   depends_on = [aws_amplify_app.amplify_app]
# }

output "UI_URL" {
  value = "https://${var.branch_name}.${aws_amplify_app.amplify_app.id}.amplifyapp.com"
}

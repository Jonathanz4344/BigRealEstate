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

    # REACT_APP_API_ENDPOINT     = ""
    REACT_APP_ENV              = "PRODUCTION"
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

output "invoke_ui" {
  value = "https://${var.branch_name}.${aws_amplify_app.amplify_app.id}.amplifyapp.com"
}

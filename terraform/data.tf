data "external" "os" {
  working_dir = path.module
  program = ["printf", "{\"os\": \"Linux\"}"]
}

data "aws_caller_identity" "current" {}
# S3 bucket for user-uploaded images (lead photos, property images, etc.)
resource "aws_s3_bucket" "uploads" {
  bucket = "zla-uploads-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name = "ZLA-Uploads"
  }
}

# Allow public read so images can be served directly
resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "uploads_public_read" {
  bucket = aws_s3_bucket.uploads.id

  depends_on = [aws_s3_bucket_public_access_block.uploads]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.uploads.arn}/*"
      }
    ]
  })
}

# IAM role for EC2 to write to S3
resource "aws_iam_role" "ec2_s3_role" {
  name = "zla-ec2-s3-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "ec2_s3_write" {
  name = "zla-ec2-s3-write"
  role = aws_iam_role.ec2_s3_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:GetObject"
        ]
        Resource = "${aws_s3_bucket.uploads.arn}/*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_s3_profile" {
  name = "zla-ec2-s3-profile"
  role = aws_iam_role.ec2_s3_role.name
}

# Output the bucket name and URL
output "S3_UPLOADS_BUCKET" {
  value = aws_s3_bucket.uploads.bucket
}

output "S3_UPLOADS_URL" {
  value = "https://${aws_s3_bucket.uploads.bucket}.s3.amazonaws.com"
}

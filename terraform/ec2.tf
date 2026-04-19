resource "aws_security_group" "zla_test" {
  name        = "zla_test"
  description = "Security group for backend EC2"

  # basic https
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # secure https
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # fastapi port
  ingress {
    description = "FastAPI Direct Access"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # ssh
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ami
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# gen ssh key
resource "tls_private_key" "zla_ssh_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# register public key
resource "aws_key_pair" "generated_key" {
  key_name   = "zla-stakeholder-key"
  public_key = tls_private_key.zla_ssh_key.public_key_openssh
}

# save private key
resource "local_file" "private_key_pem" {
  content         = tls_private_key.zla_ssh_key.private_key_pem
  filename        = "${path.module}/zla-stakeholder-key.pem"
  file_permission = "0400"
}

# ec2
resource "aws_instance" "backend_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"
  key_name      = aws_key_pair.generated_key.key_name
  vpc_security_group_ids = [aws_security_group.zla_test.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_s3_profile.name

  # hdd size for docker
  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = {
    Name = "ZLA-Backend-Server"
  }

  user_data = <<-EOF
    #!/bin/bash
    # 1. Update server and install dependencies
    apt-get update -y
    apt-get install -y git docker.io docker-compose

    # 2. start docker and set perms
    systemctl enable --now docker
    usermod -aG docker ubuntu

    # 3. cd and clone repo
    cd /home/ubuntu
    git clone https://${var.github_token}@github.com/zla-llc/BigRealEstate.git
    cd BigRealEstate/ZalaBackend

    # 4. generate the Dockerfile
    cat << 'DOCKERFILE' > Dockerfile
    FROM python:3.11-slim
    WORKDIR /app
    COPY requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt
    COPY . .
    CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
    DOCKERFILE

    # 5. generate docker compose yml
    cat << 'COMPOSE' > docker-compose.yml
    version: '3.8'
    services:
      api:
        build: .
        restart: always
        ports:
          - "8000:8000"
        depends_on:
          - db
        env_file:
          - .env
      db:
        image: postgres:15
        restart: always
        environment:
          POSTGRES_USER: postgresadmin
          POSTGRES_PASSWORD: ${var.db_password}
          POSTGRES_DB: zala
        volumes:
          - postgres_data:/var/lib/postgresql/data
        ports:
          - "5432:5432"
    volumes:
      postgres_data:
    COMPOSE

    # 6. generate .env file
    cat << 'ENVFILE' > .env
    # Database (Notice SQL_HOST is 'db' to connect to the docker container)
    SQL_UNAME=postgresadmin
    SQL_PASSWORD=${var.db_password}
    SQL_HOST=db
    SQL_PORT=5432
    SQL_DBNAME=zala

    # Google Cloud & OAuth
    GOOGLE_API_KEY=${var.google_api_key}
    GOOGLE_TOKEN_ENCRYPTION_KEY=${var.google_token_encryption_key}
    GOOGLE_CLIENT_ID=${var.google_oauth_client_id}
    GOOGLE_CLIENT_SECRET=${var.google_client_secret}
    GOOGLE_REDIRECT_URI=postmessage
    VITE_GOOGLE_REDIRECT_URI=postmessage
    VITE_GOOGLE_SCOPES="openid email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.settings.basic"

    # External APIs
    OPENAI_API_KEY=${var.openai_api_key}
    BRAVE_API_KEY=${var.brave_api_key}
    RAPIDAPI_KEY=${var.rapidapi_key}

    # SMTP Settings
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USERNAME=${var.smtp_username}
    SMTP_PASSWORD=${var.smtp_password}
    SMTP_USE_TLS=true
    SMTP_FROM_EMAIL=${var.smtp_username}
    SMTP_FROM_NAME="Zala CRM"

    # S3 Uploads
    S3_UPLOADS_BUCKET=${aws_s3_bucket.uploads.bucket}
    S3_UPLOADS_REGION=${var.aws_region}
    ENVFILE

    # 7. Boot up backend
    docker-compose up -d --build

    # 8. Wait 15 seconds for PostgreSQL to fully boot up and accept connections
    sleep 15

    # 9. Initialize the Database tables (Notice: NO '-it' flag here!)
    docker exec zalabackend_api_1 python scripts/initialize_db.py

    # 10. Load the Demo Data
    docker exec -e PYTHONPATH=/app zalabackend_api_1 python scripts/load_demo_data.py

    # 11. Fix file ownership
    chown -R ubuntu:ubuntu /home/ubuntu/BigRealEstate
  EOF
}

# elastic ip
resource "aws_eip" "backend_ip" {
  instance = aws_instance.backend_server.id
  tags = {
    Name = "ZLA-Backend-IP"
  }
}

# Output a clickable link to test the live API
output "API_URL" {
  value = "http://${aws_eip.backend_ip.public_ip}:8000"
  # value = "http://${aws_eip.backend_ip.public_ip}:8000/api"
}
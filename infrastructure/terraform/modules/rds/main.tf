variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "db_name" {
  type = string
}

variable "db_username" {
  type = string
}

variable "db_password" {
  type      = string
  sensitive = true
}

resource "aws_db_subnet_group" "main" {
  name       = "pmp-db-subnet-group-${var.environment}"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "PMP DB Subnet Group"
  }
}

resource "aws_security_group" "rds" {
  name        = "pmp-rds-sg-${var.environment}"
  description = "Allow PostgreSQL inbound traffic"
  vpc_id      = var.vpc_id

  ingress {
    description = "PostgreSQL from VPC"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # Restrict to VPC CIDR
  }

  tags = {
    Name = "pmp-rds-sg-${var.environment}"
  }
}

resource "aws_db_instance" "main" {
  identifier        = "pmp-postgres-${var.environment}"
  engine            = "postgres"
  engine_version    = "15.4"
  instance_class    = "db.t3.medium"
  allocated_storage = 20
  storage_type      = "gp3"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az               = true # High Availability
  publicly_accessible    = false
  skip_final_snapshot    = false
  final_snapshot_identifier = "pmp-postgres-final-${var.environment}"
  backup_retention_period = 30 # 30 days backup retention
  deletion_protection     = true

  tags = {
    Name        = "pmp-postgres-${var.environment}"
    Environment = var.environment
  }
}

output "db_endpoint" {
  value = aws_db_instance.main.endpoint
}
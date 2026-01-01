provider "aws" {
  region = "us-east-1"
}

module "vpc" {
  source             = "../../modules/vpc"
  vpc_cidr           = "10.0.0.0/16"
  environment        = "prod"
  availability_zones = ["us-east-1a", "us-east-1b"]
}

module "rds" {
  source             = "../../modules/rds"
  environment        = "prod"
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  db_name            = "pmp_prod"
  db_username        = "pmp_admin"
  db_password        = var.db_password # Injected via variable/secrets
}

module "elasticache" {
  source             = "../../modules/elasticache"
  environment        = "prod"
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
}

module "eks" {
  source             = "../../modules/eks"
  environment        = "prod"
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
}

module "monitoring" {
  source       = "../../modules/monitoring"
  environment  = "prod"
  cluster_name = module.eks.cluster_name
  depends_on   = [module.eks]
}

variable "db_password" {
  type      = string
  sensitive = true
}
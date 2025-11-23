terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ca-central-1"
}

locals {
  domain_name = "openg7-search"
}

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

resource "aws_security_group" "search" {
  name        = "${local.domain_name}-sg"
  description = "Accès restreint au domaine OpenSearch"
  vpc_id      = var.vpc_id

  ingress {
    description = "Pods Strapi"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    security_groups = [var.strapi_security_group_id]
  }

  ingress {
    description = "Workers d'indexation"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = var.indexer_cidr_blocks
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_opensearch_domain" "this" {
  domain_name           = local.domain_name
  engine_version        = "OpenSearch_2.11"
  region                = data.aws_region.current.name

  cluster_config {
    dedicated_master_enabled = true
    dedicated_master_type    = "c6g.large.search"
    dedicated_master_count   = 3
    instance_type            = "m6g.large.search"
    instance_count           = 3
    zone_awareness_enabled   = true
    zone_awareness_config {
      availability_zone_count = 3
    }
    warm_enabled  = false
    cold_storage_options {
      enabled = false
    }
  }

  auto_tune_options {
    desired_state = "ENABLED"
  }

  ebs_options {
    ebs_enabled = true
    iops        = 3000
    volume_size = 200
    volume_type = "gp3"
  }

  encrypt_at_rest {
    enabled = true
  }

  node_to_node_encryption {
    enabled = true
  }

  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "Policy-Min-TLS-1-2-2019-07"
  }

  access_policies = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = [
            "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.indexer_role_name}"
          ]
        }
        Action   = ["es:ESHttp*" ]
        Resource = "arn:aws:es:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:domain/${local.domain_name}/*"
      }
    ]
  })

  snapshot_options {
    automated_snapshot_start_hour = 6
  }

  tags = {
    Project     = "OpenG7"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_dashboard" "search" {
  dashboard_name = "OpenG7-Search"
  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        x    = 0
        y    = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            [ "AWS/ES", "FreeStorageSpace", "DomainName", local.domain_name, "ClientId", data.aws_caller_identity.current.account_id ],
            [ ".", "CPUUtilization", ".", ".", ".", ".", { "yAxis" : "right" } ],
            [ ".", "JVMMemoryPressure", ".", "." ]
          ]
          period = 60
          stat   = "Average"
          title  = "Santé du cluster OpenSearch"
        }
      }
    ]
  })
}

variable "vpc_id" {
  type        = string
  description = "VPC hébergeant le domaine"
}

variable "strapi_security_group_id" {
  type        = string
  description = "Security group des pods Strapi"
}

variable "indexer_cidr_blocks" {
  type        = list(string)
  description = "CIDR autorisés pour les workers d'indexation"
  default     = []
}

variable "indexer_role_name" {
  type        = string
  description = "Nom du rôle IAM utilisé pour signer les requêtes"
}

variable "environment" {
  type        = string
  description = "Environnement (prod, staging, etc.)"
}

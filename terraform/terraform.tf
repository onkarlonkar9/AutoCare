terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

output "load_balancer_url" {
  description = "Public URL for the AutoCare application."
  value       = "http://${aws_lb.app.dns_name}"
}

output "autoscaling_group_name" {
  description = "Auto Scaling Group name."
  value       = aws_autoscaling_group.app.name
}


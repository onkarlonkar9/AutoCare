variable "aws_region" {
  description = "AWS region for the AutoCare infrastructure."
  type        = string
  default     = "ap-south-1"
}

variable "name" {
  description = "Resource name prefix."
  type        = string
  default     = "autocare"
}

variable "vpc_id" {
  description = "VPC where the load balancer and instances will run."
  type        = string
}

variable "public_subnet_ids" {
  description = "At least two public subnet IDs in different availability zones."
  type        = list(string)

  validation {
    condition     = length(var.public_subnet_ids) >= 2
    error_message = "Provide at least two public subnet IDs for the Application Load Balancer."
  }
}

variable "instance_type" {
  description = "EC2 instance type used by the Auto Scaling Group."
  type        = string
  default     = "t3.small"
}

variable "key_name" {
  description = "Optional EC2 key pair name for SSH troubleshooting."
  type        = string
  default     = ""
}

variable "ssh_allowed_cidrs" {
  description = "Optional CIDR blocks allowed to SSH into app instances."
  type        = list(string)
  default     = []
}

variable "repository_url" {
  description = "Public Git repository cloned by each app instance."
  type        = string
  default     = "https://github.com/onkarlonkar9/AutoCare.git"
}

variable "repository_branch" {
  description = "Git branch deployed by each app instance."
  type        = string
  default     = "onkar"
}

variable "ssm_parameter_path" {
  description = "SSM Parameter Store path containing application environment variables."
  type        = string
  default     = "/autocare/prod"
}

variable "min_size" {
  description = "Minimum number of app instances."
  type        = number
  default     = 2
}

variable "max_size" {
  description = "Maximum number of app instances."
  type        = number
  default     = 4
}

variable "desired_capacity" {
  description = "Initial number of app instances."
  type        = number
  default     = 2
}

variable "target_cpu_utilization" {
  description = "Average CPU percentage that triggers target-tracking scaling."
  type        = number
  default     = 60
}

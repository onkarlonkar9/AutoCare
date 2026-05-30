# AutoCare AWS Deployment

This Terraform configuration deploys:

- An internet-facing Application Load Balancer on port `80`
- An Auto Scaling Group spanning at least two public subnets
- Two app instances by default, scaling between `2` and `4`
- CPU target tracking at `60%`
- An EC2 role that reads runtime environment variables from SSM Parameter Store

## Prerequisites

- Terraform `>= 1.5`
- AWS credentials configured locally
- A VPC with at least two public subnets in different availability zones
- MongoDB Atlas network access configured for the app instances

## Store Runtime Configuration

Create SecureString parameters before applying Terraform. Replace the example
values and use a newly rotated MongoDB password and JWT secret.

```sh
aws ssm put-parameter --region ap-south-1 --name /autocare/prod/DATABASE_URL --type SecureString --overwrite --value 'mongodb+srv://...'
aws ssm put-parameter --region ap-south-1 --name /autocare/prod/JWT_SECRET --type SecureString --overwrite --value 'replace-with-a-long-random-secret'
aws ssm put-parameter --region ap-south-1 --name /autocare/prod/CORS_ORIGIN --type String --overwrite --value 'http://your-domain.example'
aws ssm put-parameter --region ap-south-1 --name /autocare/prod/FRONTEND_URL --type String --overwrite --value 'http://your-domain.example'
```

Add optional AI and Google authentication variables under the same path when
those integrations are enabled.

## Deploy

```sh
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your VPC and subnet IDs.
terraform init
terraform plan
terraform apply
```

Terraform prints `load_balancer_url` after the deployment. Instances need a few
minutes to install Docker, build the images, and pass the load balancer health
check.

## Production Notes

- Add an HTTPS listener and ACM certificate before using a production domain.
- The current bill-upload feature stores files in an instance-local Docker
  volume. Move uploads to S3 or EFS before relying on uploads across multiple
  instances.
- Public subnets keep this initial setup compact. A stricter production setup
  should place instances in private subnets with NAT access.


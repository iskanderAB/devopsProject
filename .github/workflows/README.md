# GitHub Workflows Documentation

This repository includes GitHub Actions workflows optimized for Kubernetes deployment:

## Workflows Overview

### 1. CI/CD Pipeline (`ci-cd.yml`)
**Triggers:** Push to main/develop/mp2l-dev branches, Pull requests to main/develop

**Jobs:**
- **test-frontend**: Tests and builds the React frontend (unit tests only)
- **test-backend**: Tests the Node.js backend (unit tests, no database)
- **build-frontend-image**: Builds and pushes Docker image for frontend
- **build-backend-image**: Builds and pushes Docker image for backend
- **security-scan**: Runs Trivy vulnerability scanner
- **deploy**: Basic deployment placeholder (calls Kubernetes deployment)

### 2. Kubernetes Deployment (`kubernetes-deploy.yml`)
**Triggers:** Successful completion of CI/CD Pipeline, Manual dispatch

**Jobs:**
- **deploy-to-kubernetes**: Deploys to Kubernetes cluster
  - Configures kubectl
  - Creates namespaces
  - Deploys applications
  - Runs smoke tests
  - Handles rollback on failure

## Database Strategy

**Important:** This CI/CD pipeline does NOT include database services. The database is managed separately in Kubernetes:

- **Development**: Use Docker Compose with MySQL (see `docker-compose.dev.yml`)
- **Kubernetes**: Database runs as a separate service/pod in the cluster
- **CI/CD**: Only runs unit tests without database dependencies

## Required Secrets

### Docker Hub Integration
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub password or access token

### Kubernetes Integration
Choose one based on your cluster provider:

#### Google Cloud (GKE)
- `KUBECONFIG`: Base64 encoded kubeconfig file

#### AWS (EKS)
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region
- `CLUSTER_NAME`: EKS cluster name

#### Azure (AKS)
- `AZURE_CREDENTIALS`: Azure service principal credentials
- `AZURE_RESOURCE_GROUP`: Resource group name
- `CLUSTER_NAME`: AKS cluster name

### Repository Access
- `GITHUB_TOKEN`: Automatically provided by GitHub (no setup required)

## Configuration Steps

1. **Set up Docker Hub secrets:**
   - Go to your repository Settings → Secrets and variables → Actions
   - Add `DOCKER_USERNAME` with your Docker Hub username
   - Add `DOCKER_PASSWORD` with your Docker Hub password/token

2. **Configure Kubernetes access:**
   - Add the appropriate secrets for your cluster provider (see above)
   - Update the "Configure kubectl" step in `kubernetes-deploy.yml`

3. **Update Docker image names:**
   - Edit the environment variables in both workflow files:
     ```yaml
     env:
       FRONTEND_IMAGE_NAME: your-username/conduit-frontend
       BACKEND_IMAGE_NAME: your-username/conduit-backend
     ```

4. **Create Kubernetes manifests:**
   - Create a `k8s/` directory with your Kubernetes YAML files
   - Update the deployment step in `kubernetes-deploy.yml`

## Kubernetes Manifests Structure

Create these files in a `k8s/` directory:
```
k8s/
├── namespace.yaml
├── mysql/
│   ├── mysql-deployment.yaml
│   ├── mysql-service.yaml
│   ├── mysql-secret.yaml
│   └── mysql-pvc.yaml
├── backend/
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── backend-configmap.yaml
│   └── backend-secret.yaml
├── frontend/
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   └── frontend-ingress.yaml
└── monitoring/
    └── health-check.yaml
```

## Workflow Features

### Optimized for Kubernetes
- **No database in CI**: Tests run without database dependencies
- **Container-first**: Builds and pushes Docker images
- **Environment separation**: Supports staging/production deployments
- **Rollback capability**: Automatic rollback on deployment failure

### Security & Quality
- **Vulnerability scanning**: Trivy security scans
- **Multi-stage builds**: Optimized Docker images with caching
- **Secret management**: Secure handling of credentials

### Deployment Control
- **Manual deployments**: Trigger deployments manually with custom tags
- **Environment selection**: Deploy to staging or production
- **Smoke testing**: Post-deployment health checks
- **Rollback automation**: Automatic rollback on failure

## Branch Strategy

- **main**: Production branch, triggers full CI/CD and deployment to production
- **develop**: Development branch, triggers CI/CD and deployment to staging
- **mp2l-dev**: Feature branch, triggers CI/CD only (no deployment)
- **feature branches**: Should create PRs, triggers validation only

## Development Workflow

1. **Local Development**: Use `docker-compose.dev.yml` for full stack with database
2. **Feature Development**: Work on feature branches, create PR when ready
3. **Integration**: Merge to develop, auto-deploy to staging
4. **Production**: Merge to main, auto-deploy to production

## Manual Deployment

You can manually deploy specific image tags:

1. Go to Actions → Kubernetes Deployment
2. Click "Run workflow"
3. Select environment (staging/production)
4. Enter image tag (or leave empty for latest)
5. Click "Run workflow"

## Monitoring and Health Checks

The workflows include:
- **Build status**: See if images built successfully
- **Deployment status**: Track Kubernetes deployment progress
- **Health checks**: Verify services are responding
- **Rollback logs**: Monitor automatic rollbacks

## Customization for Your Cluster

Update the `kubernetes-deploy.yml` file:

1. **Replace cluster configuration** in the "Configure kubectl" step
2. **Update manifest paths** in the deployment step
3. **Modify health checks** for your specific endpoints
4. **Add custom smoke tests** for your application
5. **Configure notifications** (Slack, Discord, etc.)
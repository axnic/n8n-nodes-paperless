# version_settings() enforces a minimum Tilt version
# https://docs.tilt.dev/api.html#api.version_settings
version_settings(constraint='>=0.22.2')

print("""
-----------------------------------------------------------------
  Welcome to n8n-nodes-paperless-ngx Tilt configuration!
    This Tiltfile is used to play with the n8n-nodes-paperless-ngx
    project and develop it in a easy way.
-----------------------------------------------------------------
""".strip())

# Configure Docker pruning to prevent disk space issues
# - Keeps only 5 builds in total
# - Preserves the 2 most recent builds
docker_prune_settings(num_builds=5, keep_recent=2)

docker_compose('./.devcontainer/docker-compose.yaml')
docker_build(
	'tilt.localhost/n8n:dev',
	'.',
	dockerfile='./.devcontainer/Dockerfile.tilt',
)

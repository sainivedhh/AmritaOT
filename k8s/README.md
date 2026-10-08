# Kubernetes Setup
`kubectl create namespace sentinelot`
`kubectl create secret generic sentinelot-secrets --from-literal=jwt_secret=supersecret -n sentinelot`
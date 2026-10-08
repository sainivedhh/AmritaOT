from src.app import create_app
import os

config_override = None
if os.path.exists('.env'):
    # Basic .env loading for local testing
    with open('.env') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                k, v = line.strip().split('=', 1)
                os.environ[k] = v

app = create_app()

if __name__ == '__main__':
    app.run(port=5000)

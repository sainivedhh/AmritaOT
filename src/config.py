import os

class Config:
    def __init__(self, override_config=None):
        env = override_config or os.environ
        
        self.JWT_SECRET = env.get('JWT_SECRET')
        self.DEVICE_HMAC_SECRET = env.get('DEVICE_HMAC_SECRET')
        self.DB_PATH = env.get('DB_PATH')
        
        if not self.JWT_SECRET or not self.DEVICE_HMAC_SECRET or not self.DB_PATH:
            raise ValueError("Missing required environment variables: JWT_SECRET, DEVICE_HMAC_SECRET, DB_PATH")

def get_config(override=None):
    return Config(override)

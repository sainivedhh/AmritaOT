import os


class Config:
    def __init__(self, override_config=None):
        env = override_config or os.environ

        self.JWT_SECRET = env.get("JWT_SECRET")
        self.DEVICE_HMAC_SECRET = env.get("DEVICE_HMAC_SECRET")
        self.DB_PATH = env.get("DB_PATH")

        if not all(isinstance(value, str) and value for value in (
            self.JWT_SECRET,
            self.DEVICE_HMAC_SECRET,
            self.DB_PATH,
        )):
            raise ValueError("Missing required environment variables: JWT_SECRET, DEVICE_HMAC_SECRET, DB_PATH")

        if len(self.JWT_SECRET.encode("utf-8")) < 32:
            raise ValueError("JWT_SECRET must contain at least 32 bytes")
        if len(self.DEVICE_HMAC_SECRET.encode("utf-8")) < 32:
            raise ValueError("DEVICE_HMAC_SECRET must contain at least 32 bytes")


def get_config(override=None):
    return Config(override)

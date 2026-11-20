#!/usr/bin/env python3
"""Generate AUTH_PASSWORD_RSA_PRIVATE_KEY PEM for .env / Compose."""

from __future__ import annotations

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa


def main() -> None:
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    pem = key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode("utf-8")
    single_line = pem.replace("\n", "\\n")
    print("# Paste into .env (single line with \\n escapes):")
    print(f"AUTH_PASSWORD_RSA_PRIVATE_KEY={single_line}")
    print()
    print("# Or multiline PEM block in Compose / secrets files:")
    print(pem, end="")


if __name__ == "__main__":
    main()

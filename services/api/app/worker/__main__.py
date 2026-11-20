"""python -m app.worker"""

from __future__ import annotations

import asyncio
import logging
import sys


def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        stream=sys.stdout,
    )
    from app.worker.loop import run_worker

    try:
        asyncio.run(run_worker())
    except KeyboardInterrupt:
        logging.getLogger(__name__).info("[worker] stopped")


if __name__ == "__main__":
    main()

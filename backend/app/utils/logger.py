"""
Logging configuration.
Provides a centralized logger setup that can be imported in any module.

Usage:
    from app.utils.logger import get_logger
    _logger = get_logger(__name__)
    _logger.info("Something happened")
"""

import logging
import sys


def get_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    """
    Creates and returns a configured logger instance.
    Uses a consistent format across the entire application.
    """
    logger = logging.getLogger(name)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(level)
        formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(level)

    return logger

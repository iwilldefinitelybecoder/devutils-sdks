"""Retry logic for DevUtils SDK"""

import time
from typing import Callable, Optional, TypeVar, Any
from dataclasses import dataclass

from .error_handler import DevUtilsError

T = TypeVar("T")


@dataclass
class RetryConfig:
    """Configuration for retry logic"""

    max_attempts: int = 3
    initial_delay: float = 1.0
    max_delay: float = 30.0
    backoff_multiplier: float = 2.0
    jitter: bool = True


def is_retryable(error: Any) -> bool:
    """Check if error is retryable"""
    if isinstance(error, DevUtilsError):
        return error.is_retryable()

    retryable_exceptions = (
        TimeoutError,
        ConnectionError,
        OSError,
    )
    return isinstance(error, retryable_exceptions)


def calculate_delay(attempt: int, config: RetryConfig) -> float:
    """Calculate delay for retry attempt"""
    delay = config.initial_delay * (config.backoff_multiplier ** attempt)
    delay = min(delay, config.max_delay)

    if config.jitter:
        import random

        delay = delay * (0.5 + random.random())

    return delay


def sleep(ms: float) -> None:
    """Sleep"""
    time.sleep(ms / 1000)


def retry(
    fn: Callable[[], T], config: Optional[RetryConfig] = None
) -> T:
    """
    Retry a function with exponential backoff

    Args:
        fn: Function to retry
        config: Retry configuration

    Returns:
        Result from function

    Raises:
        DevUtilsError: If all retries fail
    """
    config = config or RetryConfig()
    last_error = None

    for attempt in range(config.max_attempts):
        try:
            return fn()
        except Exception as e:
            last_error = e

            if not is_retryable(e):
                raise

            if attempt < config.max_attempts - 1:
                delay = calculate_delay(attempt, config)
                sleep(delay)

    raise last_error or DevUtilsError("RETRY_FAILED", "All retry attempts failed")


def retry_with_predicate(
    fn: Callable[[], T],
    should_retry: Callable[[Any], bool],
    config: Optional[RetryConfig] = None,
) -> T:
    """
    Retry a function with custom predicate

    Args:
        fn: Function to retry
        should_retry: Function to determine if result should be retried
        config: Retry configuration

    Returns:
        Result from function

    Raises:
        DevUtilsError: If all retries fail
    """
    config = config or RetryConfig()
    last_result = None

    for attempt in range(config.max_attempts):
        try:
            result = fn()

            if not should_retry(result):
                return result

            last_result = result

            if attempt < config.max_attempts - 1:
                delay = calculate_delay(attempt, config)
                sleep(delay)

        except Exception as e:
            if not is_retryable(e):
                raise

            if attempt < config.max_attempts - 1:
                delay = calculate_delay(attempt, config)
                sleep(delay)

    return last_result or DevUtilsError("RETRY_FAILED", "All retry attempts failed")

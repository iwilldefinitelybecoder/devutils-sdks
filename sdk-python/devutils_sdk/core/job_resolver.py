"""Job resolver for async operations"""

import asyncio
from typing import Optional, Dict, Any
from dataclasses import dataclass


@dataclass
class JobResponse:
    """Response from job creation"""

    job_id: str
    status: str
    created_at: str
    expires_at: Optional[str] = None
    result: Optional[Dict[str, Any]] = None


@dataclass
class JobResolverConfig:
    """Configuration for job resolver"""

    poll_interval: int = 1000  # milliseconds
    max_wait_time: int = 300000  # milliseconds (5 minutes)
    timeout: int = 30  # seconds


class JobResolver:
    """Resolves async job results"""

    def __init__(self, config: Optional[JobResolverConfig] = None):
        self.config = config or JobResolverConfig()

    @staticmethod
    def has_job_id(response: Dict[str, Any]) -> bool:
        """Check if response contains job ID"""
        return "job_id" in response or "jobId" in response

    @staticmethod
    def get_job_id(response: Dict[str, Any]) -> str:
        """Extract job ID from response"""
        return response.get("job_id") or response.get("jobId")

    @staticmethod
    def is_job_complete(job_status: str) -> bool:
        """Check if job is complete"""
        return job_status in ("completed", "success", "done")

    @staticmethod
    def is_job_failed(job_status: str) -> bool:
        """Check if job failed"""
        return job_status in ("failed", "error", "cancelled")

    async def resolve(
        self,
        job_id: str,
        get_status_fn,
    ) -> Dict[str, Any]:
        """
        Resolve job result by polling

        Args:
            job_id: Job ID to resolve
            get_status_fn: Async function to get job status

        Returns:
            Job result

        Raises:
            TimeoutError: If job doesn't complete within max_wait_time
        """
        start_time = asyncio.get_event_loop().time()

        while True:
            elapsed = (asyncio.get_event_loop().time() - start_time) * 1000

            if elapsed > self.config.max_wait_time:
                raise TimeoutError(f"Job {job_id} did not complete within {self.config.max_wait_time}ms")

            try:
                status_response = await get_status_fn(job_id)

                if self.is_job_complete(status_response.get("status")):
                    return status_response

                if self.is_job_failed(status_response.get("status")):
                    raise RuntimeError(f"Job {job_id} failed: {status_response.get('error')}")

                await asyncio.sleep(self.config.poll_interval / 1000)

            except Exception as e:
                if isinstance(e, (TimeoutError, RuntimeError)):
                    raise
                await asyncio.sleep(self.config.poll_interval / 1000)

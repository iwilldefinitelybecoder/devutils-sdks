"""Setup configuration for devutils-sdk"""

from setuptools import setup, find_packages

setup(
    name="devutils-sdk",
    version="1.0.0",
    description="Production-grade SDK for DevUtils API",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    author="DevUtils",
    author_email="support@devutils.in",
    url="https://github.com/devutils/sdk-python",
    license="MIT",
    packages=find_packages(),
    python_requires=">=3.8",
    install_requires=[
        "requests>=2.28.0",
        "pydantic>=2.0.0",
        "python-dotenv>=0.21.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-cov>=4.0.0",
            "pytest-asyncio>=0.21.0",
            "black>=23.0.0",
            "isort>=5.12.0",
            "flake8>=6.0.0",
            "mypy>=1.0.0",
            "build>=0.10.0",
            "twine>=4.0.0",
        ],
    },
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
    keywords="devutils screenshot pdf reader webhook api sdk",
    project_urls={
        "Documentation": "https://docs.devutils.in",
        "Source": "https://github.com/devutils/sdk-python",
        "Tracker": "https://github.com/devutils/sdk-python/issues",
    },
)

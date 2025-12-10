#!/usr/bin/env python3
"""
ShaheenEye (SCAR-EYE) - Main Entry Point
From Predicting Crime... to Predicting Crime Evolution
"""

import uvicorn
import asyncio
from pathlib import Path
from loguru import logger
import yaml

# Configure logger
logger.add("logs/shaheeneye.log", rotation="500 MB", level="INFO")

def load_config():
    """Load system configuration"""
    config_path = Path("config/config.yaml")
    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def main():
    """Main entry point"""
    logger.info("🦅 Starting ShaheenEye (SCAR-EYE) System...")
    logger.info("From Predicting Crime... to Predicting Crime Evolution")
    
    # Load configuration
    config = load_config()
    
    # Display startup banner
    banner = """
    ╔══════════════════════════════════════════════════════════╗
    ║                                                          ║
    ║        عين الشاهين - ShaheenEye (SCAR-EYE)            ║
    ║                                                          ║
    ║    From Predicting Crime... to Predicting Crime         ║
    ║                    Evolution                            ║
    ║                                                          ║
    ╚══════════════════════════════════════════════════════════╝
    
    🎯 Core Systems:
       ✓ Hyperspectral Material Fingerprinting
       ✓ Adaptive Illuminance Response
       ✓ Adversarial AI Wargaming
       ✓ Audio-Visual Spatial Correlation
    
    🌐 Starting API Server...
    """
    print(banner)
    
    # Start the API server
    host = config['api']['host']
    port = config['api']['port']
    
    logger.info(f"API Server starting on {host}:{port}")
    
    uvicorn.run(
        "backend.api.main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()

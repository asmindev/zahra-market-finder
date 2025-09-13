import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app
from app.logging import get_logger

logger = get_logger(__name__)


class FileHandler:
    """Utility class for handling file uploads"""

    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

    @staticmethod
    def allowed_file(filename):
        """Check if file has allowed extension"""
        return (
            "." in filename
            and filename.rsplit(".", 1)[1].lower() in FileHandler.ALLOWED_EXTENSIONS
        )

    @staticmethod
    def get_upload_folder():
        """Get upload folder path"""
        upload_folder = os.path.join(
            current_app.root_path, "static", "uploads", "markets"
        )
        os.makedirs(upload_folder, exist_ok=True)
        return upload_folder

    @staticmethod
    def save_file(file):
        """Save uploaded file and return file info"""
        if file and file.filename:
            # Check file size
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)

            if file_size > FileHandler.MAX_FILE_SIZE:
                raise ValueError(
                    f"File size exceeds maximum limit of {FileHandler.MAX_FILE_SIZE / 1024 / 1024}MB"
                )

            # Check file extension
            if not FileHandler.allowed_file(file.filename):
                raise ValueError(
                    "File type not allowed. Allowed types: "
                    + ", ".join(FileHandler.ALLOWED_EXTENSIONS)
                )

            # Generate unique filename
            original_filename = secure_filename(file.filename)
            file_extension = original_filename.rsplit(".", 1)[1].lower()
            unique_filename = f"{uuid.uuid4().hex}.{file_extension}"

            # Save file
            upload_folder = FileHandler.get_upload_folder()
            file_path = os.path.join(upload_folder, unique_filename)
            file.save(file_path)

            # Get relative path for storing in database
            relative_path = os.path.join(
                "static", "uploads", "markets", unique_filename
            )

            logger.info(f"File saved: {original_filename} -> {unique_filename}")

            return {
                "filename": unique_filename,
                "original_filename": original_filename,
                "file_path": relative_path,
                "file_size": file_size,
                "mime_type": file.mimetype,
            }

        return None

    @staticmethod
    def delete_file(file_path):
        """Delete file from filesystem"""
        try:
            full_path = os.path.join(current_app.root_path, file_path)
            if os.path.exists(full_path):
                os.remove(full_path)
                logger.info(f"File deleted: {file_path}")
                return True
            else:
                logger.warning(f"File not found for deletion: {file_path}")
                return False
        except Exception as e:
            logger.error(f"Error deleting file {file_path}: {str(e)}")
            return False

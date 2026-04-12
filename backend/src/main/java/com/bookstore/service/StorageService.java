package com.bookstore.service;

import com.bookstore.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class StorageService {

    private final String uploadDir;
    private final String baseUrl;

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    public StorageService(
            @Value("${app.upload.dir}") String uploadDir,
            @Value("${app.upload.base-url}") String baseUrl) {
        this.uploadDir = uploadDir;
        this.baseUrl = baseUrl;
        initDirectory();
    }

    private void initDirectory() {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Created upload directory: {}", uploadPath.toAbsolutePath());
            }
        } catch (IOException e) {
            log.error("Could not create upload directory", e);
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public String uploadFile(MultipartFile file) {
        validateFile(file);
        return saveFile(file);
    }

    public String uploadFile(MultipartFile file, String subDirectory) {
        validateFile(file);
        return saveFile(file, subDirectory);
    }

    public List<String> uploadMultipleFiles(MultipartFile[] files) {
        return Arrays.stream(files)
                .filter(file -> !file.isEmpty())
                .map(this::uploadFile)
                .toList();
    }

    public void deleteFile(String fileUrl) {
        try {
            String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get(uploadDir, fileName);
            Files.deleteIfExists(filePath);
            log.info("Deleted file: {}", filePath);
        } catch (IOException e) {
            log.error("Could not delete file: {}", fileUrl, e);
        }
    }

    public void deleteFileInSubdirectory(String fileUrl, String subDirectory) {
        try {
            String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get(uploadDir, subDirectory, fileName);
            Files.deleteIfExists(filePath);
            log.info("Deleted file: {}", filePath);
        } catch (IOException e) {
            log.error("Could not delete file: {}", fileUrl, e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File không được để trống");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Kích thước file không được vượt quá 10MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)");
        }
    }

    private String saveFile(MultipartFile file) {
        return saveFile(file, "products");
    }

    private String saveFile(MultipartFile file, String subDirectory) {
        try {
            Path subDirPath = Paths.get(uploadDir, subDirectory);
            if (!Files.exists(subDirPath)) {
                Files.createDirectories(subDirPath);
            }

            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }

            String newFileName = UUID.randomUUID().toString() + fileExtension;
            Path targetPath = subDirPath.resolve(newFileName);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = baseUrl + "/" + subDirectory + "/" + newFileName;
            log.info("Uploaded file: {} -> {}", file.getOriginalFilename(), fileUrl);

            return fileUrl;
        } catch (IOException e) {
            log.error("Could not save file: {}", file.getOriginalFilename(), e);
            throw new BadRequestException("Không thể lưu file: " + e.getMessage());
        }
    }

    public String getUploadDir() {
        return uploadDir;
    }

    public String getBaseUrl() {
        return baseUrl;
    }
}

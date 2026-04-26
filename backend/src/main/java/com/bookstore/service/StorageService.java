package com.bookstore.service;

import com.bookstore.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@Slf4j
public class StorageService {

    private final String uploadDir;
    private final String baseUrl;
    private final Path uploadRoot;

    private static final Map<String, Set<String>> ALLOWED_IMAGE_EXTENSIONS_BY_TYPE = Map.of(
            "image/jpeg", Set.of(".jpg", ".jpeg"),
            "image/jpg", Set.of(".jpg", ".jpeg"),
            "image/png", Set.of(".png"),
            "image/gif", Set.of(".gif"),
            "image/webp", Set.of(".webp")
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final Pattern SAFE_SUBDIRECTORY_PATTERN = Pattern.compile("[A-Za-z0-9_-]+");

    public StorageService(
            @Value("${app.upload.dir}") String uploadDir,
            @Value("${app.upload.base-url}") String baseUrl) {
        this.uploadDir = uploadDir;
        this.baseUrl = baseUrl;
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        initDirectory();
    }

    private void initDirectory() {
        try {
            if (!Files.exists(uploadRoot)) {
                Files.createDirectories(uploadRoot);
                log.info("Created upload directory: {}", uploadRoot);
            }
        } catch (IOException e) {
            log.error("Could not create upload directory", e);
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public String uploadFile(MultipartFile file) {
        return uploadFile(file, "products");
    }

    public String uploadFile(MultipartFile file, String subDirectory) {
        String fileExtension = validateFile(file);
        return saveFile(file, subDirectory, fileExtension);
    }

    public List<String> uploadMultipleFiles(MultipartFile[] files) {
        return java.util.Arrays.stream(files)
                .filter(file -> !file.isEmpty())
                .map(this::uploadFile)
                .toList();
    }

    public void deleteFile(String fileUrl) {
        try {
            Path filePath = resolveStoredFilePath(fileUrl, null);
            Files.deleteIfExists(filePath);
            log.info("Deleted file: {}", filePath);
        } catch (IOException e) {
            log.error("Could not delete file: {}", fileUrl, e);
        }
    }

    public void deleteFileInSubdirectory(String fileUrl, String subDirectory) {
        try {
            Path filePath = resolveStoredFilePath(fileUrl, normalizeSubDirectory(subDirectory));
            Files.deleteIfExists(filePath);
            log.info("Deleted file: {}", filePath);
        } catch (IOException e) {
            log.error("Could not delete file: {}", fileUrl, e);
        }
    }

    private String validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File không được để trống");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Kích thước file không được vượt quá 10MB");
        }

        String contentType = file.getContentType();
        String normalizedContentType = contentType == null ? "" : contentType.toLowerCase(Locale.ROOT);
        Set<String> allowedExtensions = ALLOWED_IMAGE_EXTENSIONS_BY_TYPE.get(normalizedContentType);
        if (allowedExtensions == null) {
            throw new BadRequestException("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)");
        }

        String fileExtension = extractFileExtension(file.getOriginalFilename());
        if (!allowedExtensions.contains(fileExtension)) {
            throw new BadRequestException("Phần mở rộng file không khớp với định dạng ảnh được phép");
        }

        return fileExtension;
    }

    private String saveFile(MultipartFile file, String subDirectory, String fileExtension) {
        try {
            String safeSubDirectory = normalizeSubDirectory(subDirectory);
            Path subDirPath = resolveUploadPath(safeSubDirectory);
            if (!Files.exists(subDirPath)) {
                Files.createDirectories(subDirPath);
            }

            String newFileName = UUID.randomUUID().toString() + fileExtension;
            Path targetPath = subDirPath.resolve(newFileName);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = baseUrl + "/" + safeSubDirectory + "/" + newFileName;
            log.info("Uploaded file: {} -> {}", file.getOriginalFilename(), fileUrl);

            return fileUrl;
        } catch (IOException e) {
            log.error("Could not save file: {}", file.getOriginalFilename(), e);
            throw new BadRequestException("Không thể lưu file: " + e.getMessage());
        }
    }

    private String normalizeSubDirectory(String subDirectory) {
        if (subDirectory == null || subDirectory.isBlank()) {
            throw new BadRequestException("Thư mục upload không hợp lệ");
        }

        String normalized = subDirectory.trim();
        if (!SAFE_SUBDIRECTORY_PATTERN.matcher(normalized).matches()) {
            throw new BadRequestException("Thư mục upload không hợp lệ");
        }

        return normalized;
    }

    private Path resolveUploadPath(String relativePath) {
        Path path = uploadRoot.resolve(relativePath).normalize();
        if (!path.startsWith(uploadRoot)) {
            throw new BadRequestException("Đường dẫn file không hợp lệ");
        }
        return path;
    }

    private Path resolveStoredFilePath(String fileUrl, String expectedSubDirectory) {
        String relativePath = extractRelativeUploadPath(fileUrl).replace("\\", "/");
        if (relativePath.isBlank() || relativePath.startsWith("/") || relativePath.contains("..")) {
            throw new BadRequestException("Đường dẫn file không hợp lệ");
        }

        if (expectedSubDirectory != null && !relativePath.startsWith(expectedSubDirectory + "/")) {
            throw new BadRequestException("File không thuộc thư mục upload được yêu cầu");
        }

        return resolveUploadPath(relativePath);
    }

    private String extractRelativeUploadPath(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new BadRequestException("URL file không hợp lệ");
        }

        String normalizedBaseUrl = baseUrl.replaceAll("/+$", "");
        if (fileUrl.startsWith(normalizedBaseUrl + "/")) {
            return fileUrl.substring(normalizedBaseUrl.length() + 1);
        }

        try {
            URI fileUri = new URI(fileUrl);
            URI baseUri = new URI(normalizedBaseUrl);
            String filePath = fileUri.getPath();
            String basePath = baseUri.getPath();
            if (filePath != null && basePath != null && filePath.startsWith(basePath + "/")) {
                return filePath.substring(basePath.length() + 1);
            }
        } catch (URISyntaxException ignored) {
            // Fall through to relative-path handling below.
        }

        if (!fileUrl.contains("://") && !fileUrl.startsWith("/")) {
            return fileUrl;
        }

        throw new BadRequestException("URL file không thuộc thư mục upload");
    }

    private String extractFileExtension(String originalFileName) {
        if (originalFileName == null || originalFileName.isBlank() || !originalFileName.contains(".")) {
            throw new BadRequestException("File ảnh phải có phần mở rộng hợp lệ");
        }

        String extension = originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase(Locale.ROOT);
        if (extension.contains("/") || extension.contains("\\") || extension.contains("..")) {
            throw new BadRequestException("Tên file không hợp lệ");
        }

        return extension;
    }

    public String getUploadDir() {
        return uploadDir;
    }

    public String getBaseUrl() {
        return baseUrl;
    }
}

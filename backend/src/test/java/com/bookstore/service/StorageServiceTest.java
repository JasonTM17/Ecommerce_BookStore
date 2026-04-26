package com.bookstore.service;

import com.bookstore.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class StorageServiceTest {

    @TempDir
    Path uploadDir;

    @Test
    void uploadFileSavesInsideRequestedSubdirectory() throws Exception {
        StorageService storageService = new StorageService(
                uploadDir.toString(),
                "http://localhost:8080/api/uploads");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "cover.jpg",
                "image/jpeg",
                new byte[] {1, 2, 3});

        String url = storageService.uploadFile(file, "products");

        assertTrue(url.startsWith("http://localhost:8080/api/uploads/products/"));
        assertEquals(1, Files.list(uploadDir.resolve("products")).count());
    }

    @Test
    void uploadFileRejectsMismatchedExtensionAndMimeType() {
        StorageService storageService = new StorageService(
                uploadDir.toString(),
                "http://localhost:8080/api/uploads");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "cover.svg",
                "image/png",
                new byte[] {1, 2, 3});

        assertThrows(BadRequestException.class, () -> storageService.uploadFile(file, "products"));
    }

    @Test
    void uploadFileRejectsUnsafeSubdirectory() {
        StorageService storageService = new StorageService(
                uploadDir.toString(),
                "http://localhost:8080/api/uploads");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "cover.png",
                "image/png",
                new byte[] {1, 2, 3});

        assertThrows(BadRequestException.class, () -> storageService.uploadFile(file, "../outside"));
    }

    @Test
    void deleteFileRejectsTraversalOutsideUploadRoot() {
        StorageService storageService = new StorageService(
                uploadDir.toString(),
                "http://localhost:8080/api/uploads");

        assertThrows(
                BadRequestException.class,
                () -> storageService.deleteFile("http://localhost:8080/api/uploads/../secrets.txt"));
    }
}

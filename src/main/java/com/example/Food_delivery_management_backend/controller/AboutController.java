package com.example.Food_delivery_management_backend.controller;

import com.example.Food_delivery_management_backend.entity.AboutContent;
import com.example.Food_delivery_management_backend.entity.AboutGalleryItem;
import com.example.Food_delivery_management_backend.service.AboutService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/about")
public class AboutController {

    private final AboutService aboutService;

    public AboutController(AboutService aboutService) {
        this.aboutService = aboutService;
    }

    /* ===== CONTENT ===== */

    @GetMapping("/content/{restaurantId}")
    public ResponseEntity<?> getContent(@PathVariable Long restaurantId) {
        AboutContent c = aboutService.getContent(restaurantId);
        if (c == null) return ResponseEntity.ok(Map.of());
        return ResponseEntity.ok(c);
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @PutMapping("/content/{restaurantId}")
    public ResponseEntity<?> saveContent(@PathVariable Long restaurantId, @RequestBody Map<String, String> body) {
        try {
            AboutContent c = aboutService.saveContent(restaurantId, body);
            return ResponseEntity.ok(c);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /* ===== GALLERY ===== */

    @GetMapping("/gallery/{restaurantId}")
    public ResponseEntity<List<AboutGalleryItem>> getGallery(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(aboutService.getGallery(restaurantId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @PostMapping("/gallery/{restaurantId}")
    public ResponseEntity<?> addGalleryItem(@PathVariable Long restaurantId, @RequestBody Map<String, Object> body) {
        try {
            String imageUrl = (String) body.get("imageUrl");
            String caption = (String) body.get("caption");
            String category = (String) body.get("category");
            Integer displayOrder = body.get("displayOrder") != null ? ((Number) body.get("displayOrder")).intValue() : 0;
            AboutGalleryItem item = aboutService.addGalleryItem(restaurantId, imageUrl, caption, category, displayOrder);
            return ResponseEntity.status(HttpStatus.CREATED).body(item);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @PutMapping("/gallery/item/{id}")
    public ResponseEntity<?> updateGalleryItem(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            String imageUrl = (String) body.get("imageUrl");
            String caption = (String) body.get("caption");
            String category = (String) body.get("category");
            Integer displayOrder = body.get("displayOrder") != null ? ((Number) body.get("displayOrder")).intValue() : null;
            AboutGalleryItem item = aboutService.updateGalleryItem(id, imageUrl, caption, category, displayOrder);
            return ResponseEntity.ok(item);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    @DeleteMapping("/gallery/item/{id}")
    public ResponseEntity<?> deleteGalleryItem(@PathVariable Long id) {
        try {
            aboutService.deleteGalleryItem(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}

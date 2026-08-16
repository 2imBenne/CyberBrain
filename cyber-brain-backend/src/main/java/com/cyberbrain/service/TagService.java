package com.cyberbrain.service;

import com.cyberbrain.dto.PageResponse;
import com.cyberbrain.dto.request.TagRequest;
import com.cyberbrain.dto.response.DocumentSummary;
import com.cyberbrain.dto.response.TagResponse;
import com.cyberbrain.entity.Tag;
import com.cyberbrain.exception.ApiException;
import com.cyberbrain.exception.ResourceNotFoundException;
import com.cyberbrain.repository.TagRepository;
import com.cyberbrain.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final DocumentService documentService;

    @Transactional(readOnly = true)
    public List<TagResponse> list() {
        return tagRepository.findAllWithCount().stream()
                .map(TagResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TagResponse getBySlug(String slug) {
        return tagRepository.findAllWithCount().stream()
                .filter(view -> slug.equals(view.getSlug()))
                .map(TagResponse::from)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Tag", slug));
    }

    @Transactional(readOnly = true)
    public PageResponse<DocumentSummary> documentsByTag(String slug, int page, int size,
                                                        Authentication authentication) {
        tagRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Tag", slug));
        return documentService.list(page, size, slug, "new", authentication, false);
    }

    @Transactional
    public TagResponse create(TagRequest request) {
        String name = request.name().trim();
        if (tagRepository.existsByName(name)) {
            throw new ApiException(HttpStatus.CONFLICT, "Tag đã tồn tại: " + name);
        }
        Tag tag = Tag.builder()
                .name(name)
                .slug(uniqueSlug(SlugUtils.slugify(name)))
                .color(request.color() == null ? "#00d4ff" : request.color())
                .icon(request.icon())
                .parent(resolveParent(request.parentId()))
                .build();
        return TagResponse.from(findViewById(tagRepository.save(tag).getId()));
    }

    @Transactional
    public TagResponse update(Long id, TagRequest request) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag", id));
        if (request.name() != null && !request.name().isBlank()) {
            tag.setName(request.name().trim());
            tag.setSlug(uniqueSlug(SlugUtils.slugify(tag.getName())));
        }
        if (request.color() != null) {
            tag.setColor(request.color());
        }
        if (request.icon() != null) {
            tag.setIcon(request.icon());
        }
        if (request.parentId() != null) {
            if (request.parentId().equals(id)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Tag không thể là cha của chính nó");
            }
            tag.setParent(resolveParent(request.parentId()));
        }
        return TagResponse.from(findViewById(tag.getId()));
    }

    @Transactional
    public void delete(Long id) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag", id));
        tagRepository.delete(tag);
    }

    private Tag resolveParent(Long parentId) {
        if (parentId == null) {
            return null;
        }
        return tagRepository.findById(parentId)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "parentId không tồn tại"));
    }

    private String uniqueSlug(String base) {
        String slug = base;
        int counter = 2;
        while (tagRepository.existsBySlug(slug)) {
            slug = base + "-" + counter++;
        }
        return slug;
    }

    private com.cyberbrain.dto.projection.TagWithCountView findViewById(Long id) {
        return tagRepository.findAllWithCount().stream()
                .filter(view -> id.equals(view.getId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Tag", id));
    }
}

package com.cyberbrain.service;

import com.cyberbrain.dto.request.DocumentRequest;
import com.cyberbrain.dto.PageResponse;
import com.cyberbrain.dto.response.BookmarkToggleResponse;
import com.cyberbrain.dto.response.DocumentResponse;
import com.cyberbrain.dto.response.DocumentSummary;
import com.cyberbrain.entity.Bookmark;
import com.cyberbrain.entity.BookmarkId;
import com.cyberbrain.entity.Document;
import com.cyberbrain.entity.ReadingHistory;
import com.cyberbrain.entity.Role;
import com.cyberbrain.entity.Tag;
import com.cyberbrain.entity.User;
import com.cyberbrain.exception.ApiException;
import com.cyberbrain.exception.ResourceNotFoundException;
import com.cyberbrain.repository.BookmarkRepository;
import com.cyberbrain.repository.DocumentRepository;
import com.cyberbrain.repository.ReadingHistoryRepository;
import com.cyberbrain.repository.TagRepository;
import com.cyberbrain.security.AuthenticatedUserResolver;
import com.cyberbrain.util.SlugUtils;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final TagRepository tagRepository;
    private final ReadingHistoryRepository readingHistoryRepository;
    private final BookmarkRepository bookmarkRepository;
    private final MarkdownService markdownService;
    private final AuthenticatedUserResolver userResolver;

    @Transactional
    public DocumentResponse create(DocumentRequest request) {
        User author = userResolver.currentUser();
        Document document = Document.builder()
                .title(request.title())
                .slug(uniqueSlug(SlugUtils.slugify(request.title())))
                .content(request.content())
                .contentHtml(markdownService.render(request.content()))
                .summary(request.summary())
                .author(author)
                .isPublished(Boolean.TRUE.equals(request.isPublished()))
                .tags(resolveTags(request.tagIds()))
                .build();
        return DocumentResponse.from(documentRepository.save(document));
    }

    @Transactional(readOnly = true)
    public PageResponse<DocumentSummary> list(int page, int size, String tagSlug, String sort,
                                              Authentication authentication, boolean mineOnly) {
        User currentUser = userResolver.isAuthenticated(authentication)
                ? userResolver.currentUser(authentication) : null;

        Specification<Document> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("deletedAt")));
            if (mineOnly && currentUser != null) {
                predicates.add(cb.equal(root.get("author").get("id"), currentUser.getId()));
            } else if (currentUser != null) {
                predicates.add(cb.or(
                        cb.equal(root.get("isPublished"), true),
                        cb.equal(root.get("author").get("id"), currentUser.getId())));
            } else {
                predicates.add(cb.equal(root.get("isPublished"), true));
            }
            if (tagSlug != null && !tagSlug.isBlank()) {
                predicates.add(cb.equal(root.join("tags").get("slug"), tagSlug));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Pageable pageable = PageRequest.of(Math.max(page, 0), clamp(size, 1, 50), resolveSort(sort));
        Page<Document> result = documentRepository.findAll(spec, pageable);
        return PageResponse.from(result.map(DocumentSummary::from));
    }

    @Transactional
    public DocumentResponse getBySlug(String slug, Authentication authentication) {
        Document document = documentRepository.findBySlugAndDeletedAtIsNull(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Document", slug));
        documentRepository.incrementViewCount(document.getId());
        document.setViewCount(document.getViewCount() + 1);

        if (userResolver.isAuthenticated(authentication)) {
            User user = userResolver.currentUser(authentication);
            readingHistoryRepository.save(ReadingHistory.builder()
                    .user(user)
                    .document(document)
                    .readAt(LocalDateTime.now())
                    .build());
        }
        return DocumentResponse.from(document);
    }

    @Transactional
    public DocumentResponse update(Long id, DocumentRequest request) {
        Document document = loadOwnedDocument(id);
        document.setTitle(request.title());
        document.setContent(request.content());
        document.setContentHtml(markdownService.render(request.content()));
        if (request.summary() != null) {
            document.setSummary(request.summary());
        }
        if (request.isPublished() != null) {
            document.setPublished(Boolean.TRUE.equals(request.isPublished()));
        }
        if (request.tagIds() != null) {
            document.setTags(resolveTags(request.tagIds()));
        }
        return DocumentResponse.from(document);
    }

    @Transactional
    public void softDelete(Long id) {
        Document document = loadOwnedDocument(id);
        documentRepository.softDelete(document.getId());
    }

    @Transactional
    public DocumentResponse setPublished(Long id, boolean published) {
        Document document = loadOwnedDocument(id);
        document.setPublished(published);
        return DocumentResponse.from(document);
    }

    @Transactional
    public DocumentSummary setTags(Long id, List<Long> tagIds) {
        Document document = loadOwnedDocument(id);
        document.setTags(resolveTags(tagIds));
        return DocumentSummary.from(document);
    }

    @Transactional
    public BookmarkToggleResponse toggleBookmark(Long documentId) {
        User user = userResolver.currentUser();
        Document document = documentRepository.findByIdAndDeletedAtIsNull(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId));
        BookmarkId bookmarkId = new BookmarkId(user.getId(), document.getId());
        return bookmarkRepository.findById(bookmarkId)
                .map(existing -> {
                    bookmarkRepository.delete(existing);
                    return new BookmarkToggleResponse(false);
                })
                .orElseGet(() -> {
                    bookmarkRepository.save(Bookmark.builder()
                            .id(bookmarkId)
                            .user(user)
                            .document(document)
                            .createdAt(LocalDateTime.now())
                            .build());
                    return new BookmarkToggleResponse(true);
                });
    }

    @Transactional
    public DocumentResponse clone(Long id) {
        User currentUser = userResolver.currentUser();
        Document source = documentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id));

        boolean isOwner = source.getAuthor() != null && source.getAuthor().getId().equals(currentUser.getId());
        if (!isOwner && currentUser.getRole() != Role.ADMIN && !source.isPublished()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Không thể sao chép tài liệu riêng tư của người khác");
        }

        String newTitle = "[Bản sao] " + source.getTitle();
        Document clonedDoc = Document.builder()
                .title(newTitle)
                .slug(uniqueSlug(SlugUtils.slugify(newTitle)))
                .content(source.getContent())
                .contentHtml(source.getContentHtml())
                .summary(source.getSummary())
                .author(currentUser)
                .isPublished(false)
                .tags(new ArrayList<>(source.getTags()))
                .build();

        return DocumentResponse.from(documentRepository.save(clonedDoc));
    }

    private Document loadOwnedDocument(Long id) {
        Document document = documentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id));
        User user = userResolver.currentUser();
        boolean isOwner = document.getAuthor() != null && document.getAuthor().getId().equals(user.getId());
        if (!isOwner && user.getRole() != Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Chỉ author hoặc ADMIN mới được thao tác tài liệu này");
        }
        return document;
    }

    private List<Tag> resolveTags(List<Long> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return new ArrayList<>();
        }
        List<Long> distinctIds = tagIds.stream().distinct().toList();
        List<Tag> tags = tagRepository.findAllById(distinctIds);
        if (tags.size() != distinctIds.size()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Có tagId không tồn tại");
        }
        return tags;
    }

    private String uniqueSlug(String base) {
        String slug = base;
        int counter = 2;
        while (documentRepository.existsBySlug(slug)) {
            slug = base + "-" + counter++;
        }
        return slug;
    }

    private Sort resolveSort(String sort) {
        return switch (sort == null ? "new" : sort) {
            case "views" -> Sort.by(Sort.Direction.DESC, "viewCount");
            case "title" -> Sort.by(Sort.Direction.ASC, "title");
            case "old" -> Sort.by(Sort.Direction.ASC, "createdAt");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }
}

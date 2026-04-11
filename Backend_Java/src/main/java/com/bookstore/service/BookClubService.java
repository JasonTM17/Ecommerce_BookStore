package com.bookstore.service;

import com.bookstore.dto.response.BookClubResponse;
import com.bookstore.entity.*;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookClubService {

    private final BookClubRepository clubRepository;
    private final BookClubMemberRepository memberRepository;
    private final BookDiscussionRepository discussionRepository;
    private final ProductRepository productRepository;

    @Transactional
    public BookClubResponse createClub(String name, String description, User owner) {
        BookClub club = clubRepository.save(BookClub.builder()
                .name(name).description(description).owner(owner).memberCount(1).isPublic(true).isActive(true).build());

        memberRepository.save(BookClubMember.builder().club(club).user(owner).role(BookClubRole.OWNER).build());
        log.info("Book club '{}' created by {}", name, owner.getEmail());
        return mapToResponse(club);
    }

    @Transactional(readOnly = true)
    public Page<BookClubResponse> getPublicClubs(Pageable pageable) {
        return clubRepository.findByIsActiveTrueAndIsPublicTrueOrderByCreatedAtDesc(pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public BookClubResponse getClub(Long id) {
        BookClub club = clubRepository.findByIdAndIsActiveTrue(id).orElse(null);
        if (club == null) throw new ResourceNotFoundException("BookClub", "id", id);
        return mapToResponse(club);
    }

    @Transactional
    public void joinClub(Long clubId, User user) {
        BookClub club = clubRepository.findByIdAndIsActiveTrue(clubId).orElse(null);
        if (club == null) throw new ResourceNotFoundException("BookClub", "id", clubId);
        if (memberRepository.existsByClubIdAndUser(clubId, user)) throw new BadRequestException("Bạn đã tham gia club này rồi");

        memberRepository.save(BookClubMember.builder().club(club).user(user).role(BookClubRole.MEMBER).build());
        club.setMemberCount(club.getMemberCount() + 1);
        clubRepository.save(club);
        log.info("User {} joined club {}", user.getEmail(), club.getName());
    }

    @Transactional
    public void leaveClub(Long clubId, User user) {
        var member = memberRepository.findByClubIdAndUser(clubId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Member", "clubId", clubId));
        if (member.getRole() == BookClubRole.OWNER) throw new BadRequestException("Chủ club không thể rời club");

        BookClub club = member.getClub();
        memberRepository.delete(member);
        club.setMemberCount(Math.max(0, club.getMemberCount() - 1));
        clubRepository.save(club);
    }

    @Transactional(readOnly = true)
    public List<BookClubResponse.BookClubMemberResponse> getMembers(Long clubId) {
        return memberRepository.findByClubId(clubId).stream().map(this::mapMemberToResponse).collect(Collectors.toList());
    }

    private BookClubResponse mapToResponse(BookClub club) {
        return BookClubResponse.builder()
                .id(club.getId()).name(club.getName()).description(club.getDescription())
                .coverImage(club.getCoverImage()).ownerName(club.getOwner().getFullName())
                .currentBookId(club.getCurrentBook() != null ? club.getCurrentBook().getId() : null)
                .currentBookTitle(club.getCurrentBook() != null ? club.getCurrentBook().getName() : null)
                .memberCount(club.getMemberCount()).isPublic(club.getIsPublic())
                .createdAt(club.getCreatedAt()).build();
    }

    private BookClubResponse.BookClubMemberResponse mapMemberToResponse(BookClubMember m) {
        return BookClubResponse.BookClubMemberResponse.builder()
                .id(m.getId()).userId(m.getUser().getId()).userName(m.getUser().getFullName())
                .role(m.getRole()).joinedAt(m.getJoinedAt()).build();
    }
}

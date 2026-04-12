package com.bookstore.service;

import com.bookstore.dto.request.LoginRequest;
import com.bookstore.dto.request.RefreshTokenRequest;
import com.bookstore.dto.request.RegisterRequest;
import com.bookstore.dto.request.UserUpdateRequest;
import com.bookstore.dto.response.AuthResponse;
import com.bookstore.dto.response.UserResponse;
import com.bookstore.entity.RefreshToken;
import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ConflictException;
import com.bookstore.repository.CartRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.JwtTokenProvider;
import com.bookstore.support.TestFixtures;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = TestFixtures.customerUser();
        registerRequest = TestFixtures.registerRequest();
        loginRequest = TestFixtures.loginRequest();
    }

    private void stubRefreshTokenCreate(String token) {
        RefreshToken rt = TestFixtures.refreshTokenFor(testUser, token);
        when(refreshTokenService.createRefreshToken(any(User.class), eq("Web Browser"), isNull()))
                .thenReturn(rt);
    }

    @Test
    @DisplayName("register: creates user, cart, and returns tokens")
    void register_success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(cartRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(jwtTokenProvider.generateToken(any(User.class))).thenReturn("accessToken");
        when(jwtTokenProvider.getExpirationTime()).thenReturn(86400000L);
        stubRefreshTokenCreate("refreshToken");

        AuthResponse response = authService.register(registerRequest);

        assertThat(response.getAccessToken()).isEqualTo("accessToken");
        assertThat(response.getRefreshToken()).isEqualTo("refreshToken");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getUser()).isNotNull();
        assertThat(response.getUser().getEmail()).isEqualTo("test@example.com");

        verify(userRepository).existsByEmail("test@example.com");
        verify(passwordEncoder).encode("Password123!");
        verify(userRepository).save(any(User.class));
        verify(cartRepository).save(any());
        verify(refreshTokenService).createRefreshToken(any(User.class), eq("Web Browser"), isNull());
    }

    @Test
    @DisplayName("register: rejects duplicate email")
    void register_emailAlreadyExists() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(ConflictException.class);

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("login: returns tokens after successful authentication")
    void login_success() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(testUser);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtTokenProvider.generateToken(any(Authentication.class))).thenReturn("accessToken");
        when(jwtTokenProvider.getExpirationTime()).thenReturn(86400000L);
        stubRefreshTokenCreate("refreshToken");

        AuthResponse response = authService.login(loginRequest);

        assertThat(response.getAccessToken()).isEqualTo("accessToken");
        assertThat(response.getRefreshToken()).isEqualTo("refreshToken");
        assertThat(response.getUser().getEmail()).isEqualTo("test@example.com");

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(refreshTokenService).createRefreshToken(eq(testUser), eq("Web Browser"), isNull());
    }

    @Test
    @DisplayName("refreshToken: issues new access and refresh tokens")
    void refreshToken_success() {
        RefreshToken stored = TestFixtures.refreshTokenFor(testUser, "oldRt");
        RefreshToken rotated = TestFixtures.refreshTokenFor(testUser, "newRt");
        when(refreshTokenService.verifyToken("oldRt")).thenReturn(stored);
        when(refreshTokenService.rotateToken(eq("oldRt"), eq("Web Browser"), isNull()))
                .thenReturn(rotated);
        when(jwtTokenProvider.generateToken(testUser)).thenReturn("newAccess");
        when(jwtTokenProvider.getExpirationTime()).thenReturn(86400000L);

        RefreshTokenRequest req = RefreshTokenRequest.builder()
                .refreshToken("oldRt")
                .build();

        AuthResponse response = authService.refreshToken(req);

        assertThat(response.getAccessToken()).isEqualTo("newAccess");
        assertThat(response.getRefreshToken()).isEqualTo("newRt");
    }

    @Test
    @DisplayName("refreshToken: rejects when user is inactive")
    void refreshToken_inactiveUser() {
        User inactive = User.builder()
                .id(2L)
                .email("x@y.com")
                .isActive(false)
                .roles(new HashSet<>(Set.of(Role.CUSTOMER)))
                .build();
        RefreshToken stored = TestFixtures.refreshTokenFor(inactive, "rt");
        when(refreshTokenService.verifyToken("rt")).thenReturn(stored);

        RefreshTokenRequest req = RefreshTokenRequest.builder().refreshToken("rt").build();

        assertThatThrownBy(() -> authService.refreshToken(req))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    @DisplayName("changePassword: updates password and revokes refresh tokens")
    void changePassword_success() {
        when(passwordEncoder.matches("oldPass", testUser.getPassword())).thenReturn(true);
        when(passwordEncoder.matches("newPass", testUser.getPassword())).thenReturn(false);
        when(passwordEncoder.encode("newPass")).thenReturn("newEncoded");
        when(userRepository.save(testUser)).thenReturn(testUser);

        authService.changePassword(testUser, "oldPass", "newPass");

        verify(refreshTokenService).revokeAllUserTokens(testUser);
        verify(userRepository).save(testUser);
        assertThat(testUser.getPassword()).isEqualTo("newEncoded");
    }

    @Test
    @DisplayName("changePassword: rejects wrong current password")
    void changePassword_wrongCurrent() {
        when(passwordEncoder.matches("wrong", testUser.getPassword())).thenReturn(false);

        assertThatThrownBy(() -> authService.changePassword(testUser, "wrong", "newPass"))
                .isInstanceOf(BadRequestException.class);

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("updateProfile: rejects email already used by another account")
    void updateProfile_emailConflict() {
        UserUpdateRequest req = UserUpdateRequest.builder()
                .email("taken@example.com")
                .build();
        when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.updateProfile(testUser, req))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    @DisplayName("updateProfile: allows keeping same email")
    void updateProfile_sameEmail() {
        UserUpdateRequest req = UserUpdateRequest.builder()
                .email(testUser.getEmail())
                .firstName("Updated")
                .build();
        when(userRepository.save(testUser)).thenReturn(testUser);

        UserResponse response = authService.updateProfile(testUser, req);

        assertThat(response.getFirstName()).isEqualTo("Updated");
    }

    @Test
    @DisplayName("getCurrentUser maps entity to response")
    void getCurrentUser() {
        UserResponse response = authService.getCurrentUser(testUser);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        assertThat(response.getFullName()).isEqualTo("Test User");
        assertThat(response.getRoles()).contains("CUSTOMER");
    }

    @Test
    @DisplayName("logout revokes refresh token")
    void logout() {
        authService.logout("some-refresh-token");
        verify(refreshTokenService).revokeToken("some-refresh-token");
    }
}

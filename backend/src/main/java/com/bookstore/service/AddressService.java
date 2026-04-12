package com.bookstore.service;

import com.bookstore.dto.request.AddressRequest;
import com.bookstore.dto.response.AddressResponse;
import com.bookstore.entity.Address;
import com.bookstore.entity.User;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;

    @Transactional
    public AddressResponse createAddress(User user, AddressRequest request) {
        if (request.getIsDefault() != null && request.getIsDefault()) {
            addressRepository.clearDefaultForUser(user.getId());
        }

        Address address = Address.builder()
                .user(user)
                .receiverName(request.getReceiverName())
                .phoneNumber(request.getPhoneNumber())
                .province(request.getProvince())
                .district(request.getDistrict())
                .ward(request.getWard())
                .streetAddress(request.getStreetAddress())
                .postalCode(request.getPostalCode())
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
                .addressType(request.getAddressType() != null ? request.getAddressType() : "HOME")
                .build();

        address = addressRepository.save(address);
        return mapToAddressResponse(address);
    }

    @Transactional
    public AddressResponse updateAddress(User user, Long addressId, AddressRequest request) {
        Address address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        if (request.getIsDefault() != null && request.getIsDefault() && !address.getIsDefault()) {
            addressRepository.clearDefaultForUser(user.getId());
        }

        if (request.getReceiverName() != null) address.setReceiverName(request.getReceiverName());
        if (request.getPhoneNumber() != null) address.setPhoneNumber(request.getPhoneNumber());
        if (request.getProvince() != null) address.setProvince(request.getProvince());
        if (request.getDistrict() != null) address.setDistrict(request.getDistrict());
        if (request.getWard() != null) address.setWard(request.getWard());
        if (request.getStreetAddress() != null) address.setStreetAddress(request.getStreetAddress());
        if (request.getPostalCode() != null) address.setPostalCode(request.getPostalCode());
        if (request.getIsDefault() != null) address.setIsDefault(request.getIsDefault());
        if (request.getAddressType() != null) address.setAddressType(request.getAddressType());

        address = addressRepository.save(address);
        return mapToAddressResponse(address);
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> getUserAddresses(User user) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToAddressResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAddress(User user, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));
        addressRepository.delete(address);
    }

    private AddressResponse mapToAddressResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .receiverName(address.getReceiverName())
                .phoneNumber(address.getPhoneNumber())
                .province(address.getProvince())
                .district(address.getDistrict())
                .ward(address.getWard())
                .streetAddress(address.getStreetAddress())
                .fullAddress(address.getFullAddress())
                .postalCode(address.getPostalCode())
                .isDefault(address.getIsDefault())
                .addressType(address.getAddressType())
                .build();
    }
}

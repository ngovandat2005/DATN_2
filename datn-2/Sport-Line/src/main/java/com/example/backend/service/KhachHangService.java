package com.example.backend.service;

import com.example.backend.dto.KhachHangResponseDTO;
import com.example.backend.entity.KhachHang;
import com.example.backend.repository.KhachHangRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class KhachHangService {

    @Autowired
    private KhachHangRepository khachHangRepository;

    private KhachHangResponseDTO convertDTO(KhachHang kh){
      return new KhachHangResponseDTO(
              kh.getId(),
              kh.getTenKhachHang(),
              kh.getEmail(),
              kh.getNgaySinh(),
              kh.getDiaChi(),
              kh.getSoDienThoai(),
              kh.getTrangThai(),
              kh.getMaThongBao(),
              kh.getThoiGianThongBao()
      );
    }

    public List<KhachHangResponseDTO> findAll(){
        return khachHangRepository.findAll().stream()
                .map(khachHang -> new KhachHangResponseDTO(
                        khachHang.getId(),
                        khachHang.getTenKhachHang(),
                        khachHang.getEmail(),
                        khachHang.getNgaySinh(),
                        khachHang.getDiaChi(),
                        khachHang.getSoDienThoai(),
                        khachHang.getTrangThai(),
                        khachHang.getMaThongBao(),
                        khachHang.getThoiGianThongBao()
                ))
                .toList();
    }

    public KhachHangResponseDTO findAllbyid(int id) {
        return khachHangRepository.findById(id)
                .map(khachHang -> new KhachHangResponseDTO(
                        khachHang.getId(),
                        khachHang.getTenKhachHang(),
                        khachHang.getEmail(),
                        khachHang.getNgaySinh(),
                        khachHang.getDiaChi(),
                        khachHang.getSoDienThoai(),
                        khachHang.getTrangThai(),
                        khachHang.getMaThongBao(),
                        khachHang.getThoiGianThongBao()
                ))
                .orElse(null);
    }

    public KhachHangResponseDTO create(KhachHangResponseDTO dto) {
        if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) {
            if (khachHangRepository.findByEmail(dto.getEmail().trim()).isPresent()) {
                throw new RuntimeException("Email đã tồn tại!");
            }
        }
        if (dto.getSoDienThoai() != null && !dto.getSoDienThoai().trim().isEmpty()) {
            if (khachHangRepository.findBySoDienThoai(dto.getSoDienThoai().trim()).isPresent()) {
                throw new RuntimeException("Số điện thoại đã tồn tại!");
            }
        }

        KhachHang kh = new KhachHang();
        kh.setTenKhachHang(dto.getTenKhachHang());
        kh.setEmail(dto.getEmail() != null ? dto.getEmail().trim() : null);
        kh.setNgaySinh(dto.getNgaySinh());
        kh.setDiaChi(dto.getDiaChi());
        kh.setSoDienThoai(dto.getSoDienThoai() != null ? dto.getSoDienThoai().trim() : null);
        kh.setTrangThai(dto.getTrangThai());
        kh.setMaThongBao(dto.getMaThongBao());
        kh.setThoiGianThongBao(dto.getThoiGianThongBao());
        return convertDTO(khachHangRepository.save(kh));
    }

    public Boolean deleteById(int id) {
        Optional<KhachHang> optional = khachHangRepository.findById(id);
        if (optional.isPresent()) {
            KhachHang kh = optional.get();
            kh.setTrangThai(false);
            khachHangRepository.save(kh);
            return true;
        }
        return false;
    }

    public KhachHangResponseDTO update(int id, KhachHangResponseDTO dto) {
        return khachHangRepository.findById(id)
                .map(kh -> {
                    if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) {
                        Optional<KhachHang> duplicateEmail = khachHangRepository.findByEmail(dto.getEmail().trim());
                        if (duplicateEmail.isPresent() && !duplicateEmail.get().getId().equals(id)) {
                            throw new RuntimeException("Email đã tồn tại!");
                        }
                    }
                    if (dto.getSoDienThoai() != null && !dto.getSoDienThoai().trim().isEmpty()) {
                        Optional<KhachHang> duplicatePhone = khachHangRepository.findBySoDienThoai(dto.getSoDienThoai().trim());
                        if (duplicatePhone.isPresent() && !duplicatePhone.get().getId().equals(id)) {
                            throw new RuntimeException("Số điện thoại đã tồn tại!");
                        }
                    }

                    kh.setTenKhachHang(dto.getTenKhachHang());
                    kh.setEmail(dto.getEmail() != null ? dto.getEmail().trim() : null);
                    kh.setNgaySinh(dto.getNgaySinh());
                    kh.setDiaChi(dto.getDiaChi());
                    kh.setSoDienThoai(dto.getSoDienThoai() != null ? dto.getSoDienThoai().trim() : null);
                    kh.setTrangThai(dto.getTrangThai());
                    kh.setMaThongBao(dto.getMaThongBao());
                    kh.setThoiGianThongBao(dto.getThoiGianThongBao());
                    return convertDTO(khachHangRepository.save(kh));
                })
                .orElse(null);
    }
}

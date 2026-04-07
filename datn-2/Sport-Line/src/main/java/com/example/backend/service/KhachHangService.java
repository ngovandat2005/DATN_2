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
        Optional<KhachHang> existing = khachHangRepository.findBySoDienThoai(dto.getSoDienThoai());
        if (existing.isPresent()) {
            throw new RuntimeException("Số điện thoại đã tồn tại!");
        }

        KhachHang kh = new KhachHang();
        kh.setTenKhachHang(dto.getTenKhachHang());
        kh.setEmail(dto.getEmail());
        kh.setNgaySinh(dto.getNgaySinh());
        kh.setDiaChi(dto.getDiaChi());
        kh.setSoDienThoai(dto.getSoDienThoai());
        kh.setTrangThai(dto.getTrangThai());
        kh.setMaThongBao(dto.getMaThongBao());
        kh.setThoiGianThongBao(dto.getThoiGianThongBao());
        return convertDTO(khachHangRepository.save(kh));
    }

    public Boolean deleteById(int id) {
        if (khachHangRepository.existsById(id)) {
            khachHangRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public KhachHangResponseDTO update(int id, KhachHangResponseDTO dto) {
        return khachHangRepository.findById(id)
                .map(kh -> {
                    kh.setTenKhachHang(dto.getTenKhachHang());
                    kh.setEmail(dto.getEmail());
                    kh.setNgaySinh(dto.getNgaySinh());
                    kh.setDiaChi(dto.getDiaChi());
                    kh.setSoDienThoai(dto.getSoDienThoai());
                    kh.setTrangThai(dto.getTrangThai());
                    kh.setMaThongBao(dto.getMaThongBao());
                    kh.setThoiGianThongBao(dto.getThoiGianThongBao());
                    return convertDTO(khachHangRepository.save(kh));
                })
                .orElse(null);
    }
}
